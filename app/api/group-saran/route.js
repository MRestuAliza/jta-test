import { connectMongoDB } from "@/libs/mongodb";
import GroupSaran from "@/models/groupSaranSchema";
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 21);

export async function GET(req, res) {
    await connectMongoDB();
  
    try {
      const prodiList = await GroupSaran.find({});
      return new Response(JSON.stringify({ success: true, data: prodiList }), {
        status: 200,
      });
    } catch (error) {
      return new Response(JSON.stringify({ success: false }), { status: 400 });
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
