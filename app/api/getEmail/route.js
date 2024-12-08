import Website from '@/models/webSchema';
import Saran from "@/models/saranSchema";
import Department from "@/models/departementSchema";
import User from "@/models/userSchema";
import { connectMongoDB } from "@/libs/mongodb";
import { NextResponse } from 'next/server';

export async function GET(req) {
    await connectMongoDB();
    const url = new URL(req.url);
    const type = url.searchParams.get('type');
    const getEmail = url.searchParams.get('link');

    try {

        const web = await Website.findOne({ link_advice: getEmail });
        if (!web) {
            return new NextResponse(JSON.stringify({ success: false, message: "Data website tidak ditemukan" }), {
                status: 404,
            });
        }

        const departement = await Department.findOne({ _id: web.ref_id });
        if (!departement) {
            return new NextResponse(JSON.stringify({ success: false, message: "Data departemen tidak ditemukan" }), {
                status: 404,
            });
        }

        let user;
        if (type !== 'Mahasiswa') {
            user = await User.find({
                $or: [
                    { role: `Admin ${departement.name}` },
                    { role: 'Super Admin' }
                ]
            });            
        } else {
            user = await User.find({
                $or: [
                    { role: `Admin ${departement.name}` },
                    { role: 'Mahasiswa' },
                    { role: 'Super Admin' }
                ]
            });
        }

        if (!user) {
            return new NextResponse(JSON.stringify({ success: false, message: "Data user tidak ditemukan" }), {
                status: 404,
            });
        }

        const emailList = user.map((user) => user.email);
        return new NextResponse(JSON.stringify({ success: true, message: "Data email berhasil di ambil", data: emailList }), {
            status: 200,
        });
    } catch (error) {
        console.error('Error:', error);
        return new NextResponse(JSON.stringify({ success: false, message: "Terjadi kesalahan saat mengambil data", error: error.message }), {
            status: 500,
        });
    }
}
