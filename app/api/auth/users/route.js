import { connectMongoDB } from "@/libs/mongodb";
import User from "@/models/userSchema";
import Departement from "@/models/departementSchema";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from 'uuid';
import bcrypt from "bcryptjs";
import ImageKit from "imagekit";

export async function GET(request) {
    try {
        const userRole = request.headers.get('X-User-Role');
        const userDepartmentId = request.headers.get('X-User-Department-Id');
        const userDepartmentType = request.headers.get('X-User-Department-Type');

        const url = new URL(request.url);
        const filter = url.searchParams.get('filter') || 'all';
        const search = url.searchParams.get('search') || '';
        const page = parseInt(url.searchParams.get('page')) || 1;
        const limit = parseInt(url.searchParams.get('limit')) || 10;
        const skip = (page - 1) * limit;

        await connectMongoDB();

        let query = {};
        let conditions = [];

        if (filter === 'admin') {
            conditions.push({ role: { $regex: /^Admin/ } });
        } else if (filter === 'mahasiswa') {
            conditions.push({ role: 'Mahasiswa' });
        }

        if (search) {
            conditions.push({
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                    { nim: { $regex: search, $options: 'i' } }
                ]
            });
        }

        if (userRole === 'Super Admin') {

        } else if (userDepartmentType === 'Fakultas') {
            const prodiDepts = await Departement.find({
                type: 'Prodi',
                ref_ids: { $elemMatch: { $eq: userDepartmentId } }
            });

            const prodiDeptIds = prodiDepts.map(dept => dept._id);
            conditions.push({
                $or: [
                    { departementId: userDepartmentId },
                    { departementId: { $in: prodiDeptIds } },
                    // Tambahkan kondisi untuk mahasiswa tanpa departementId
                    { 
                        role: 'Mahasiswa',
                        $or: [
                            { departementId: { $exists: false } },
                            { departementId: '' },
                            { departementId: null }
                        ]
                    }
                ]
            });
        } else if (userDepartmentType === 'Prodi') {
            conditions.push({
                $or: [
                    { departementId: userDepartmentId },
                    // Tambahkan kondisi untuk mahasiswa tanpa departementId
                    { 
                        role: 'Mahasiswa',
                        $or: [
                            { departementId: { $exists: false } },
                            { departementId: '' },
                            { departementId: null }
                        ]
                    }
                ]
            });
        } else {
            return new NextResponse(JSON.stringify({
                success: false,
                message: "Unauthorized"
            }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Combine all conditions
        if (conditions.length > 0) {
            query.$and = conditions;
        }

        console.log('Final Query:', JSON.stringify(query, null, 2));

        const total = await User.countDocuments(query);
        const users = await User.find(query)
            .skip(skip)
            .limit(limit)
            .lean();

        console.log('Found Users:', users.length);

        return new NextResponse(JSON.stringify({
            success: true,
            data: users,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error("Error fetching users:", error);
        return new NextResponse(JSON.stringify({
            success: false,
            message: "Internal Server Error",
            error: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function POST(request) {

    try {
        const body = await request.json();
        body.id = uuidv4();
        const { name, email, password } = body;

        if (!name || !email || !password) {
            return new NextResponse(JSON.stringify({ message: "Missing required fields" }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
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

const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

export async function PATCH(req) {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");
    let newRole, name, nim, password, newPassword, profilePicture, email, departementId, departmentType;

    if (req.headers.get("content-type")?.includes("multipart/form-data")) {
        const formData = await req.formData();
        name = formData.get("name");
        nim = formData.get("nim");
        email = formData.get("email");
        password = formData.get("password");
        newPassword = formData.get("newPassword");
        profilePicture = formData.get("profilePicture");
        departementId = formData.get("departementId");
        departmentType = formData.get("departmentType");
    } else {
        ({ newRole, name, nim, password, newPassword, profilePicture, email, departementId, departmentType } = await req.json());
    }

    try {
        await connectMongoDB();
        const user = await User.findById(userId);


        if (!user) {
            return new NextResponse(
                JSON.stringify({
                    status: false,
                    message: "User not found",
                    errors: { user: "User ID does not exist" },
                }),
                {
                    status: 404,
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
        }
        if (newRole) {
            user.role = newRole;
            if (newRole.startsWith('Admin')) {
                if (!departementId || !departmentType) {
                    return new NextResponse(
                        JSON.stringify({
                            status: false,
                            message: "Department ID and Type are required for Admin roles",
                        }), { status: 400 }
                    );
                }
                user.departementId = departementId;
                user.departmentType = departmentType;
            } else {
                user.departementId = undefined;
                user.departmentType = undefined;
            }
        }

        if (name) user.name = name;
        if (nim) user.nim = nim;
        if (email) {
            const existingUser = await User.findOne({
                email,
                _id: { $ne: userId }
            });

            if (existingUser) {
                return new NextResponse(
                    JSON.stringify({
                        status: false,
                        message: "Email already in use",
                    }), { status: 400 }
                );
            }
            user.email = email;
        }
        if (user.loginProvider === "credentials" && password && newPassword) {
            const isMatch = await bcrypt.compare(password, user.password);



            if (!isMatch) {
                return new NextResponse(
                    JSON.stringify({
                        status: false,
                        message: "Password lama tidak sesuai",
                    }),
                    { status: 400 }
                );
            }

            const hashedNewPassword = await bcrypt.hash(newPassword, 12);
            user.password = hashedNewPassword;
        }

        if (profilePicture && profilePicture.size > 0) {
            const validExtensions = ["image/jpeg", "image/jpg", "image/png"];
            const MAX_FILE_SIZE = 2 * 1024 * 1024;

            if (!validExtensions.includes(profilePicture.type)) {
                return new NextResponse(
                    JSON.stringify({
                        status: false,
                        message: "Invalid file type. Only JPG, JPEG, and PNG are allowed.",
                    }),
                    { status: 400 }
                );
            }

            if (profilePicture.size > MAX_FILE_SIZE) {
                return new NextResponse(
                    JSON.stringify({
                        status: false,
                        message: "File size exceeds the maximum limit of 2MB.",
                    }),
                    { status: 400 }
                );
            }

            const buffer = Buffer.from(await profilePicture.arrayBuffer());
            const imagekitResponse = await imagekit.upload({
                file: buffer,
                fileName: `${userId}_profile_picture`,
                folder: "/profile_pictures/",
            });
            user.profilePicture = imagekitResponse.url;
        }

        await user.save();

        return new NextResponse(
            JSON.stringify({
                status: true,
                message: "User updated successfully",
                data: { user },
            }),
            {
                status: 200,
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
    } catch (error) {
        console.error("Failed to update user:", error);
        return new NextResponse(
            JSON.stringify({
                status: false,
                message: "Internal Server Error",
                errors: { details: error.message },
            }),
            {
                status: 500,
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
    }
}

export async function DELETE(req) {
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');

    try {
        await connectMongoDB();
        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return new NextResponse(JSON.stringify({
                status: false,
                message: 'User not found',
                errors: { user: 'User ID does not exist' },
            }), {
                status: 404,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        return new NextResponse(JSON.stringify({
            status: true,
            message: 'User deleted successfully',
            data: { user: deletedUser },
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Failed to delete user:', error);
        return new NextResponse(JSON.stringify({
            status: false,
            message: 'Internal Server Error',
            errors: { details: error.message },
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}
