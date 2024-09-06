import { connectMongoDB } from "@/libs/mongodb";
import Fakultas from "@/models/fakultasSchema";

export async function GET(req, res) {
  await connectMongoDB();

  try {
    const faculties = await Fakultas.find({});
    return new Response(JSON.stringify({ success: true, data: faculties }), {
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
    const faculty = await Fakultas.create(body); 
    return new Response(JSON.stringify({ success: true, data: faculty }), {
      status: 201,
    });
  } catch (error) {
    return new Response(JSON.stringify({ Error: error }), { status: 400 });
  }
}
