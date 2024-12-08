import { connectMongoDB } from "@/libs/mongodb";
import Saran from '@/models/saranSchema';

export async function GET(req) {
    await connectMongoDB();
    const url = new URL(req.url);
    const saranId = url.searchParams.get("saranId");
    const userId = url.searchParams.get("userId");

    try {
        const saran = await Saran.findById(saranId);
        if (!saran) {
            return new Response(JSON.stringify({ message: "Saran not found" }), { status: 404 });
        }

        const userVote = saran.votes.find(vote => vote.userId === userId)?.voteType || 0;
        return new Response(JSON.stringify({ voteScore: saran.voteScore, userVote }), {
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
    const { saranId, userId, voteType } = await req.json();
    try {
        const saran = await Saran.findById(saranId);
        const existingVoteIndex = saran.votes.findIndex(vote => vote.userId === userId);

        if (existingVoteIndex > -1) {
            if (saran.votes[existingVoteIndex].voteType === voteType) {
                saran.voteScore -= voteType;
                saran.votes.splice(existingVoteIndex, 1);
            } else {
                saran.voteScore += 2 * voteType;
                saran.votes[existingVoteIndex].voteType = voteType;
            }
        } else {
            saran.votes.push({ userId, voteType });
            saran.voteScore += voteType;
        }

        await saran.save();
        return new Response(JSON.stringify({ success: true, voteScore: saran.voteScore, userVote: voteType }), {
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
