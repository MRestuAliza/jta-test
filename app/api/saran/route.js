import { connectMongoDB } from "@/libs/mongodb";
import Saran from "@/models/saranSchema";
import mongoose from "mongoose";

export async function GET(req) {
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
        // Cari saran berdasarkan groupSaranId, gunakan find() atau findOne()
        const saranList = await Saran.find({ groupSaranId: new mongoose.Types.ObjectId(id) });

        return new Response(JSON.stringify({ success: true, data: saranList }), {
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
        // Ambil data dari body request
        const { title, description, groupSaranId } = await req.json(); 

        if (!title || !description || !groupSaranId) {
            return new Response(JSON.stringify({ message: "Title, description, and groupSaranId are required" }), {
                status: 400,
            });
        }

        const newSaran = await Saran.create({
            title,
            description,
            status: 'new',
            groupSaranId: new mongoose.Types.ObjectId(groupSaranId),
        });

        const saranWithStatus = newSaran.toObject({ getters: true, versionKey: false }); // Mengambil status
        console.log(saranWithStatus); // Tambahkan ini untuk debugging
        return new Response(JSON.stringify({ success: true, data: saranWithStatus }), {
            status: 200,
        });

    } catch (error) {
        return new Response(JSON.stringify({ message: "Internal Server Error", error: error.message }), {
            status: 500,
        });
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


        if (!mongoose.Types.ObjectId.isValid(id)) {
            return new Response(JSON.stringify({ success: false, message: "Invalid ID format" }), {
                status: 400,
            });
        }

        // Validasi status yang diizinkan
        const allowedStatuses = ['new', 'work in progress', 'done', 'cancelled'];
        if (!allowedStatuses.includes(status)) {
            return new Response(JSON.stringify({ success: false, message: "Invalid status value" }), {
                status: 400,
            });
        }

        // Cari dan perbarui status saran berdasarkan ID
        const updatedSaran = await Saran.findByIdAndUpdate(
            id,
            { status: status, updated_at: Date.now() }, // Mengubah status dan waktu update
            { new: true } // Mengembalikan data yang baru setelah update
        );

        if (!updatedSaran) {
            return new Response(JSON.stringify({ success: false, message: "Saran not found" }), {
                status: 404,
            });
        }

        return new Response(JSON.stringify({ success: true, data: updatedSaran }), {
            status: 200,
        });
    } catch (error) {
        return new Response(JSON.stringify({ message: "Internal Server Error", error: error.message }), {
            status: 500,
        });
    }
}