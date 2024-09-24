import { connectMongoDB } from "@/libs/mongodb";
import GroupSaran from "@/models/groupSaranSchema";
import { nanoid } from 'nanoid';

export async function POST(req, res) {
    await connectMongoDB();

    try {
        const { name, website_id } = await req.json(); 
        if (!name || !website_id) {
            return res.status(400).json({ message: "Name and website_id are required" });
        }
        const uniqueLink = nanoid();

        const newGroupSaran = await GroupSaran.create({
            name,
            website_id,
            link: uniqueLink,
        });

        // return res.status(201).json({ success: true, data: newGroupSaran });
        return new Response(JSON.stringify({ success: true, data: newGroupSaran }), {
            status: 200,
        });
    } catch (error) {
        
        return res.status(500).json({ success: false, error: error.message });
    }
}
