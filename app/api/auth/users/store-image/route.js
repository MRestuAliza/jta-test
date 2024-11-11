import ImageKit from "imagekit";
import { NextResponse } from "next/server";

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("imageUrl");
    
    if (!file) {
      return NextResponse.json({ message: "No image file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const response = await imagekit.upload({
      file: buffer, 
      fileName: file.name, 
      folder: "/Jurnal/",
    });

    
    return NextResponse.json({ imageUrl: response.url });
  } catch (error) {
    console.error("Failed to upload image:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
