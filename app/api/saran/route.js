import { connectMongoDB } from "@/libs/mongodb";
import GroupSaran from '@/models/tes/groupSaranSchema';
import Website from '@/models/tes/webSchema';
import Saran from "@/models/tes/saranSchema";
import Comment from "@/models/tes/commentSchema";
import User from "@/models/tes/userSchema";
import Vote from '@/models/tes/voteSchema';
import { NextResponse } from 'next/server';
import { validate as uuidValidate } from 'uuid';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

export async function GET(req) {
    await connectMongoDB();
    const url = new URL(req.url);
    const link = url.searchParams.get('link');
    const id = url.searchParams.get('id');
    const sid = url.searchParams.get('sid');
    const userId = url.searchParams.get('userId');

    try {
        let groupSaran;

        if (link) {
            groupSaran = await Website.findOne({ link_advice: link }).lean();
        } else if (id && uuidValidate(id)) {
            groupSaran = await Website.findById(id);
        } else if (userId && uuidValidate(userId)) {
            const saranList = await Saran.find({ created_by: userId }).lean();

            const saranListWithUsers = await Promise.all(
                saranList.map(async (saran) => {
                    const user = await User.findById(saran.created_by).select("name profilePicture");
                    const group = await Website.findById(saran.groupSaranId).select("name");
                    return {
                        ...saran,
                        created_by: user ? user.name : 'Unknown',
                        group_name: group ? group.name : "Unknown Group"
                    };
                })
            );

            return new NextResponse(JSON.stringify({
                success: true,
                message: "Saran berhasil diambil berdasarkan ID pengguna",
                data: saranListWithUsers,
            }), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }
        else if (sid && uuidValidate(sid)) {
            const saran = await Saran.findById(sid);
            if (!saran) {
                return new NextResponse(JSON.stringify({
                    success: false,
                    message: "Saran tidak ditemukan",
                    data: null
                }), {
                    status: 404,
                });
            }


            const user = await User.findById(saran.created_by);
            if (!user) {
                return new NextResponse(JSON.stringify({
                    success: false,
                    message: "User tidak ditemukan",
                    data: null
                }), {
                    status: 404,
                });
            }

            const saranWithUser = {
                ...saran._doc,
                created_by: user.name,
                email: user.email,
            };

            return new NextResponse(JSON.stringify({
                success: true,
                message: "Saran berhasil diambil",
                data: saranWithUser
            }), {
                status: 200,
            });
        } else {
            return new NextResponse(JSON.stringify({
                success: false,
                message: "Parameter 'link', 'id', atau 'sid' tidak valid",
                data: null
            }), {
                status: 400,
            });
        }

        if (!groupSaran) {
            return new NextResponse(JSON.stringify({
                success: false,
                message: "Group Saran tidak ditemukan",
                data: null
            }), {
                status: 404,
            });
        }

        console.log('Group Saran:', groupSaran);
        
        const saranList = await Saran.find({ webId: groupSaran._id }).lean();

        const saranListWithUsers = await Promise.all(saranList.map(async (saran) => {
            const user = await User.findById(saran.created_by);
            const comments = await Comment.countDocuments({ saran_id: saran._id });
            return {
            ...saran,
            created_by: user ? user.name : 'Unknown',
            email: user ? user.email : 'Unknown',
            profile_picture: user ? user.profilePicture : 'default_profile_picture_url',
            comments: comments
            };
        }));
        console.log('Saran List:', saranListWithUsers);

        return new NextResponse(JSON.stringify({
            success: true,
            message: "Saran berhasil diambil",
            data: {
                ...saranListWithUsers,
            }
        }), {
            status: 200,
        });
    } catch (error) {
        console.error('Error:', error);
        return new NextResponse(JSON.stringify({ success: false, message: "Terjadi kesalahan saat mengambil data", error: error.message }), {
            status: 500,
        });
    }
}

export async function POST(req, res) {
    await connectMongoDB();

    const url = new URL(req.url);
    const link = url.searchParams.get('link');
    const { title, description, userId, adminEmails } = await req.json();

    if (!link) {
        return new NextResponse(JSON.stringify({ message: "Parameter 'link' tidak ditemukan" }), {
            status: 400,
        });
    }

    if (!userId) {
        return new NextResponse(JSON.stringify({ message: "User ID is required" }), {
            status: 400,
        });
    }

    if (!adminEmails || !Array.isArray(adminEmails) || adminEmails.length === 0) {
        return new NextResponse(JSON.stringify({ message: "Admin emails are required" }), { status: 400 });
    }

    try {
        const groupSaran = await Website.findOne({ link_advice: link });
        console.log('Group Saran:', groupSaran);

        if (!groupSaran) {
            return new NextResponse(JSON.stringify({ message: "Group Saran tidak ditemukan" }), {
                status: 404,
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return new NextResponse(JSON.stringify({ message: "User tidak ditemukan" }), {
                status: 404,
            });
        }


        const groupSaranId = groupSaran._id;


        const newSaran = new Saran({
            webId: groupSaranId,
            title: title,
            description: description,
            saran: 'new',
            link: link,
            created_by: userId,
        });

        await newSaran.save();

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: adminEmails.join(','),
            subject: 'Notifikasi Saran Baru',
            html: `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <h2 style="color: #4CAF50;">Notifikasi Saran Baru</h2>
                    <p><strong>Judul:</strong> ${title}</p>
                    <p><strong>Deskripsi:</strong> ${description}</p>
                    <p><strong>Dibuat oleh:</strong> ${user.name}</p>
                    <hr style="border: none; border-top: 1px solid #ddd;">
                    <p style="font-size: 12px; color: #888;">Ini adalah email notifikasi otomatis. Mohon tidak membalas email ini.</p>
                </div>
            `
        };


        await transporter.sendMail(mailOptions);

        return new NextResponse(JSON.stringify({ success: true, data: newSaran }), {
            status: 200,
        });
    } catch (error) {
        console.error('Error saat mengirim saran:', error);
        return res.status(500).json({ message: 'Terjadi kesalahan' });
    }
}

export async function PATCH(req) {
    await connectMongoDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const body = await req.json();
    const { status, adminEmails } = body;


    if (!uuidValidate(id)) {
        return new Response(
            JSON.stringify({
                success: false,
                message: "Invalid ID format",
                data: null,
            }),
            {
                status: 400,
            }
        );
    }

    try {

        const allowedStatuses = ["new", "work in progress", "completed", "cancelled"];
        if (!allowedStatuses.includes(status)) {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: "Invalid status value",
                }),
                {
                    status: 400,
                }
            );
        }

        // if (!adminEmails || !Array.isArray(adminEmails) || adminEmails.length === 0) {
        //     return new NextResponse(JSON.stringify({ message: "Admin emails are required" }), { status: 400 });
        // }

        const updatedSaran = await Saran.findByIdAndUpdate(
            id,
            { status: status, updated_at: Date.now() },
            { new: true }
        );

        const saran = await Saran.findById(id);
        if (!saran) {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: "Saran not found",
                }),
                {
                    status: 404,
                }
            );
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: adminEmails,
            subject: 'Notifikasi Pembaruan Status Saran',
            html: `
            <div style="font-family: Arial, sans-serif; color: #333;">
                <h2 style="color: #4CAF50;">Notifikasi Pembaruan Status Saran</h2>
                <p><strong>Judul Saran:</strong> ${saran.title}</p>
                <p><strong>Status Baru:</strong> ${status}</p>
                <hr style="border: none; border-top: 1px solid #ddd;">
                <p style="font-size: 12px; color: #888;">Ini adalah email notifikasi otomatis. Mohon tidak membalas email ini.</p>
            </div>
            `
        };

        await transporter.sendMail(mailOptions);

        if (!updatedSaran) {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: "Saran not found",
                }),
                {
                    status: 404,
                }
            );
        }

        return new Response(
            JSON.stringify({ success: true, data: updatedSaran }),
            {
                status: 200,
            }
        );
    } catch (error) {
        return new Response(
            JSON.stringify({
                message: "Internal Server Error",
                error: error.message,
            }),
            {
                status: 500,
            }
        );
    }
}

export async function DELETE(req) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!uuidValidate(id)) {
        return new Response(JSON.stringify({
            success: false,
            message: "Invalid ID format",
            data: null
        }), {
            status: 400,
        });
    }

    if (!id) {
        return new Response(JSON.stringify({ message: "ID is required" }), {
            status: 400,
        });
    }

    try {
        await connectMongoDB();
        const Advice = await Saran.findById(id);

        if (!Advice) {
            return new NextResponse(JSON.stringify({ message: "Advice not found" }), {
                status: 404,
            });
        }

        const votes = await Vote.find({ saranId: id });

        if (votes.length > 0) {
            await Vote.deleteMany({ saranId: id });
        }

        await Saran.findByIdAndDelete(id);

        return new Response(JSON.stringify({ message: "Advice and related votes deleted" }), {
            status: 200,
        });

    } catch (error) {
        console.error(error.message);
        return new Response(JSON.stringify({
            success: false,
            message: "Internal server error",
            data: null,
            error: error.message
        }), {
            status: 500,
        });
    }
}
