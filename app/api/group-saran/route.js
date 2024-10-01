import { connectMongoDB } from "@/libs/mongodb";
import GroupSaran from "@/models/groupSaranSchema";
import { customAlphabet } from 'nanoid';
import Fakultas from "@/models/fakultasSchema"; // Impor model Fakultas
import Universitas from "@/models/universitasSchema"; // Impor model Universitas
import Prodi from "@/models/prodiSchema";
import { NextResponse } from 'next/server'

const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 21);

// export async function GET(req, res) {
//   await connectMongoDB();

//   try {
//     const prodiList = await GroupSaran.find({});
//     return new Response(JSON.stringify({ success: true, data: prodiList }), {
//       status: 200,
//     });
//   } catch (error) {
//     return new Response(JSON.stringify({ success: false }), { status: 400 });
//   }
// }

export async function GET() {
  await connectMongoDB();

  try {
    // Populate fakultas_id, university_id, dan prodi_id untuk mendapatkan nama yang sesuai
    const prodiList = await GroupSaran.find({})
      .populate({ path: 'fakultas_id', select: 'name', model: Fakultas })   // Mengambil nama dari Fakultas
      .populate({ path: 'university_id', select: 'name', model: Universitas }) // Mengambil nama dari Universitas
      .populate({ path: 'prodi_id', select: 'name', model: Prodi });     // Mengambil nama dari Prodi


    console.log("Data fetched:", prodiList);

    return new Response(JSON.stringify({ success: true, data: prodiList }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 400 });
  }
}


export async function POST(req, res) {
  await connectMongoDB();

  try {
    const uniqueLink = nanoid();
    const body = await req.json();
    console.log("Request body TEst:", { body });

    const newGroupSaran = await GroupSaran.create({
      name: body.name,
      type: body.type,
      website_id: body.website_id,
      university_id: body.university_id,
      fakultas_id: body.fakultas_id || null,
      prodi_id: body.prodi_id || null,
      link: uniqueLink,
    });

    return new Response(JSON.stringify({ success: true, data: newGroupSaran }), {
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
    });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return new NextResponse(JSON.stringify({ message: "ID is required" }), {
        status: 400,
      });
    }

    await connectMongoDB();

    const adviceGroup = await GroupSaran.findByIdAndDelete(id);

    if (!adviceGroup) {
      return new NextResponse(JSON.stringify({ message: "Advice group not found" }), {
        status: 404,
      });
    }
    return new NextResponse(JSON.stringify({ message: "Advice group deleted" }), {
      status: 200,
    });
    
  } catch (error) {

  }
}
