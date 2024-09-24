import { connectMongoDB } from "@/libs/mongodb";
import Saran from "@/models/saranSchema";

export async function POST(req, res) {
    await connectMongoDB();

    try {
        // Ambil data dari body request
        const { title, description, groupSaranId } = await req.json(); // Menggunakan await req.json() untuk mendapatkan data body

        if (!title || !description || !groupSaranId) {
            return res.status(400).json({ message: "Title, description, and groupSaranId are required" });
        }

        // Buat saran baru
        const newSaran = await Saran.create({
            title,
            description,
            groupSaranId,
        });

        return new Response(JSON.stringify({ success: true, data: newSaran }), {
            status: 200,
        });
    } catch (error) {
        // Tangani kesalahan dan kembalikan respons kesalahan
        // return res.status(500).json({ success: false, error: error.message });
        return new Response(JSON.stringify({ message: "Internal Server Error", error: error.message }), {
            status: 500,
          });
    }
}
