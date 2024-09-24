import { connectMongoDB } from "@/libs/mongodb";
import Prodi from "@/models/prodiSchema";
import Website from "@/models/webSchema";
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

export async function DELETE(req, { params }) {
  try {
    await connectMongoDB();

    const prodiId = params.id;

    const prodi = await Prodi.findById(prodiId);
    if (!prodi) {
      return new Response(JSON.stringify({ success: false, message: 'Prodi tidak ditemukan' }), { status: 404 });
    }

    // Mencari website yang terkait dengan prodiId
    const websites = await Website.find({ prodi_id: prodiId });

    if (websites.length > 0) {
      // Jika website yang terkait ditemukan, hapus website terlebih dahulu
      await Website.deleteMany({ prodi_id: prodiId });
    }

    // Hapus Prodi setelah website terkait (jika ada) dihapus
    await Prodi.findByIdAndDelete(prodiId);

    return new Response(JSON.stringify({ success: true, message: 'Prodi dan website terkait berhasil dihapus' }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ success: false, message: 'Gagal menghapus prodi atau website terkait', error: error.message }), { status: 500 });
  }
}
