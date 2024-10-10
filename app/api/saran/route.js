import { connectMongoDB } from "@/libs/mongodb";
import GroupSaran from '@/models/groupSaranSchema';
import Saran from "@/models/saranSchema";
import User from "@/models/userSchema";
import mongoose from "mongoose";

export async function GET(req) {
    await connectMongoDB();
    const url = new URL(req.url);
    const link = url.searchParams.get('link');
    const id = url.searchParams.get('id');
    const sid = url.searchParams.get('sid');
    
    try {
        let groupSaran;

        if (link) {
            groupSaran = await GroupSaran.findOne({ link: link });
        } else if (id && mongoose.Types.ObjectId.isValid(id)) {
            groupSaran = await GroupSaran.findById(id);
        } else if (sid && mongoose.Types.ObjectId.isValid(sid)) {
            const saran = await Saran.findById(sid).populate('created_by', 'name profilePicture'); 
            if (!saran) {
                return new Response(JSON.stringify({
                    success: false,
                    message: "Saran tidak ditemukan",
                    data: null
                }), {
                    status: 404,
                });
            }


            return new Response(JSON.stringify({ success: true, message: "Saran berhasil diambil", data: saran }), {
                status: 200,
            });
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

        const saranList = await Saran.find({ groupSaranId: groupSaran._id }).populate('created_by', 'name profilePicture');

        return new Response(JSON.stringify({ success: true, message: "Saran berhasil diambil", data: saranList }), {
            status: 200,
        });
    } catch (error) {
        console.error('Error:', error);
        return new Response(JSON.stringify({ success: false, message: "Terjadi kesalahan saat mengambil data", error: error.message }), {
            status: 500,
        });
    }
}

export async function POST(req, res) {
    await connectMongoDB();

    const url = new URL(req.url); // Ambil URL
    const link = url.searchParams.get('link');

    const { title, description, userId } = await req.json();

    if (!link) {
        return new Response(JSON.stringify({ message: "Parameter 'link' tidak ditemukan" }), {
            status: 400,
        });
    }

    if (!userId) {
        return new Response(JSON.stringify({ message: "User ID is required" }), {
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

        const user = await User.findById(userId);
        if (!user) {
            return new Response(JSON.stringify({ message: "User tidak ditemukan" }), {
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
            link: link,
            created_by: userId,
        });

        await newSaran.save();

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

