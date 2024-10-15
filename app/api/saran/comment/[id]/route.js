import { connectMongoDB } from "@/libs/mongodb";
import Comment from "@/models/commentSchema";
import Reply from "@/models/replySchema";
import User from "@/models/userSchema";


export async function GET(req, { params }) {
    await connectMongoDB();

   
    const { id } = params; 

    if (!id) {
        return new Response(JSON.stringify({ message: "Parameter 'id' tidak ditemukan" }), {
            status: 400,
        });
    }

    try {
        const comments = await Reply.find({ 
            comment_id: id }).populate('created_by', 'name profilePicture') 
            
        return new Response(JSON.stringify({ success: true, data: comments }), {
            status: 200,
        });
    } catch (error) {
        console.error('Error saat mendapatkan komentar:', error);
        return new Response(JSON.stringify({ message: 'Terjadi kesalahan' }), {
            status: 500,
        });
    }
}

export async function POST(req, { params }) {
    await connectMongoDB();

    const { id: commentId } = params;  
    const { content, userId } = await req.json();

    if (!commentId) {
        return new Response(JSON.stringify({ message: "Parameter 'comment_id' tidak ditemukan" }), {
            status: 400,
        });
    }

    if (!userId) {
        return new Response(JSON.stringify({ message: "User ID is required" }), {
            status: 400,
        });
    }

    try {
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return new Response(JSON.stringify({ message: "Komentar tidak ditemukan" }), {
                status: 404,
            });
        }
        
        const newReply = new Reply({
            comment_id: commentId,
            content: content,
            created_by: userId,
        });
        
        await newReply.save();

        return new Response(JSON.stringify({ success: true, data: newReply }), {
            status: 200,
        });
    } catch (error) {
        console.error('Error saat mengirim balasan:', error);
        return new Response(JSON.stringify({ message: 'Terjadi kesalahan' }), {
            status: 500,
        });
    }
}



