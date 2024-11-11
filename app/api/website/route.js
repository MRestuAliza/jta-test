import { connectMongoDB } from "@/libs/mongodb";

import mongoose from "mongoose";
import { getSession } from "next-auth/react";
import Website from "@/models/tes/webSchema";
import GroupSaran from "@/models/tes/groupSaranSchema";
import Departement from "@/models/tes/departementSchema";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import xss from "xss";
import { customAlphabet } from 'nanoid';

const isValidUUID = (id) =>
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
        id
    );

export async function GET(req, { params }) {
    await connectMongoDB();

    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    try {
        let result;

        const isUniversitas = await Departement.findOne({ _id: id, ref_ids: null });
        const isFakultas = await Departement.findOne({ _id: id, type: "Fakultas" });
        const isProdi = await Departement.findById(id);

        if (isUniversitas) {

            const universityWebsites = await Website.find({ ref_id: id });
            const fakultasList = await Departement.find({
                ref_ids: id,
                type: "Fakultas",
            });

            result = {
                university_websites: universityWebsites,
                fakultas_list: fakultasList.map((fakultas) => ({
                    id: fakultas._id,
                    name: fakultas.name,
                })),
            };
        } else if (isFakultas) {
            const fakultasWebsites = await Website.find({ ref_id: id });
            const prodiList = await Departement.find({ ref_ids: id, type: "Prodi" });

            result = {
                fakultas_websites: fakultasWebsites,
                prodi_list: prodiList.map((prodi) => ({
                    id: prodi._id,
                    name: prodi.name,
                })),
            };
        } else if (isProdi) {

            const prodiWebsites = await Website.find({ ref_id: id });
            result = {
                prodi_websites: prodiWebsites,
            };
        } else {

            return new NextResponse(
                JSON.stringify({
                    success: false,
                    message: "Invalid ID or level not found",
                }),
                { status: 400 }
            );
        }


        return new NextResponse(
            JSON.stringify({
                success: true,
                message: "Data retrieved successfully",
                data: result,
            }),
            { status: 200 }
        );
    } catch (error) {

        return new NextResponse(
            JSON.stringify({
                success: false,
                message: "Internal Server Error",
                error: error.message,
            }),
            {
                status: 500,
            }
        );
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
        const nanoid = customAlphabet(
            "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
            21
        );
        const uniqueLink = nanoid();
        const id = uuidv4();

        if (!cleanName || !cleanLink || !cleanType || !cleanUniversityId) {
            return new NextResponse(
                JSON.stringify({ message: "Missing required fields" }),
                { status: 400 }
            );
        }
        await connectMongoDB();

        const existingWeb = await Website.findOne({
            $or: [{ name: body.cleanName }, { link: body.cleanLink }],
        });

        if (existingWeb) {
            return NextResponse.json({
                success: false,
                message: 'Name or link already exists',
                errors: {
                    name: existingWeb.name === cleanName ? 'Name already exists' : null,
                    link: existingWeb.link === cleanLink ? 'Link already exists' : null,
                }
            }, { status: 409 });
        }

        const newWebsite = await Website.create({
            _id: id,
            name: cleanName,
            link: cleanLink,
            type: cleanType,
            ref_id: refId,
            ref_model: refModel,
            link_advice: uniqueLink,
            department_id: cleanUniversityId,
        });

        // const newGroupSaran = await GroupSaran.create({
        //     _id: websiteId,
        //     name: cleanName,
        //     type: cleanType,
        //     link: uniqueLink,
        //     website_id: newWebsite._id,
        // });

        return new NextResponse(
            JSON.stringify({
                success: true,
                message: "Website and Group Saran created successfully",
                data: newWebsite
            }),
            { status: 201 }
        );
    } catch (error) {
        return new NextResponse(
            JSON.stringify({
                success: false,
                message: 'Internal Server Error',
                error: error.message
            }), { status: 500 }
        );
    }
}

export async function PATCH(req) {
    await connectMongoDB();

    try {
        const { searchParams } = new URL(req.url);
        const websiteId = searchParams.get("id");
        const body = await req.json();

        if (!isValidUUID(websiteId)) {
            return new NextResponse(
                JSON.stringify({ success: false, message: "ID tidak valid" }),
                { status: 400 }
            );
        }

        const cleanData = {
            name: body.name ? xss(body.name) : undefined,
            link: body.link ? xss(body.link) : undefined,
            type: body.type ? xss(body.type) : undefined,
            department_id: body.department_id ? xss(body.department_id) : undefined,
        };

        Object.keys(cleanData).forEach(
            (key) => cleanData[key] === undefined && delete cleanData[key]
        );

        const updatedWebsite = await Website.findByIdAndUpdate(
            websiteId,
            cleanData,
            { new: true }
        );

        if (!updatedWebsite) {
            return new NextResponse(
                JSON.stringify({ success: false, message: "Website tidak ditemukan" }),
                { status: 404 }
            );
        }

        return new NextResponse(
            JSON.stringify({ success: true, data: updatedWebsite }),
            {
                status: 200,
            }
        );
    } catch (error) {
        console.error(error);
        return new NextResponse(
            JSON.stringify({
                success: false,
                message: "Gagal memperbarui website",
                error: error.message,
            }),
            { status: 500 }
        );
    }
}

export async function DELETE(request) {
    await connectMongoDB();

    try {
        const { searchParams } = new URL(request.url);
        const websiteId = searchParams.get("id");

        if (!mongoose.Types.ObjectId.isValid(websiteId)) {
            return new Response(
                JSON.stringify({ success: false, message: "ID tidak valid" }),
                { status: 400 }
            );
        }

        const web = await Website.findByIdAndDelete(websiteId);
        if (!web) {
            return new Response(
                JSON.stringify({ success: false, message: "Website tidak ditemukan" }),
                { status: 404 }
            );
        }

        return new Response(
            JSON.stringify({ success: true, message: "Website berhasil dihapus" }),
            { status: 200 }
        );
    } catch (error) {
        console.error(error);
        return new Response(
            JSON.stringify({
                success: false,
                message: "Gagal menghapus website terkait",
                error: error.message,
            }),
            { status: 500 }
        );
    }
}
