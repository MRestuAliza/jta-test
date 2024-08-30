import { connectMongoDB } from "@/libs/mongodb";
import Universitas from "@/models/universitasSchema";

export async function GET(req, res) {
  await connectMongoDB();

  try {
    // const universities = await Universitas.find({ university_id: { $exists: true, $ne: null } });
    const universities = await Universitas.find({})
    console.log(universities);
    
    return new Response(JSON.stringify({ success: true, data: universities }), {
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: error.message }), { status: 400 });
  }
}

export async function POST(req, res) {
  await connectMongoDB();

  try {
    const body = await req.json();
    const university = await Universitas.create(body);
    return new Response(JSON.stringify({ success: true, data: university }), {
      status: 201,
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false }), { status: 400 });
  }
}
