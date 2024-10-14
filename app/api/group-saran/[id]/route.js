import { connectMongoDB } from "@/libs/mongodb";
import GroupSaran from "@/models/groupSaranSchema";
import Saran from "@/models/saranSchema";
import mongoose from "mongoose";

export async function GET(request, { params }) {
    const { id } = params;
    await connectMongoDB();

    try {
        let adviceGroup;
        
        if (mongoose.Types.ObjectId.isValid(id)) {
            const objectIdAdviceGroup = new mongoose.Types.ObjectId(id);
            adviceGroup = await GroupSaran.findById(objectIdAdviceGroup);
        } else {
            adviceGroup = await GroupSaran.findOne({ link: id });
        }

        // Jika tidak menemukan group saran
        if (!adviceGroup) {
            return new Response(JSON.stringify({ success: false, error: "Advice group not found" }), {
                status: 404,
            });
        }

        // Hitung jumlah saran terkait dengan group saran tersebut
        const saranCount = await Saran.countDocuments({ groupSaranId: adviceGroup._id });

        return new Response(JSON.stringify({ success: true, data: adviceGroup, count: saranCount }), {
            status: 200,
        });
    } catch (error) {
        return new Response(JSON.stringify({ success: false, error: error.message }), {
            status: 500,
        });
    }
}
