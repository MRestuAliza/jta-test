import { connectMongoDB } from "@/libs/mongodb";
// import Website from "@/models/webSchema";
import { v4 as uuidv4 } from 'uuid';
import Joi from 'joi';
import Website from "@/models/webSchema";
import Comment from "@/models/commentSchema";
import Saran from "@/models/saranSchema"
import Departement from "@/models/departementSchema";
import { NextResponse } from "next/server";

function capitalizeEachWord(str) {
    return str.replace(/\b\w/g, char => char.toUpperCase());
}

export async function GET(req) {
    await connectMongoDB();

    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    const role = url.searchParams.get('role');

   
    const page = parseInt(url.searchParams.get('page')) || 1;
    const limit = parseInt(url.searchParams.get('limit')) || 10;
    const skip = (page - 1) * limit;

    try {
        let result;
        let totalItems = 0;

        const isUniversitas = await Departement.findOne({ _id: id, ref_ids: null });
        const isFakultas = await Departement.findOne({ _id: id, type: 'Fakultas' });
        const isProdi = await Departement.findById(id);

        if (role && role.startsWith('Admin')) {
            const departmentName = role.replace(/admin\s+/i, '').trim();

            if (isFakultas) {
               
                const totalFakultasWebsites = await Website.countDocuments({ ref_id: id });
                const totalProdiList = await Departement.countDocuments({ ref_ids: id, type: 'Prodi' });
                totalItems = totalFakultasWebsites + totalProdiList;

               
                const fakultasWebsites = await Website.find({ ref_id: id })
                    .skip(skip)
                    .limit(limit);
                const prodiList = await Departement.find({ ref_ids: id, type: 'Prodi' })
                    .skip(Math.max(0, skip - totalFakultasWebsites))
                    .limit(Math.max(0, limit - fakultasWebsites.length));

                result = {
                    fakultas_websites: fakultasWebsites,
                    prodi_list: prodiList.map(prodi => ({
                        _id: prodi._id,
                        name: prodi.name,
                        type: prodi.type,
                    }))
                };
            } else if (isProdi) {
               
                totalItems = await Website.countDocuments({ ref_id: id });

               
                const prodiWebsites = await Website.find({ ref_id: id })
                    .skip(skip)
                    .limit(limit);

                result = {
                    prodi_websites: prodiWebsites
                };
            } else {
                return new NextResponse(JSON.stringify({
                    message: 'Role does not match the department'
                }), { status: 403 });
            }
        } else if (isUniversitas) {
           
            const totalUniversityWebsites = await Website.countDocuments({ ref_id: id });
            const totalFakultasList = await Departement.countDocuments({ ref_ids: id, type: 'Fakultas' });
            totalItems = totalUniversityWebsites + totalFakultasList;

            const universityWebsites = await Website.find({ ref_id: id })
                .skip(skip)
                .limit(limit);
            const fakultasList = await Departement.find({ ref_ids: id, type: 'Fakultas' })
                .skip(Math.max(0, skip - totalUniversityWebsites))
                .limit(Math.max(0, limit - universityWebsites.length));

            result = {
                university_websites: universityWebsites,
                fakultas_list: fakultasList.map(fakultas => ({
                    id: fakultas._id,
                    name: fakultas.name,
                    type: fakultas.type,
                }))
            };
        } else if (isFakultas) {
           
            const totalFakultasWebsites = await Website.countDocuments({ ref_id: id });
            const totalProdiList = await Departement.countDocuments({ ref_ids: id, type: 'Prodi' });
            totalItems = totalFakultasWebsites + totalProdiList;
            const fakultasWebsites = await Website.find({ ref_id: id })
                .skip(skip)
                .limit(limit);
            const prodiList = await Departement.find({ ref_ids: id, type: 'Prodi' })
                .skip(Math.max(0, skip - totalFakultasWebsites))
                .limit(Math.max(0, limit - fakultasWebsites.length));

            result = {
                fakultas_websites: fakultasWebsites,
                prodi_list: prodiList.map(prodi => ({
                    _id: prodi._id,
                    name: prodi.name,
                    type: prodi.type,
                }))
            };
        } else if (isProdi) {    
            totalItems = await Website.countDocuments({ ref_id: id });
            const prodiWebsites = await Website.find({ ref_id: id })
                .skip(skip)
                .limit(limit);

            result = {
                prodi_websites: prodiWebsites
            };
        } else {
            return new NextResponse(JSON.stringify({
                message: 'Invalid ID or level not found'
            }), { status: 400 });
        }

        return new NextResponse(JSON.stringify({
            success: true,
            data: result,
            total: totalItems,
            page: page,
            limit: limit,
            totalPages: Math.ceil(totalItems / limit)
        }), {
            status: 200,
        });
    } catch (error) {
        return new NextResponse(JSON.stringify({
            success: false,
            error: error.message
        }), {
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
            type: Joi.string().valid('Fakultas', 'Prodi').required(),
            ref_ids: Joi.array().items(Joi.string().trim().optional()).required(),
        });

        const { error, value } = schema.validate(body);
        if (error) {
            return new Response(JSON.stringify({ 
                success: false,
                error: error.details[0].message 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        value.name = capitalizeEachWord(value.name);
        const existingDepartment = await Departement.findOne({
            name: value.name,
            type: value.type
        });

        if (existingDepartment) {
            return new Response(JSON.stringify({
                success: false,
                error: `${value.type} dengan nama "${value.name}" sudah ada`
            }), {
                status: 409,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        if (value.type === 'Fakultas' && value.ref_ids.length !== 1) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Fakultas harus memiliki satu referensi ke Universitas'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        if (value.type === 'Prodi') {
            if (value.ref_ids.length !== 2) {
                return new Response(JSON.stringify({
                    success: false,
                    error: 'Prodi harus memiliki dua referensi (Universitas dan Fakultas)'
                }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                });
            }

            const fakultas = await Departement.findOne({
                _id: value.ref_ids[1],
                type: 'Fakultas'
            });

            if (!fakultas) {
                return new Response(JSON.stringify({
                    success: false,
                    error: 'Fakultas yang direferensikan tidak ditemukan'
                }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                });
            }
        }

        const sanitizedBody = {
            _id: uuidv4(),
            ...value,
            created_at: new Date(),
            updated_at: new Date()
        };

        const departement = await Departement.create(sanitizedBody);
        return new Response(JSON.stringify({ 
            success: true, 
            message: `${value.type} berhasil dibuat`,
            data: departement 
        }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Error creating department:', error);
        return new Response(JSON.stringify({ 
            success: false,
            error: 'Internal server error',
            details: error.message
        }), {
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
        console.log("id", departmentId);

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


// export async function DELETE(request) {
//     await connectMongoDB();

//     try {
//         const { searchParams } = new URL(request.url);
//         const id = searchParams.get("id");

//         if (!id) {
//             return new NextResponse(JSON.stringify({ success: false, message: 'ID tidak ditemukan' }), { status: 400 });
//         }

//         const institution = await Departement.findByIdAndDelete({ _id: id });
//         if (institution) {
//             return new NextResponse(JSON.stringify({ success: true, message: 'Fakultas berhasil dihapus' }), { status: 200 });
//         }

//         const web = await Website.findByIdAndDelete(id);
//         console.log("sdaff", web.link_advice);

//         if (!web) {
//             return new Response(JSON.stringify({ success: false, message: 'Website tidak ditemukan' }), { status: 404 });
//         }

//         const advice = await Saran.find({ link: web.link_advice });
//         if (!advice.length) {
//             return new Response(JSON.stringify({ success: false, message: 'Saran tidak ditemukan' }), { status: 404 });
//         }

//         console.log("asddacdsacds", advice);

//         for (const adv of advice) {
//             await Comment.deleteMany({ saran_id: adv._id });
//         }

//         await Saran.deleteMany({ link: web.link_advice });
//         return new Response(JSON.stringify({ success: true, message: 'Website berhasil dihapus' }), { status: 200 });
//     } catch (error) {
//         console.error(error);
//         return new Response(JSON.stringify({ success: false, message: 'Gagal menghapus website terkait', error: error.message }), { status: 500 });
//     }
// }

export async function DELETE(request) {
    await connectMongoDB();

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return new NextResponse(JSON.stringify({ 
                success: false, 
                message: 'ID tidak ditemukan' 
            }), { status: 400 });
        }
        const institution = await Departement.findById(id);
        if (institution) {
            await Departement.findByIdAndDelete(id);
            return new NextResponse(JSON.stringify({ 
                success: true, 
                message: 'Fakultas berhasil dihapus' 
            }), { status: 200 });
        }
        const website = await Website.findById(id);
        if (!website) {
            return new NextResponse(JSON.stringify({ 
                success: false, 
                message: 'Data tidak ditemukan' 
            }), { status: 404 });
        }
        if (website.link_advice) {
            const relatedSaran = await Saran.find({ link: website.link_advice });
            for (const saran of relatedSaran) {
                await Comment.deleteMany({ saran_id: saran._id });
            }
            await Saran.deleteMany({ link: website.link_advice });
        }
        await Website.findByIdAndDelete(id);

        return new NextResponse(JSON.stringify({ 
            success: true, 
            message: 'Website dan data terkait berhasil dihapus' 
        }), { status: 200 });

    } catch (error) {
        console.error("Delete error:", error);
        return new NextResponse(JSON.stringify({ 
            success: false, 
            message: 'Gagal menghapus data',
            error: error.message 
        }), { status: 500 });
    }
}