import { connectMongoDB } from "@/libs/mongodb";
import Website from "@/models/webSchema";
import Fakultas from "@/models/fakultasSchema";
import mongoose from 'mongoose';
import Joi from 'joi';
import validator from 'validator';

export async function GET(req, { params }) {
    const { id } = params;

    await connectMongoDB();

    try {
        const objectIdUniversity = new mongoose.Types.ObjectId(id);
        console.log("id university", objectIdUniversity);
        
        const websites = await Website.find({ university_id: objectIdUniversity });
        console.log(websites);
        
        const fakultas = await Fakultas.find({ university_id: objectIdUniversity })

        // Gabungkan hasil dari Website dan Fakultas
        const allData = {
            websites,
            fakultas,
        };

        return new Response(JSON.stringify({ success: true, data: allData }), {
            status: 200,
        });
    } catch (error) {
        return new Response(JSON.stringify({ success: false, error: error.message }), {
            status: 500,
        });
    }
}

export async function PATCH(req, { params }) {
    const { id } = params;

    await connectMongoDB();

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return new Response(JSON.stringify({
            success: false,
            message: "Invalid ID format",
            data: null
        }), {
            status: 400,
        });
    }

    try {
        const { name, link } = await req.json();

        // Validate input data
        const schema = Joi.object({
            name: Joi.string().min(3).max(100).required(),
            link: Joi.string().uri().required() // Validasi URI dengan Joi
        });

        const { error } = schema.validate({ name, link });
        if (error) {
            return new Response(JSON.stringify({
                success: false,
                message: error.message,
                data: null
            }), {
                status: 400,
            });
        }

        const sanitizedData = {
            name: validator.escape(name), 
            link: link 
        };

    
        const updatedWebsite = await Website.findOneAndUpdate(
            { _id: new mongoose.Types.ObjectId(id) },
            sanitizedData,
            { new: true }
        );

        if (!updatedWebsite) {
            return new Response(JSON.stringify({
                success: false,
                message: "Website not found",
                data: null
            }), {
                status: 404,
            });
        }

        return new Response(JSON.stringify({
            success: true,
            message: "Data berhasil diperbarui",
            data: updatedWebsite
        }), {
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