import { connectMongoDB } from "@/libs/mongodb";
import Website from "@/models/webSchema";
import Fakultas from "@/models/fakultasSchema";
import mongoose from 'mongoose';

export async function GET(req, { params }) {
    const { id } = params;

    await connectMongoDB();

    try {
        const objectIdUniversity = new mongoose.Types.ObjectId(id);
        console.log("id university", objectIdUniversity);
        
        const websites = await Website.find({ university_id: objectIdUniversity });
        console.log(websites);
        
        const fakultas = await Fakultas.find({ university_id: objectIdUniversity })

        // Gabungkan hasil dari Website dan Fakultas
        const allData = {
            websites,
            fakultas,
        };

        return new Response(JSON.stringify({ success: true, data: allData }), {
            status: 200,
        });
    } catch (error) {
        return new Response(JSON.stringify({ success: false, error: error.message }), {
            status: 500,
        });
    }
}