import { NextResponse } from 'next/server';
import { connectMongoDB } from "@/libs/mongodb";
import User from "@/models/userSchema";
import crypto from 'crypto';
import nodemailer from 'nodemailer';


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

export async function POST(req) {
    await connectMongoDB();

    try {
        const { email } = await req.json();

        if (!email) {
            return new NextResponse(JSON.stringify({
                status: false,
                statusCode: 400,
                message: "Email is required",
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    details: "Email field cannot be empty"
                }
            }), {
                status: 400,
            });
        }

        const user = await User.findOne({ email: email });
        if (!user) {
            return new NextResponse(JSON.stringify({
                status: false,
                statusCode: 404,
                message: "User tidak ditemukan",
                data: null,
                error: {
                    code: "NOT_FOUND",
                    details: "User dengan email tersebut tidak terdaftar dalam sistem"
                }
            }), {
                status: 404,
            });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = Date.now() + 3600000;

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpiry = resetTokenExpiry;
        await user.save();

        const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;
        

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Reset Password',
            html: `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <h2 style="color: #4CAF50;">Reset Password</h2>
                    <p>Anda menerima email ini karena Anda (atau seseorang) telah meminta reset password untuk akun Anda.</p>
                    <p>Silakan klik tombol di bawah ini untuk melanjutkan proses reset password:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" 
                           style="background-color: #4CAF50; 
                                  color: white; 
                                  padding: 12px 24px; 
                                  text-decoration: none; 
                                  border-radius: 4px;
                                  display: inline-block;">
                            Reset Password
                        </a>
                    </div>
                    <p>Jika Anda tidak meminta reset password, abaikan email ini dan password Anda akan tetap sama.</p>
                    <p>Link reset password ini akan kedaluwarsa dalam 1 jam.</p>
                    <hr style="border: none; border-top: 1px solid #ddd;">
                    <p style="font-size: 12px; color: #888;">Ini adalah email otomatis. Mohon tidak membalas email ini.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        return new NextResponse(JSON.stringify({
            status: true,
            statusCode: 200,
            message: "Email reset password berhasil dikirim",
            data: {
                email: email,
                expiresIn: "1 hour",
                requestedAt: new Date().toISOString()
            },
            error: null
        }), {
            status: 200,
        });

    } catch (error) {
        console.error('Error saat mengirim email reset password:', error);
        return new NextResponse(JSON.stringify({
            status: false,
            statusCode: 500,
            message: "Terjadi kesalahan internal server",
            data: null,
            error: {
                code: "INTERNAL_SERVER_ERROR",
                details: "Gagal mengirim email reset password"
            }
        }), {
            status: 500,
        });
    }
}