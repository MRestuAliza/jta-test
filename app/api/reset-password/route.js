// app/api/reset-password/route.js
import { NextResponse } from 'next/server';
import { connectMongoDB } from "@/libs/mongodb";
import User from "@/models/userSchema";
import bcrypt from 'bcryptjs';

export async function POST(req) {
    await connectMongoDB();

    try {
        const { token, newPassword } = await req.json();

        if (!token || !newPassword) {
            return new NextResponse(JSON.stringify({
                status: false,
                statusCode: 400,
                message: "Token dan password baru diperlukan",
                error: {
                    code: "VALIDATION_ERROR",
                    details: "Token dan password tidak boleh kosong"
                }
            }), {
                status: 400,
            });
        }

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpiry: { $gt: Date.now() }
        });

        if (!user) {
            return new NextResponse(JSON.stringify({
                status: false,
                statusCode: 400,
                message: "Token tidak valid atau telah kadaluarsa",
                error: {
                    code: "INVALID_TOKEN",
                    details: "Token reset password tidak valid atau telah kadaluarsa"
                }
            }), {
                status: 400,
            });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiry = undefined;
        await user.save();

        return new NextResponse(JSON.stringify({
            status: true,
            statusCode: 200,
            message: "Password berhasil direset",
            data: {
                email: user.email,
                updatedAt: new Date().toISOString()
            },
            error: null
        }), {
            status: 200,
        });

    } catch (error) {
        console.error('Error saat mereset password:', error);
        return new NextResponse(JSON.stringify({
            status: false,
            statusCode: 500,
            message: "Terjadi kesalahan internal server",
            error: {
                code: "INTERNAL_SERVER_ERROR",
                details: "Gagal mereset password"
            }
        }), {
            status: 500,
        });
    }
}