import { connectMongoDB } from "@/libs/mongodb";
import GroupSaran from "@/models/groupSaranSchema";
import Saran from "@/models/saranSchema";
import { customAlphabet } from 'nanoid';
import Fakultas from "@/models/fakultasSchema"; // Impor model Fakultas
import Universitas from "@/models/universitasSchema"; // Impor model Universitas
import Prodi from "@/models/prodiSchema";
import mongoose from "mongoose";
import { NextResponse } from 'next/server'
import Joi from 'joi';
import validator from 'validator';
export async function GET(request, { params }) {
    const { id } = params; // Extract id from params
    await connectMongoDB();

    try {
        // Validasi ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return new Response(JSON.stringify({ success: false, error: "Invalid ID" }), {
                status: 400,
            });
        }

        const objectIdAdviceGroup = new mongoose.Types.ObjectId(id);
        const adviceGroup = await GroupSaran.findById(objectIdAdviceGroup);

        const saranCount = await Saran.countDocuments({ groupSaranId: objectIdAdviceGroup });

        

        if (!adviceGroup) {
            return new Response(JSON.stringify({ success: false, error: "Advice group not found" }), {
                status: 404,
            });
        }

        return new Response(JSON.stringify({ success: true, data: adviceGroup, count: saranCount }), {
            status: 200,
        });
    } catch (error) {
        return new Response(JSON.stringify({ success: false, error: error.message }), {
            status: 500,
        });
    }
}