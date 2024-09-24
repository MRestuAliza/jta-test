import { connectMongoDB } from "@/libs/mongodb";
import Website from "@/models/webSchema";
import Prodi from "@/models/prodiSchema";
import mongoose from 'mongoose';

export async function GET(req, { params }) {
    const { id } = params;

    await connectMongoDB();

    try {
        const objectIdFakultas = new mongoose.Types.ObjectId(id);

        const websites = await Website.find({ prodi_id: objectIdFakultas }).populate('prodi_id');
        // const prodi = await Prodi.find({ prodi_id: objectIdFakultas }).populate('prodi_id');

        // const allData = {
        //     websites,
        //     prodi,
        // };
        return new Response(JSON.stringify({ success: true, data: websites }), {
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
        const newWebsite = await Website.create({
            name: body.name,
            link: body.link,
            type: body.type,
            university_id: body.university_id,
            fakultas_id: body.fakultas_id,
            prodi_id: body.prodi_id,
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