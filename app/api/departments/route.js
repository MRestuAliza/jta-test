import { connectMongoDB } from "@/libs/mongodb";
import Departement from "@/models/departementSchema";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        await connectMongoDB();

        const { searchParams } = request.nextUrl;
        const searchQuery = searchParams.get("search") || "";
        const page = parseInt(searchParams.get("page")) || 1;
        const limit = parseInt(searchParams.get("limit")) || 10;
        const filter = searchParams.get("filter") || "all";

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