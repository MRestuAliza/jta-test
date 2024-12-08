import { connectMongoDB } from "@/libs/mongodb";
import Website from "@/models/webSchema";
import Saran from "@/models/saranSchema";
import Departement from "@/models/departementSchema";

export async function GET(req) {
    await connectMongoDB();
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    const role = url.searchParams.get('role');

    try {
        if (role && role.startsWith('Admin')) {
            const department = await Departement.findById(id);
            if (!department) {
                return Response.json(
                    { success: false, message: 'Department not found' },
                    { status: 404 }
                );
            }

            let saranCounts = {};

            if (department.type === "Fakultas") {
                // Get fakultas websites first
                const fakultasWebsites = await Website.aggregate([
                    {
                        $match: {
                            ref_id: id
                        }
                    },
                    {
                        $lookup: {
                            from: 'sarans',
                            localField: '_id',
                            foreignField: 'webId',
                            as: 'sarans'
                        }
                    },
                    {
                        $project: {
                            name: 1,
                            saranCount: { $size: '$sarans' }
                        }
                    }
                ]);
        
                // Add fakultas websites to saranCounts
                fakultasWebsites.forEach(website => {
                    saranCounts[website.name] = website.saranCount;
                });
        
                // Then get all prodi under this fakultas and their saran counts
                const prodiList = await Departement.find(
                    { ref_ids: id, type: 'Prodi' }
                ).lean();
        
                // Get saran counts for each prodi
                await Promise.all(
                    prodiList.map(async (prodi) => {
                        const prodiSaranCount = await Website.aggregate([
                            {
                                $match: {
                                    ref_id: prodi._id.toString()
                                }
                            },
                            {
                                $lookup: {
                                    from: 'sarans',
                                    localField: '_id',
                                    foreignField: 'webId',
                                    as: 'sarans'
                                }
                            },
                            {
                                $group: {
                                    _id: null,
                                    totalSaran: { $sum: { $size: '$sarans' } }
                                }
                            }
                        ]);
        
                        // Add prodi to saranCounts
                        saranCounts[prodi.name] = prodiSaranCount[0]?.totalSaran || 0;
                    })
                );
        
            } else if (department.type === "Prodi") {
                const prodiPipeline = [
                    {
                        $match: {
                            ref_id: id,
                            ref_model: "Prodi"
                        }
                    },
                    {
                        $lookup: {
                            from: 'sarans',
                            localField: '_id',
                            foreignField: 'webId',
                            as: 'sarans'
                        }
                    },
                    {
                        $project: {
                            name: '$name',
                            saranCount: { $size: '$sarans' }
                        }
                    },
                    {
                        $group: {
                            _id: '$name',
                            count: { $sum: '$saranCount' }
                        }
                    },
                    { $sort: { count: -1 } }
                ];

                const prodiResult = await Website.aggregate(prodiPipeline);
                saranCounts = prodiResult.reduce((acc, { _id, count }) => {
                    acc[_id || 'Unknown'] = count;
                    return acc;
                }, {});
            }

            return Response.json({
                success: true,
                message: "Jumlah saran berhasil dihitung",
                data: saranCounts
            });
        } else {
            const pipeline = [
                {
                    $lookup: {
                        from: 'departements',
                        localField: 'ref_id',
                        foreignField: '_id',
                        as: 'department'
                    }
                },
                {
                    $lookup: {
                        from: 'sarans',
                        localField: '_id',
                        foreignField: 'webId',
                        as: 'sarans'
                    }
                },
                {
                    $project: {
                        name: {
                            $cond: {
                                if: { $eq: ['$ref_model', 'Universitas'] },
                                then: 'Universitas',
                                else: {
                                    $concat: [
                                        { $arrayElemAt: ['$department.type', 0] },
                                        ' ',
                                        { $arrayElemAt: ['$department.name', 0] }
                                    ]
                                }
                            }
                        },
                        saranCount: { $size: '$sarans' }
                    }
                },
                {
                    $group: {
                        _id: '$name',
                        count: { $sum: '$saranCount' }
                    }
                },
                { $sort: { count: -1 } }
            ];

            const result = await Website.aggregate(pipeline);
            const saranCounts = result.reduce((acc, { _id, count }) => {
                acc[_id || 'Unknown'] = count;
                return acc;
            }, {});

            return Response.json({
                success: true,
                message: "Jumlah saran berhasil dihitung",
                data: saranCounts
            });
        }
    } catch (error) {
        console.error("Error counting saran:", error);
        return Response.json({
            success: false,
            message: "Gagal menghitung jumlah saran",
            error: error.message
        }, { status: 500 });
    }
}