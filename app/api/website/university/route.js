import { connectMongoDB } from "@/libs/mongodb";
import Web from "@/models/webSchema";
import mongoose from 'mongoose';


export async function GET(req, { params }) {
    await connectMongoDB();

    try {
        // const universityList = await Web.find({type: 'university'}).populate('university_id');
        const universityList = await Web.find({type: 'University'})
        console.log(universityList);
        
        return new Response(JSON.stringify({ success: true, data: universityList }), {
            status: 200
        });
    } catch (error) {
        return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
        
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