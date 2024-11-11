import { connectMongoDB } from "@/libs/mongodb";
import { NextResponse } from "next/server";
import Comment from "@/models/tes/commentSchema";
import { v4 as uuidv4 } from 'uuid';
import Joi from 'joi';

const commentSchema = Joi.object({
    saran_id: Joi.string().required(),
    content: Joi.string().min(1).max(500).required(),
    ref_comment_id: Joi.string().allow(null).optional(),
    created_by: Joi.string().required(),
});

export async function GET(req) {
    await connectMongoDB();
    const url = new URL(req.url);
    const saranId = url.searchParams.get('saran_id');

    if (!saranId) {
        return new NextResponse(JSON.stringify({ success: false, message: "saran_id is required" }), {
            status: 400,
        });
    }

    try {
        const comments = await Comment.aggregate([
            {
                $match: { 
                    saran_id: saranId,
                    ref_comment_id: null
                }
            },
            {
                $lookup: {
                    from: "users", 
                    localField: "created_by", 
                    foreignField: "_id", 
                    as: "user_data" 
                }
            },
            {
                $lookup: {
                    from: "comments", 
                    localField: "_id", 
                    foreignField: "ref_comment_id", 
                    as: "replies" 
                }
            },
            {
                $unwind: {
                    path: "$replies",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "replies.created_by",
                    foreignField: "_id",
                    as: "replies_user_data"
                }
            },
            {
                $addFields: {
                    created_by: {
                        name: { $arrayElemAt: ["$user_data.name", 0] }, 
                        profile_picture: { $arrayElemAt: ["$user_data.profilePicture", 0] } 
                    },
                    "replies.created_by": {
                        name: { $arrayElemAt: ["$replies_user_data.name", 0] },
                        profile_picture: { $arrayElemAt: ["$replies_user_data.profilePicture", 0] }
                    }
                }
            },
            {
                $group: {
                    _id: "$_id", 
                    saran_id: { $first: "$saran_id" },
                    content: { $first: "$content" },
                    created_by: { $first: "$created_by" },
                    voteScore: { $first: "$voteScore" },
                    created_at: { $first: "$created_at" },
                    isComment: { $first: "$isComment" },
                    isReply: { $first: "$isReply" },
                    replies: { $push: "$replies" } 
                }
            },
            {
                $project: {
                    user_data: 0,
                    "replies_user_data": 0
                }
            },
            {
                $sort: { created_at: 1 } 
            }
        ]);

        if (!comments.length) {
            return new NextResponse(JSON.stringify({ success: false, message: "No comments found" }), {
                status: 404,
            });
        }

        return new NextResponse(JSON.stringify({ success: true, data: comments }), {
            status: 200,
        });

    } catch (error) {
        console.error("Error fetching comments:", error);
        return new NextResponse(JSON.stringify({ success: false, error: error.message }), {
            status: 500,
        });
    }
}




export async function POST(req) {
    await connectMongoDB();

    try {
        const body = await req.json();

        const { error, value } = commentSchema.validate(body);
        if (error) {
            return new NextResponse(
                JSON.stringify({ success: false, message: 'Invalid input', details: error.details }),
                { status: 400 }
            );
        }

        const newComment = {
            _id: uuidv4(),
            saran_id: value.saran_id,
            content: value.content,
            ref_comment_id: value.ref_comment_id || null,
            created_by: value.created_by,
            created_at: new Date(),
        };

        const comment = await Comment.create(newComment);

        return new NextResponse(JSON.stringify({ success: true, data: comment }), {
            status: 201,
        });

    } catch (error) {
        console.error('Error creating comment:', error);
        return new NextResponse(
            JSON.stringify({ success: false, message: 'Failed to create comment', error: error.message }),
            { status: 500 }
        );
    }
}
