import { connectMongoDB } from "@/libs/mongodb";
import Website from "@/models/webSchema";
import Saran from "@/models/saranSchema";
import Departement from "@/models/departementSchema";
import { NextResponse } from 'next/server';
import Joi from 'joi';
import validator from 'validator';
import { validate as uuidValidate } from 'uuid';

export async function GET(req) {
  await connectMongoDB();

  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  const role = url.searchParams.get('role');
  const type = url.searchParams.get('type');
  
  // Add pagination parameters
  const page = parseInt(url.searchParams.get('page')) || 1;
  const limit = parseInt(url.searchParams.get('limit')) || 10;
  const skip = (page - 1) * limit;

  if (id && role) {
    try {
      let groupSaran;
      let total = 0;

      if (!uuidValidate(id)) {
        groupSaran = await Website.findOne({ link_advice: id }).lean();
        total = await Website.countDocuments({ link_advice: id });
      } else {
        if (type === 'Fakultas') {
          const fakultasData = await Departement.findOne({ _id: id, type: 'Fakultas' }).lean();
          if (!fakultasData) {
            return new NextResponse(JSON.stringify({
              success: false,
              message: "Data Fakultas not found",
            }), { status: 404 });
          }

          const prodiData = await Departement.find({ ref_ids: id, type: 'Prodi' }).lean();
          const websiteDataForFakultas = await Website.find({ ref_id: id })
            .skip(skip)
            .limit(limit)
            .lean();
          const websiteDataForProdi = await Website.find({ 
            ref_id: { $in: prodiData.map(prodi => prodi._id) } 
          })
            .skip(Math.max(0, skip - websiteDataForFakultas.length))
            .limit(Math.max(0, limit - websiteDataForFakultas.length))
            .lean();

          // Get total counts
          const totalFakultasWebsites = await Website.countDocuments({ ref_id: id });
          const totalProdiWebsites = await Website.countDocuments({ 
            ref_id: { $in: prodiData.map(prodi => prodi._id) } 
          });
          total = totalFakultasWebsites + totalProdiWebsites;

          const saranGroup = [...websiteDataForFakultas, ...websiteDataForProdi];
          const groupSarans = await Promise.all(
            saranGroup.map(async (group) => {
              const saranCount = await Saran.countDocuments({ webId: group._id });
              return { ...group, saranCount };
            })
          );

          return new NextResponse(JSON.stringify({
            success: true,
            message: "Data Fakultas and related Prodi retrieved successfully",
            data: groupSarans,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
          }), { status: 200 });
        } else {
          groupSaran = await Website.find({ ref_id: id })
            .skip(skip)
            .limit(limit)
            .lean();
          total = await Website.countDocuments({ ref_id: id });
        }
      }

      if (!groupSaran || groupSaran.length === 0) {
        return new NextResponse(JSON.stringify({
          success: false,
          message: "Data not found",
        }), { status: 404 });
      }

      const saranCount = await Saran.countDocuments({ webId: groupSaran._id });

      return new NextResponse(JSON.stringify({
        success: true,
        message: "Data retrieved successfully",
        data: {
          ...groupSaran,
          saranCount
        },
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }), { status: 200 });

    } catch (error) {
      console.error("Error fetching data by ID:", error);
      return new NextResponse(JSON.stringify({
        success: false,
        message: "Failed to retrieve data by ID",
        error: { details: error.message }
      }), { status: 500 });
    }
  }
  else if (id) {
    try {
      let groupSaran;
      let total = 0;

      if (!uuidValidate(id)) {
        groupSaran = await Website.findOne({ link_advice: id })
          .skip(skip)
          .limit(limit)
          .lean();
        total = await Website.countDocuments({ link_advice: id });
      } else {
        groupSaran = await Website.findById(id).lean();
        total = groupSaran ? 1 : 0;
      }

      if (!groupSaran) {
        return new NextResponse(JSON.stringify({
          success: false,
          message: "Data not found",
        }), { status: 404 });
      }

      const saranCount = await Saran.countDocuments({ webId: groupSaran._id });
      
      return new NextResponse(JSON.stringify({
        success: true,
        message: "Data retrieved successfully",
        data: {
          ...groupSaran,
          saranCount
        },
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }), { status: 200 });

    } catch (error) {
      console.error("Error fetching data by ID:", error);
      return new NextResponse(JSON.stringify({
        success: false,
        message: "Failed to retrieve data by ID",
        error: { details: error.message }
      }), { status: 500 });
    }
  } else {
    try {
      const total = await Website.countDocuments();
      const groupSarans = await Website.find()
        .skip(skip)
        .limit(limit)
        .lean();

      return new NextResponse(JSON.stringify({
        success: true,
        message: "Data retrieved successfully",
        data: groupSarans,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }), { status: 200 });
    } catch (error) {
      console.error("Error fetching all data:", error);
      return new NextResponse(JSON.stringify({
        success: false,
        message: "Failed to retrieve data",
        error: { details: error.message }
      }), { status: 500 });
    }
  }
}


export async function PATCH(req) {
  await connectMongoDB();

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!uuidValidate(id)) {
    return new Response(JSON.stringify({
      success: false,
      message: "Invalid ID format",
      data: null
    }), {
      status: 400,
    });
  }

  try {
    const { name } = await req.json();

    const schema = Joi.object({
      name: Joi.string().min(3).max(100).required(),
    });

    const { error } = schema.validate({ name });
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
      name: validator.escape(name)
    };

    const updateAdviceGroup = await GroupSaran.findOneAndUpdate(
      { _id: id },
      sanitizedData,
      { new: true }
    );

    if (!updateAdviceGroup) {
      return new Response(JSON.stringify({
        success: false,
        message: "Advice group not found",
        data: null
      }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: "Advice group name updated successfully",
      data: updateAdviceGroup
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

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return new NextResponse(JSON.stringify({ message: "ID is required" }), {
        status: 400,
      });
    }

    if (!uuidValidate(id)) {
      return new Response(JSON.stringify({
        success: false,
        message: "Invalid ID format",
        data: null
      }), {
        status: 400,
      });
    }

    await connectMongoDB();
    const adviceGroup = await GroupSaran.findById(id);

    if (!adviceGroup) {
      return new NextResponse(JSON.stringify({ message: "Advice group not found" }), {
        status: 404,
      });
    }

    await Saran.deleteMany({ groupSaranId: id });
    await GroupSaran.findByIdAndDelete(id);

    return new NextResponse(JSON.stringify({ message: "Advice group and related advices deleted" }), {
      status: 200,
    });

  } catch (error) {
    return new NextResponse(JSON.stringify({ message: error.message }), { status: 500 });
  }
}