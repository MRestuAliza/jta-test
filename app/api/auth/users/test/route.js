import { connectMongoDB } from "@/libs/mongodb";
import User from "@/models/userSchema";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from 'uuid';

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

export async function POST(request) {
    console.log("POST request received");
    try {
        const body = await request.json();
        body.id = uuidv4(); // Tambahkan id ke body
        const { name, email, password } = body;

        if (!name || !email || !password) {
            return new NextResponse(JSON.stringify({ message: "Missing required fields" }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json', // Tambahkan header
                },
            });
        }

        await connectMongoDB();

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return new NextResponse(JSON.stringify({ message: "Email already registered" }), {
                status: 409,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const createUser = await User.create({ id: body.id, name, email, password: hashedPassword, loginProvider: 'credentials' });

        return new NextResponse(JSON.stringify({ message: "User Registered", data: createUser }), {
            status: 201,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error("Error registering user:", error);
        return new NextResponse(JSON.stringify({ message: "Internal Server Error" }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}


export async function PATCH(req) {
    const url = new URL(req.url);
    const user = url.searchParams.get('userId');
    const { newRole: role } = await req.json();

    try {
        await connectMongoDB();

        const updatedUser = await User.findOneAndUpdate({ _id: user }, { role }, { new: true });

        if (!updatedUser) {
            return new NextResponse(JSON.stringify({ message: 'User not found' }), {
                status: 404,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        return new NextResponse(JSON.stringify({ message: 'User role updated', user: updatedUser }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Failed to update user role:', error);
        return new NextResponse(JSON.stringify({ message: 'Internal Server Error' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}