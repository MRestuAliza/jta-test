import { connectMongoDB } from "@/libs/mongodb";
import Vote from '@/models/voteSchema';
import Saran from '@/models/saranSchema';
import mongoose from "mongoose";

export async function GET(req) {
    await connectMongoDB();
    const url = new URL(req.url);
    const saranId = url.searchParams.get('saranId');
    const userId = url.searchParams.get('userId'); 


    if (!mongoose.Types.ObjectId.isValid(saranId)) {
        return new Response(
            JSON.stringify({ success: false, message: "Invalid Saran ID format" }),
            { status: 400 }
        );
    }

    try {
    
        const saran = await Saran.findById(saranId);
        if (!saran) {
            return new Response(JSON.stringify({
                success: false,
                message: "Saran tidak ditemukan",
                data: null
            }), {
                status: 404,
            });
        }

    
        let userVote = null;
        if (userId) {
            const vote = await Vote.findOne({ userId: userId, saranId: saranId });
            if (vote) {
                userVote = vote.voteType;
            }
        }

        return new Response(JSON.stringify({
            success: true,
            data: {
                saran: saran,
                userVote: userVote
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
