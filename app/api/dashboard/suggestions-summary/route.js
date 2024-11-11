import { connectMongoDB } from "@/libs/mongodb";
import Website from "@/models/tes/webSchema";
// import GroupSaran from "@/models/tes/groupSaranSchema";
import Saran from "@/models/tes/saranSchema";
import Departement from "@/models/tes/departementSchema";

export async function GET(req) {
    await connectMongoDB();

    try {
        const websites = await Website.find();

        const saranCounts = {};
        for (const website of websites) {
            const groupSarans = await Website.find({ _id: website._id });
            let totalSaranCount = 0;

            for (const groupSaran of groupSarans) {
                const saranCount = await Saran.countDocuments({ webId: groupSaran._id });
                totalSaranCount += saranCount;
            }

            let name;
            if (website.ref_model === "Universitas") {
                name = "Universitas";
            } else if (website.ref_model === "Fakultas" || website.ref_model === "Prodi") {
                const department = await Departement.findById(website.ref_id);
                name = department ? `${department.type} ${department.name}` : "Unknown";
            }

            saranCounts[name] = (saranCounts[name] || 0) + totalSaranCount;
        }

        return new Response(JSON.stringify({
            success: true,
            message: "Jumlah saran berhasil dihitung",
            data: saranCounts
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error("Error counting saran:", error);
        return new Response(JSON.stringify({
            success: false,
            message: "Gagal menghitung jumlah saran",
            error: error.message
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
}