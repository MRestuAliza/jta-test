import { connectMongoDB } from "@/libs/mongodb";
import Web from "@/models/webSchema";
import Prodi from "@/models/prodiSchema";
import mongoose from 'mongoose';

export async function GET(request) {
    await connectMongoDB();

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return new Response(JSON.stringify({ success: false, error: "Invalid ID format" }), {
                status: 400,
            });
        }

        // Gunakan find() untuk mengembalikan array
        const facultiesWeb = await Web.find({ fakultas_id: new mongoose.Types.ObjectId(id), type: 'Fakultas' });
        
        if (!facultiesWeb.length) {
            return new Response(JSON.stringify({ success: false, error: "Faculty Web not found" }), {
                status: 404,
            });
        }

        return new Response(JSON.stringify({ success: true, data: facultiesWeb }), {
            status: 200,
        });
    } catch (error) {
        return new Response(JSON.stringify({ success: false, error: error.message }), {
            status: 500,
        });
    }
}


export async function POST(req, res) {
    await connectMongoDB();

    try {
        const body = await req.json();
        const newWebsite = await Web.create({
            name: body.name,
            link: body.link,
            type: body.type,
            university_id: body.university_id,
            fakultas_id: body.fakultas_id,
        });

        return new Response(JSON.stringify({ success: true, data: newWebsite }), {
            status: 201,
        });
    } catch (error) {
        return new Response(JSON.stringify({ success: false, error: error.message }), {
            status: 500,
        });
    }
}

