import { connectMongoDB } from "@/libs/mongodb";
import Saran from "@/models/saranSchema";
import mongoose from "mongoose";

export async function GET() {
    await connectMongoDB();

    try {
        const currentDate = new Date();
        const startOfCurrentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const startOfLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);

        // Hitung total saran pada bulan ini
        const totalSaran = await Saran.countDocuments({
            created_at: { $gte: startOfCurrentMonth }
        });

        // Hitung total saran pada bulan lalu
        const totalSaranLastMonth = await Saran.countDocuments({
            created_at: { $gte: startOfLastMonth, $lt: startOfCurrentMonth }
        });

        return new Response(JSON.stringify({
            success: true,
            total: totalSaran,
            totalLastMonth: totalSaranLastMonth
        }), {
            status: 200,
        });
    } catch (error) {
        return new Response(JSON.stringify({ success: false, error: error.message }), {
            status: 500,
        });
    }
}
