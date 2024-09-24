import { connectMongoDB } from "@/libs/mongodb";
import Universitas from "@/models/universitasSchema";

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