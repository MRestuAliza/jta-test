import { connectMongoDB } from "@/libs/mongodb";
import GroupSaran from '@/models/groupSaranSchema';
import Saran from "@/models/saranSchema";
import mongoose from "mongoose";

export async function GET(req) {
    await connectMongoDB();
    const url = new URL(req.url); // Ambil URL
    const link = url.searchParams.get('link');
    const id = url.searchParams.get('id');

    try {
        let groupSaran;

        if (link) {
            groupSaran = await GroupSaran.findOne({ link: link });
        } else if (id && mongoose.Types.ObjectId.isValid(id)) {
            groupSaran = await GroupSaran.findById(id);
        } else {
            return new Response(JSON.stringify({
                success: false,
                message: "Parameter 'link' atau 'id' tidak valid",
                data: null
            }), {
                status: 400,
            });
        }

        if (!groupSaran) {
            return new Response(JSON.stringify({
                success: false,
                message: "Group Saran tidak ditemukan",
                data: null
            }), {
                status: 404,
            });
        }

        // Ambil semua saran berdasarkan groupSaranId
        const saranList = await Saran.find({ groupSaranId: groupSaran._id });

        return new Response(JSON.stringify({ success: true, data: saranList }), {
            status: 200,
        });
    } catch (error) {
        console.error('Error:', error);
        return new Response(JSON.stringify({ success: false, error: error.message }), {
            status: 500,
        });
    }
}

export async function POST(req, res) {
    await connectMongoDB();

    const url = new URL(req.url); // Ambil URL
    const link = url.searchParams.get('link');

    const { title, description } = await req.json();

    if (!link) {
        return new Response(JSON.stringify({ message: "Parameter 'link' tidak ditemukan" }), {
            status: 400,
        });
    }

    try {
        // Cari group saran berdasarkan link
        const groupSaran = await GroupSaran.findOne({ link: link });
        if (!groupSaran) {
            return new Response(JSON.stringify({ message: "Group Saran tidak ditemukan" }), {
                status: 404,
            });
        }

        // Ambil ID group saran
        const groupSaranId = groupSaran._id;

        // Buat saran baru
        const newSaran = new Saran({
            groupSaranId: groupSaranId,
            title: title,
            description: description,
            saran: 'new',
        });

        await newSaran.save(); // Simpan saran baru

        return new Response(JSON.stringify({ success: true, data: newSaran }), {
            status: 200,
        });
    } catch (error) {
        console.error('Error saat mengirim saran:', error);
        return res.status(500).json({ message: 'Terjadi kesalahan' });
    }
}


export async function PATCH(req) {
    await connectMongoDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    // Ambil body dari request untuk mendapatkan status
    const body = await req.json();
    const { status } = body; // Mengambil status dari body request

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return new Response(
            JSON.stringify({
                success: false,
                message: "Invalid ID format",
                data: null,
            }),
            {
                status: 400,
            }
        );
    }

    try {
        // Validasi status yang diizinkan
        const allowedStatuses = ["new", "work in progress", "done", "cancelled"];
        if (!allowedStatuses.includes(status)) {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: "Invalid status value",
                }),
                {
                    status: 400,
                }
            );
        }

        // Cari dan perbarui status saran berdasarkan ID
        const updatedSaran = await Saran.findByIdAndUpdate(
            id,
            { status: status, updated_at: Date.now() }, // Mengubah status dan waktu update
            { new: true } // Mengembalikan data yang baru setelah update
        );

        if (!updatedSaran) {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: "Saran not found",
                }),
                {
                    status: 404,
                }
            );
        }

        return new Response(
            JSON.stringify({ success: true, data: updatedSaran }),
            {
                status: 200,
            }
        );
    } catch (error) {
        return new Response(
            JSON.stringify({
                message: "Internal Server Error",
                error: error.message,
            }),
            {
                status: 500,
            }
        );
    }
}

