import { connectMongoDB } from "@/libs/mongodb";
import Web from "@/models/tes/webSchema";
import Departement from "@/models/tes/departementSchema";
import { v4 as uuidv4 } from 'uuid';
import { NextResponse } from "next/server";
import xss from 'xss';

export async function GET(req, { params }) {
    await connectMongoDB();

    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    try {
        let result;

        // Periksa apakah ID yang diberikan adalah ID universitas, fakultas, atau prodi
        const isUniversitas = await Departement.findOne({ _id: id, ref_ids: null });
        const isFakultas = await Departement.findOne({ _id: id, ref_ids: { $ne: null } });
        const isProdi = await Departement.findOne({ ref_ids: id });

        if (isUniversitas) {
            result = await Departement.aggregate([
                {
                    $match: { _id: id, ref_ids: null }  // Universitas
                },
                {
                    $lookup: {
                        from: 'websites',  // Koleksi website
                        localField: '_id',
                        foreignField: 'ref_id',
                        as: 'university_websites'
                    }
                },
                {
                    $lookup: {
                        from: 'departements',  // Fakultas terkait
                        localField: '_id',
                        foreignField: 'ref_ids',
                        as: 'fakultas'
                    }
                },
                {
                    $unwind: '$fakultas'
                },
                {
                    $lookup: {
                        from: 'websites',
                        localField: 'fakultas._id',
                        foreignField: 'ref_id',
                        as: 'fakultas_websites'
                    }
                },
                {
                    $addFields: {
                        'fakultas.websites': '$fakultas_websites'
                    }
                }
            ]);
        } else if (isFakultas) {
            // Ambil semua website fakultas dan prodi terkait
            result = await Departement.aggregate([
                {
                    $match: { _id: id }  // Fakultas
                },
                {
                    $lookup: {
                        from: 'websites',
                        localField: '_id',
                        foreignField: 'ref_id',
                        as: 'fakultas_websites'
                    }
                },
                {
                    $lookup: {
                        from: 'departements',  // Prodi terkait
                        localField: '_id',
                        foreignField: 'ref_ids',
                        as: 'prodi'
                    }
                },
                {
                    $unwind: '$prodi'
                },
                {
                    $lookup: {
                        from: 'websites',
                        localField: 'prodi._id',
                        foreignField: 'ref_id',
                        as: 'prodi_websites'
                    }
                },
                {
                    $addFields: {
                        'prodi.websites': '$prodi_websites'
                    }
                }
            ]);
        } else if (isProdi) {
            // Ambil semua website prodi dan universitas
            result = await Departement.aggregate([
                {
                    $match: { ref_ids: id }  // Prodi
                },
                {
                    $lookup: {
                        from: 'websites',
                        localField: '_id',
                        foreignField: 'ref_id',
                        as: 'prodi_websites'
                    }
                },
                {
                    $lookup: {
                        from: 'websites',
                        localField: 'ref_ids',
                        foreignField: '_id',
                        as: 'university_websites'
                    }
                }
            ]);
        } else {
            return new NextResponse(JSON.stringify({ message: 'Invalid ID or level not found' }), { status: 400 });
        }

        return new NextResponse(JSON.stringify({ success: true, data: result }), {
            status: 200,
        });
    } catch (error) {
        return new NextResponse(JSON.stringify({ success: false, error: error.message }), {
            status: 500,
        });
    }
}

export async function POST(req, res) {
    try {
        const body = await req.json();
        const cleanName = xss(body.name);
        const cleanLink = xss(body.link);
        const cleanType = xss(body.type);
        const cleanUniversityId = xss(body.department_id);
        const refModel = cleanType;
        const refId = cleanUniversityId;

        const id = uuidv4();
        if (!cleanName || !cleanLink || !cleanType || !cleanUniversityId) {
            return new NextResponse(JSON.stringify({ message: "Missing required fields" }), { status: 400 });
        }

        await connectMongoDB();

        const existingWeb = await Web.findOne({
            $or: [
                { name: body.cleanName },
                { link: body.cleanLink },
            ]
        });
        if (existingWeb) {
            return new NextResponse(JSON.stringify({ message: "Name or link already exists" }), {
                status: 409,
            });
        }

        const newWebsite = await Web.create({
            _id: id,
            name: cleanName,
            link: cleanLink,
            type: cleanType,
            ref_id: refId,
            ref_model: refModel,
            department_id: cleanUniversityId,
        });

        return new NextResponse(JSON.stringify({ success: true, data: newWebsite }), {
            status: 201,
        });
    } catch (error) {
        return new NextResponse(JSON.stringify({ success: false, error: error.message }), {
            status: 500,
        });
    }
}