import { connectMongoDB } from "@/libs/mongodb";
import User from "@/models/userSchema";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function GET(req,{ params }) {
    try {
      const { id } = params;
      if (!id || typeof id !== 'string' || !id.match(/^[0-9a-fA-F]{24}$/)) {
        return NextResponse.json({ message: 'Invalid or missing user ID' }, { status: 400 });
      }

      // Connect to MongoDB
      await connectMongoDB();

      // Find user by ID
      const user = await User.findById({ _id: id });

      if (!user) {
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
      }

      // Return user data
      return NextResponse.json({ message: 'User found', user });
    } catch (error) {
      console.error('Failed to get user:', error);
      return NextResponse.json({ message: 'Internal Server Eror' }, { status: 500 });
    }
}