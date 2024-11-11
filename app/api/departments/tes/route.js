import { connectMongoDB } from "@/libs/mongodb";
import Departement from "@/models/departementSchema";
import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid';


export async function POST(req, res) {
    await connectMongoDB();

    try {
        const body = await req.json();
        body.id = uuidv4();
        const departement = await Departement.create(body);
        return new Response(JSON.stringify({ success: true, data: departement }), {
            status: 201,
        });
    } catch (error) {
        return new Response(JSON.stringify({ Error: error.message }), { status: 400 });
    }
}

export async function GET(req, res) {
    await connectMongoDB();

    try {
        const { searchParams } = new URL(req.url);
        const ref_ids = searchParams.get('ref_ids');
        const _id = searchParams.get('_id');
        const type = searchParams.get('type'); 

        const matchCondition = _id 
            ? { _id: _id } 
            : ref_ids 
            ? { ref_ids: ref_ids } 
            : {};

        const Departements = await Departement.aggregate([
            {
                $match: matchCondition, 
            },
            {
                $lookup: {
                    from: 'departements',  
                    localField: 'ref_ids', 
                    foreignField: '_id',   
                    as: 'children',        
                },
            },
            {
                $match: type === 'fakultas' 
                    ? { "children._id": { $exists: true }, "ref_ids": { $size: 1 } } 
                    : type === 'prodi'
                    ? { "children._id": { $exists: true }, $expr: { $gte: [{ $size: "$ref_ids" }, 2] } }
                    : {}, 
            },
            {
                $project: {
                    name: 1,
                    created_at: 1,
                    updated_at: 1,
                    children: 1,
                },
            },
        ]);

        return new Response(JSON.stringify({ success: true, data: Departements }), {
            status: 200,
        });
    } catch (error) {
        return new Response(JSON.stringify({ Error: error.message }), { status: 400 });
    }
}

export async function PATCH(req, res) {
    await connectMongoDB();

    try {
        const { searchParams } = new URL(req.url);
        const _id = searchParams.get('_id');
        const body = await req.json();

        if (!_id) {
            return new Response(JSON.stringify({ success: false, message: 'Missing _id' }), {
                status: 400,
            });
        }

    
        const updatedDepartement = await Departement.findByIdAndUpdate(
            _id, 
            { $set: body },
            { new: true }
        );

        if (!updatedDepartement) {
            return new Response(JSON.stringify({ success: false, message: 'Departement not found' }), {
                status: 404,
            });
        }

        return new Response(JSON.stringify({ success: true, data: updatedDepartement }), {
            status: 200,
        });
    } catch (error) {
        return new Response(JSON.stringify({ success: false, message: error.message }), { status: 500 });
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

        const department = await Department.findByIdAndDelete(id);
        if (!department) {
            return new NextResponse(JSON.stringify({ message: "Department not found" }), {
                status: 404,
            });
        }
        return new NextResponse(JSON.stringify({ message: "Department deleted" }), {
            status: 200,
        });
    } catch (error) {
        console.error("Error deleting department:", error);
        return new NextResponse(JSON.stringify({ message: "Internal Server Error" }), {
            status: 500,
        });
    }
}

