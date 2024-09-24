import { connectMongoDB } from "@/libs/mongodb";
import Fakultas from "@/models/fakultasSchema";
import Prodi from "@/models/prodiSchema";
import Website from "@/models/webSchema";
import mongoose from "mongoose";

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

export async function DELETE(request) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return new Response(JSON.stringify({ message: "ID is required" }), {
        status: 400,
      });
    }

    await connectMongoDB();

    const fakultas = await Fakultas.findByIdAndDelete(id, { session });
    if (!fakultas) {
      await session.abortTransaction();
      session.endSession();
      return new Response(JSON.stringify({ message: "Fakultas not found" }), {
        status: 404,
      });
    }

    // Hapus semua prodi yang terkait dengan fakultas
    await Prodi.deleteMany({ fakultas_id: id }, { session });

    // Hapus semua website yang terkait dengan fakultas
    await Website.deleteMany({ fakultas_id: id }, { session });

    await session.commitTransaction();
    session.endSession();

    return new Response(JSON.stringify({ message: "Fakultas, Prodi, and Websites deleted" }), {
      status: 200,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error deleting fakultas:", error);
    return new Response(JSON.stringify({ message: "Internal Server Error", error: error.message }), {
      status: 500,
    });
  }
}

