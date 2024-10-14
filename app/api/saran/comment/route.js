import { connectMongoDB } from "@/libs/mongodb";
import Saran from "@/models/saranSchema";
import Comment from "@/models/commentSchema";
import mongoose from "mongoose";
import User from "@/models/userSchema";

export async function GET(req, res) {
    await connectMongoDB();

    const url = new URL(req.url);
    const saranId = url.searchParams.get('saran_id');

    if (!saranId) {
        return new Response(JSON.stringify({ message: "Parameter 'saran_id' tidak ditemukan" }), {
            status: 400,
        });
    }

    try {
        const saran = await Saran.findById(saranId);
        if (!saran) {
            return new Response(JSON.stringify({ message: "Saran tidak ditemukan" }), {
                status: 404,
            });
        }

        const comments = await Comment.find({ saran_id: saranId }).populate('created_by', 'name profilePicture');  // Mengambil informasi pengguna yang membuat komentar

        return new Response(JSON.stringify({ success: true, data: comments }), {
            status: 200,
        });
    } catch (error) {
        console.error('Error saat mendapatkan komentar:', error);
        return new Response(JSON.stringify({ message: 'Terjadi kesalahan' }), {
            status: 500,
        });
    }
}

export async function POST(req, res) {
    await connectMongoDB();

    const url = new URL(req.url);
    const id = url.searchParams.get('saran_id');

    const { content, userId } = await req.json();

    if (!id) {
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
        const Advice = await Saran.findById(id);
        if (!Advice) {
            return new Response(JSON.stringify({ message: "Saran tidak ditemukan" }), {
                status: 404,
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return new Response(JSON.stringify({ message: "User tidak ditemukan" }), {
                status: 404,
            });
        }

        const newComment = new Comment({
            saran_id: Advice,
            content: content,
            created_by: userId,
        });

        await newComment.save();

        return new Response(JSON.stringify({ success: true, data: newComment }), {
            status: 200,
        });
    } catch (error) {
        console.error('Error saat mengirim saran:', error);
        return res.status(500).json({ message: 'Terjadi kesalahan' });
    }
}