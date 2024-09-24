import { connectMongoDB } from "@/libs/mongodb";
import Website from "@/models/webSchema";
import mongoose from 'mongoose';

export async function DELETE(request) {
    await connectMongoDB();

    try {
        const { searchParams } = new URL(request.url);
        const websiteId = searchParams.get("id");

        if (!mongoose.Types.ObjectId.isValid(websiteId)) {
            return new Response(JSON.stringify({ success: false, message: 'ID tidak valid' }), { status: 400 });
        }

        const web = await Website.findByIdAndDelete(websiteId);
        if (!web) {
            return new Response(JSON.stringify({ success: false, message: 'Website tidak ditemukan' }), { status: 404 });
        }

        return new Response(JSON.stringify({ success: true, message: 'Website berhasil dihapus' }), { status: 200 });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ success: false, message: 'Gagal menghapus website terkait', error: error.message }), { status: 500 });
    }
}