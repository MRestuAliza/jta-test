import { connectMongoDB } from "@/libs/mongodb";
import Prodi from "@/models/prodiSchema";
import mongoose from "mongoose";
import Joi from 'joi';
import validator from 'validator';

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

export async function PATCH(req) {
  await connectMongoDB();

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return new Response(JSON.stringify({
      success: false,
      message: "Invalid ID format",
      data: null
    }), {
      status: 400,
    });
  }

  try {
    const { name } = await req.json();

    const schema = Joi.object({
      name: Joi.string().min(3).max(100).required(),
    });

    const { error } = schema.validate({ name });
    if (error) {
      return new Response(JSON.stringify({
        success: false,
        message: error.message,
        data: null
      }), {
        status: 400,
      });
    }

    const sanitizedData = {
      name: validator.escape(name)
    };

    const updatedFakultas = await Prodi.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id) },
      sanitizedData,
      { new: true }
    );

    if (!updatedFakultas) {
      return new Response(JSON.stringify({
        success: false,
        message: "Fakultas not found",
        data: null
      }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: "Data fakultas berhasil diperbarui",
      data: updatedFakultas
    }), {
      status: 200,
    });
  } catch (error) {
    console.error(error.message);
    return new Response(JSON.stringify({
      success: false,
      message: "Internal server error",
      data: null,
      error: error.message
    }), {
      status: 500,
    });
  }
}

