import { connectMongoDB } from "@/libs/mongodb";
// import Website from "@/models/webSchema";
import { v4 as uuidv4 } from 'uuid';
import Joi from 'joi';
import Website from "@/models/tes/webSchema";
import Comment from "@/models/tes/commentSchema";
import Saran from "@/models/tes/saranSchema"
import Departement from "@/models/tes/departementSchema";
import { NextResponse } from "next/server";

function capitalizeEachWord(str) {
    return str.replace(/\b\w/g, char => char.toUpperCase());
}

export async function GET(req) {
    await connectMongoDB();

    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    const name = url.searchParams.get('name');
    const role = url.searchParams.get('role');

    try {
        let result;

        const isUniversitas = await Departement.findOne({ _id: id, ref_ids: null });
        const isFakultas = await Departement.findOne({ _id: id, type: 'Fakultas' });
        const isProdi = await Departement.findById(id);

        if (role && role.startsWith('Admin')) {
            const departmentName = role.replace(/admin\s+/i, '').trim()
            console.log(departmentName);

            if (isFakultas && isFakultas.name === departmentName) {
                const fakultasWebsites = await Website.find({ ref_id: id });
                const prodiList = await Departement.find({ ref_ids: id, type: 'Prodi' });

                result = {
                    fakultas_websites: fakultasWebsites,
                    prodi_list: prodiList.map(prodi => ({
                        _id: prodi._id,
                        name: prodi.name,
                        type: prodi.type,
                    }))
                };
            } else if (isProdi) {
                const prodiWebsites = await Website.find({ ref_id: id });
                result = {
                    prodi_websites: prodiWebsites
                };
            } else {
                return new NextResponse(JSON.stringify({ message: 'Role does not match the department' }), { status: 403 });
            }
        } else if (isUniversitas) {
            const universityWebsites = await Website.find({ ref_id: id });
            const fakultasList = await Departement.find({ ref_ids: id, type: 'Fakultas' });
            result = {
                university_websites: universityWebsites,
                fakultas_list: fakultasList.map(fakultas => ({
                    id: fakultas._id,
                    name: fakultas.name,
                    type: fakultas.type,
                }))
            };
        } else if (isFakultas) {
            const fakultasWebsites = await Website.find({ ref_id: id });
            const prodiList = await Departement.find({ ref_ids: id, type: 'Prodi' });

            result = {
                fakultas_websites: fakultasWebsites,
                prodi_list: prodiList.map(prodi => ({
                    _id: prodi._id,
                    name: prodi.name,
                    type: prodi.type,
                }))
            };
        } else if (isProdi) {
            const prodiWebsites = await Website.find({ ref_id: id });
            result = {
                prodi_websites: prodiWebsites
            };
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
    await connectMongoDB();

    try {
        const body = await req.json();
        const schema = Joi.object({
            name: Joi.string().trim().pattern(/^[a-zA-Z\s]+$/).required(),
            type: Joi.string().trim().pattern(/^[a-zA-Z\s]+$/).required(),
            ref_ids: Joi.array().items(Joi.string().trim().optional()).optional(),
        });

        const { error, value } = schema.validate(body);
        if (error) {
            return new Response(JSON.stringify({ error: error.details[0].message }), {
                status: 400,
            });
        }

        value.name = capitalizeEachWord(value.name);

        const sanitizedBody = {
            id: uuidv4(),
            ...value,
        };

        const departement = await Departement.create(sanitizedBody);
        return new Response(JSON.stringify({ success: true, data: departement }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error creating department:', error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

export async function PATCH(req) {
    await connectMongoDB();

    try {
        const { searchParams } = new URL(req.url);
        const departmentId = searchParams.get("id");
        console.log("id",departmentId);
        
        const body = await req.json();

        if (!departmentId) {
            return new NextResponse(JSON.stringify({ success: false, message: 'ID tidak ditemukan' }), { status: 400 });
        }

        const department = await Departement.findById(departmentId);
        if (!department) {
            return new NextResponse(JSON.stringify({ success: false, message: 'Departemen tidak ditemukan' }), { status: 404 });
        }

        if (department.type === 'Fakultas') {
            if (!body.name) {
                return new NextResponse(JSON.stringify({ success: false, message: 'Nama harus diisi' }), { status: 400 });
            }

            const updatedFakultas = await Departement.findByIdAndUpdate(
                departmentId,
                { name: body.name },
                { new: true }
            );

            return new NextResponse(JSON.stringify({ success: true, data: updatedFakultas }), { status: 200 });
        }

        if (department.type === 'Prodi') {
            const updatedFields = {};

            if (body.name) {
                updatedFields.name = body.name;
            }

            if (body.ref_ids && Array.isArray(body.ref_ids) && body.ref_ids.length === 2) {
                updatedFields.ref_ids = body.ref_ids;
            } else {
                updatedFields.ref_ids = department.ref_ids;
            }

            const updatedProdi = await Departement.findByIdAndUpdate(
                departmentId,
                updatedFields,
                { new: true }
            );

            return new NextResponse(JSON.stringify({ success: true, data: updatedProdi }), { status: 200 });
        }

        return new NextResponse(JSON.stringify({ success: false, message: 'Tipe departemen tidak valid' }), { status: 400 });

    } catch (error) {
        console.error(error);
        return new NextResponse(JSON.stringify({ success: false, message: 'Gagal memperbarui departemen', error: error.message }), { status: 500 });
    }
}


export async function DELETE(request) {
    await connectMongoDB();

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return new NextResponse(JSON.stringify({ success: false, message: 'ID tidak ditemukan' }), { status: 400 });
        }

        const institution = await Departement.findByIdAndDelete({ _id: id });
        if (institution) {
            return new NextResponse(JSON.stringify({ success: true, message: 'Fakultas berhasil dihapus' }), { status: 200 });
        }

        const web = await Website.findByIdAndDelete(id);
        console.log("sdaff", web.link_advice);
        
        if (!web) {
            return new Response(JSON.stringify({ success: false, message: 'Website tidak ditemukan' }), { status: 404 });
        }

        const advice = await Saran.find({ link: web.link_advice });
        if (!advice.length) {
            return new Response(JSON.stringify({ success: false, message: 'Saran tidak ditemukan' }), { status: 404 });
        }

        console.log("asddacdsacds", advice);

        for (const adv of advice) {
            await Comment.deleteMany({ saran_id: adv._id });
        }

        await Saran.deleteMany({ link: web.link_advice });
        return new Response(JSON.stringify({ success: true, message: 'Website berhasil dihapus' }), { status: 200 });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ success: false, message: 'Gagal menghapus website terkait', error: error.message }), { status: 500 });
    }
}