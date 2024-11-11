import { connectMongoDB } from "@/libs/mongodb";
import Saran from '@/models/tes/saranSchema';
import Comment from '@/models/tes/commentSchema';

export async function GET(req) {
    await connectMongoDB();
    const url = new URL(req.url);
    const commentId = url.searchParams.get("commentsId");
    const userId = url.searchParams.get("userId");

    try {
        const comments = await Comment.findById(commentId);
        if (!comments) {
            return new Response(JSON.stringify({ message: "Comments not found" }), { status: 404 });
        }

        const userVote = comments.votes.find(vote => vote.userId === userId)?.voteType || 0;
        return new Response(JSON.stringify({ voteScore: comments.voteScore, userVote }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        return new Response(JSON.stringify({ success: false, message: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}


export async function PATCH(req) {
    await connectMongoDB();
    const { commentsId, userId, voteType } = await req.json();
    try {
        const comment = await Comment.findById(commentsId);
        const existingVoteIndex = comment.votes.findIndex(vote => vote.userId === userId);

        if (existingVoteIndex > -1) {
            if (comment.votes[existingVoteIndex].voteType === voteType) {
                comment.voteScore -= voteType;
                comment.votes.splice(existingVoteIndex, 1);
            } else {
                comment.voteScore += 2 * voteType;
                comment.votes[existingVoteIndex].voteType = voteType;
            }
        } else {
            comment.votes.push({ userId, voteType });
            comment.voteScore += voteType;
        }

        await comment.save();
        return new Response(JSON.stringify({ success: true, voteScore: comment.voteScore, userVote: voteType, votes: comment.votes }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        return new Response(JSON.stringify({ success: false, message: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
