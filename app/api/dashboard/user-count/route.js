import { connectMongoDB } from "@/libs/mongodb";
import User from "@/models/userSchema";

export async function GET(req) {
    await connectMongoDB();

    try {
        const adminCount = await User.countDocuments({ role: /^Admin(?!.*Super)/i });
        const superAdminCount = await User.countDocuments({ role: "Super Admin" });
        const mahasiswaCount = await User.countDocuments({ role: "Mahasiswa" });

        const result = {
            admin: adminCount,
            superAdmin: superAdminCount,
            mahasiswa: mahasiswaCount
        };

        return new Response(JSON.stringify({
            success: true,
            message: "Jumlah setiap role berhasil diambil",
            data: result
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error("Error fetching role counts:", error);
        return new Response(JSON.stringify({ 
            success: false, 
            message: "Gagal mengambil jumlah setiap role",
            error: error.message 
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
}
