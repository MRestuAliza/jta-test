import { connectMongoDB } from "@/libs/mongodb";
import User from "@/models/userSchema";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const userRole = request.headers.get('X-User-Role');
        await connectMongoDB();

        let users;
        if (userRole === 'Super Admin') {
            users = await User.find(); // Mengambil semua pengguna
        } else if (userRole.includes('Admin')) {
            users = await User.find({ role: { $regex: 'Admin|Mahasiswa', $options: 'i' } }); // Mengambil pengguna dengan role admin dan user
        } else {
            return new NextResponse(JSON.stringify({ message: "Unauthorized" }), {
                status: 403,
                headers: {
                    'Content-Type': 'application/json', // Menambahkan header Content-Type
                },
            });
        }

        // Mengirimkan data pengguna sebagai respons JSON
        return new NextResponse(JSON.stringify(users), {
            status: 200,
            headers: {
                'Content-Type': 'application/json', // Menambahkan header Content-Type
            },
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        return new NextResponse(JSON.stringify({ message: "Internal Server Error" }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json', // Menambahkan header Content-Type
            },
        });
    }
}
