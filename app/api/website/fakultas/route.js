import { connectMongoDB } from "@/libs/mongodb";
import Web from "@/models/webSchema";
import Prodi from "@/models/prodiSchema";
import mongoose from 'mongoose';


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