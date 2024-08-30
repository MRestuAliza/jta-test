import { connectMongoDB } from "@/libs/mongodb";
import Prodi from "@/models/prodiSchema";
import mongoose from 'mongoose';

export async function GET(req, { params }) {
  const { id } = params;

  await connectMongoDB();

  try {
    console.log('Received id from URL:', id);
  
    const objectIdFakultas = new mongoose.Types.ObjectId(id);
    console.log('Searching for Prodi with fakultas_id:', objectIdFakultas);

    const prodiList = await Prodi.find({ fakultas_id: objectIdFakultas }).populate('fakultas_id');
    console.log(prodiList);

    if (!prodiList.length) {
      return new Response(JSON.stringify({ success: false, message: 'No programs found for this faculty' }), { status: 404 });
    }

    return new Response(JSON.stringify({ success: true, data: prodiList }), {
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}
