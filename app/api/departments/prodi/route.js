import { connectMongoDB } from "@/libs/mongodb";
import Prodi from "@/models/prodiSchema";

// Handle GET request
export async function GET(req, res) {
  await connectMongoDB();

  try {
    const prodiList = await Prodi.find({}).populate('fakultas_id');
    return new Response(JSON.stringify({ success: true, data: prodiList }), {
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false }), { status: 400 });
  }
}

// Handle POST request
export async function POST(req, res) {
  await connectMongoDB();

  try {
    const body = await req.json();
    const prodi = await Prodi.create(body);
    return new Response(JSON.stringify({ success: true, data: prodi }), {
      status: 201,
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false }), { status: 400 });
  }
}
