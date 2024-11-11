import { connectMongoDB } from "@/libs/mongodb";
import User from "@/models/tes/userSchema";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from 'uuid';

export async function GET(req, { params }) {
    try {
      const { id } = params;
      
      if (!id || typeof id !== 'string' || !id.match(/^[0-9a-fA-F\-]{36}$/)) {
        return NextResponse.json({ message: 'Invalid or missing user ID' }, { status: 400 });
      }

      await connectMongoDB();

      const user = await User.findOne({ _id: id });

      if (!user) {
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
      }

      return NextResponse.json({ message: 'User found', user });
    } catch (error) {
      console.error('Failed to get user:', error);
      return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
