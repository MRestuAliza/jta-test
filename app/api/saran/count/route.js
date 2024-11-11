import { connectMongoDB } from "@/libs/mongodb";
import Saran from "@/models/saranSchema";
import mongoose from "mongoose";

export async function GET() {
    await connectMongoDB();

    try {
        const currentDate = new Date();
        const startOfCurrentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const startOfLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
        const totalSaran = await Saran.countDocuments({
            created_at: { $gte: startOfCurrentMonth }
        });
        const totalSaranLastMonth = await Saran.countDocuments({
            created_at: { $gte: startOfLastMonth, $lt: startOfCurrentMonth }
        });


        const saranList = await Saran.find({});
        const statusCounts = {
            new: 0,
            'work in progress': 0,
            completed: 0,
            cancelled: 0,
        };

        saranList.forEach(saran => {
            if (saran.status === 'new') {
                statusCounts.new++;
            } else if (saran.status === 'work in progress') {
                statusCounts['work in progress']++;
            } else if (saran.status === 'completed') {
                statusCounts.completed++;
            } else if (saran.status === 'cancelled') {
                statusCounts.cancelled++;
            }
        });

        return new Response(JSON.stringify({
            success: true,
            total: totalSaran,
            statusCounts,
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
