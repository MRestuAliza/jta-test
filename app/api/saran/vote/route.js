import { connectMongoDB } from "@/libs/mongodb";
import Vote from '@/models/voteSchema';
import Saran from '@/models/saranSchema';
import mongoose from "mongoose";
import GroupSaran from '@/models/groupSaranSchema';


export async function GET(req) {
    await connectMongoDB();
    const url = new URL(req.url);
    const link = url.searchParams.get('link');
    const userId = url.searchParams.get('userId');  // Dapatkan userId dari query params

    try {
        let groupSaran = await GroupSaran.findOne({ link: link })
        if (!groupSaran) {
            return new Response(JSON.stringify({
                success: false,
                message: "Group Saran tidak ditemukan",
                data: null
            }), {
                status: 404,
            });
        }

        const saranList = await Saran.find({ groupSaranId: groupSaran._id }).populate('created_by', 'name profilePicture');

        // Ambil semua vote yang diberikan oleh user terkait dengan saran dalam group ini
        const userVotes = await Vote.find({ userId: userId, saranId: { $in: saranList.map(saran => saran._id) } });

        // Mapping userVotes menjadi object dengan key saranId dan value tipe vote (upvote/downvote)
        const userVotesMap = userVotes.reduce((map, vote) => {
            map[vote.saranId] = vote.voteType;
            return map;
        }, {});

        return new Response(JSON.stringify({
            success: true,
            data: {
                saranList: saranList,
                userVotes: userVotesMap // Kembalikan status vote user
            }
        }), {
            status: 200,
        });
    } catch (error) {
        console.error('Error:', error);
        return new Response(JSON.stringify({ success: false, error: error.message }), {
            status: 500,
        });
    }
}

export async function PATCH(req) {
    await connectMongoDB();
    const { searchParams } = new URL(req.url);
    const saranId = searchParams.get("saranId");
    const body = await req.json();
    const { userId, voteType } = body;

    if (!mongoose.Types.ObjectId.isValid(saranId)) {
        return new Response(
            JSON.stringify({ success: false, message: "Invalid ID format" }),
            { status: 400 }
        );
    }

    try {
        const existingVote = await Vote.findOne({ saranId: saranId, userId: userId });
        let voteChange = 0;

        if (existingVote) {
            if (existingVote.voteType === voteType) {
                // Jika voteType sama, hapus vote untuk mengembalikan ke keadaan semula
                await Vote.deleteOne({ _id: existingVote._id });
                voteChange = voteType === 'upvote' ? -1 : 1;
            } else {
                // Jika voteType berbeda, perbarui voteType
                voteChange = voteType === 'upvote' ? 1 : -1;
                existingVote.voteType = voteType;
                await existingVote.save();
            }
        } else {
            // Jika belum ada vote, tambahkan vote baru
            const newVote = new Vote({
                saranId: saranId,
                userId: userId,
                voteType: voteType,
            });

            voteChange = voteType === 'upvote' ? 1 : -1; 
            await newVote.save();
        }

        const updatedSaran = await Saran.findByIdAndUpdate(
            saranId,
            { $inc: { voteScore: voteChange } },
            { new: true }
        );

        if (!updatedSaran) {
            return new Response(
                JSON.stringify({ success: false, message: "Saran not found" }),
                { status: 404 }
            );
        }

        return new Response(
            JSON.stringify({ success: true, data: updatedSaran }),
            { status: 200 }
        );
    } catch (error) {
        return new Response(
            JSON.stringify({ message: "Internal Server Error", error: error.message }),
            { status: 500 }
        );
    }
}

