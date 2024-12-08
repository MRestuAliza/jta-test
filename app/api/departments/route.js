import { connectMongoDB } from "@/libs/mongodb";
import Departement from "@/models/departementSchema";
import { NextResponse } from "next/server";

// export async function GET(req, res) {
//     await connectMongoDB();

//     try {
//         const { searchParams } = new URL(req.url);
//         const ref_ids = searchParams.get('ref_ids');
//         const _id = searchParams.get('_id');
//         const type = searchParams.get('type');
//         const name = searchParams.get('name');

//         const matchCondition = _id
//             ? { _id: _id }
//             : ref_ids
//                 ? { ref_ids: ref_ids }
//                 : name
//                     ? { name: new RegExp(`^${name}$`, 'i') }
//                     : {};

//         const Departements = await Departement.aggregate([
//             {
//                 $match: matchCondition,
//             },
//             {
//                 $lookup: {
//                     from: 'departements',
//                     localField: 'ref_ids',
//                     foreignField: '_id',
//                     as: 'children',
//                 },
//             },
//             {
//                 $match: {
//                     name: { $ne: "Universitas Mataram" },
//                     ...(type === 'fakultas'
//                         ? { "children._id": { $exists: true }, "ref_ids": { $size: 1 } }
//                         : type === 'prodi'
//                             ? { "children._id": { $exists: true }, $expr: { $gte: [{ $size: "$ref_ids" }, 2] } }
//                             : {}
//                     )
//                 }
//             },
//             {
//                 $project: {
//                     name: 1,
//                     created_at: 1,
//                     updated_at: 1,
//                     children: 1,
//                 },
//             },
//         ]);

//         return new Response(JSON.stringify({ success: true, data: Departements }), {
//             status: 200,
//         });
//     } catch (error) {
//         return new Response(JSON.stringify({ Error: error.message }), { status: 400 });
//     }
// }
// import { NextResponse } from "next/server";
// import connectMongoDB from "@/libs/mongodb";
// import Departement from "@/models/departementSchema";

export async function GET(request) {
    try {
        await connectMongoDB();

        const url = new URL(request.url);
        const searchQuery = url.searchParams.get("search") || "";
        const page = parseInt(url.searchParams.get("page")) || 1;
        const limit = parseInt(url.searchParams.get("limit")) || 10;
        const filter = url.searchParams.get("filter") || "all";

        let query = {
            ref_ids: { $exists: true, $ne: [] }
        };
        
        if (searchQuery) {
            query.name = { $regex: searchQuery, $options: "i" };
        }

        if (filter !== "all") {
            query.type = filter;
        }

        const skip = (page - 1) * limit;

        const total = await Departement.countDocuments(query);

        const departments = await Departement.find(query)
            .sort({ created_at: -1 })
            .skip(skip)
            .limit(limit);

        return new NextResponse(
            JSON.stringify({
                status: true,
                message: "Departments fetched successfully",
                data: departments,
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }),
            {
                status: 200,
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

    } catch (error) {
        console.error("Failed to fetch departments:", error);
        return new NextResponse(
            JSON.stringify({
                status: false,
                message: "Internal Server Error",
                error: error.message
            }),
            {
                status: 500,
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );
    }
}