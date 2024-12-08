import { connectMongoDB } from "@/libs/mongodb";
import Saran from "@/models/saranSchema";
import User from "@/models/userSchema";
import Web from "@/models/webSchema"; 

export async function GET(req) {
    await connectMongoDB();

    try {
        const latestSuggestions = await Saran.find().sort({ created_at: -1 }).limit(5).lean();

        const suggestionsWithUserNames = await Promise.all(
            latestSuggestions.map(async (saran) => {
                const user = await User.findById(saran.created_by).select("name");
                const group = await Web.findById(saran.webId).select("name");
                console.log("saran", group);
                return {
                    ...saran,
                    created_by: user ? user.name : "Unknown User",
                    group_name: group ? group.name : "Unknown Group"
                };
            })
        );


        return new Response(JSON.stringify({
            success: true,
            message: "5 saran terbaru berhasil diambil",
            data: suggestionsWithUserNames
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error("Error fetching latest suggestions:", error);
        return new Response(JSON.stringify({ 
            success: false, 
            message: "Gagal mengambil saran terbaru",
            error: error.message 
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
}
