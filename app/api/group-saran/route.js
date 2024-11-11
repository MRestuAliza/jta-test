import { connectMongoDB } from "@/libs/mongodb";
import Website from "@/models/tes/webSchema";
import Saran from "@/models/tes/saranSchema";
import Departement from "@/models/tes/departementSchema";
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

  if (id && role) {
    try {
      let groupSaran;

      if (!uuidValidate(id)) {
        groupSaran = await Website.findOne({ link_advice: id }).lean();
      } else {
        if (type === 'Fakultas') {
          const fakultasData = await Departement.findOne({ _id: id, type: 'Fakultas' }).lean();
          if (!fakultasData) {
            return new NextResponse(JSON.stringify({
              success: false,
              message: "Data Fakultas not found",
            }), {
              status: 404,
              headers: {
                'Content-Type': 'application/json'
              }
            });
          }

          const prodiData = await Departement.find({ ref_ids: id, type: 'Prodi' }).lean();
          const websiteDataForFakultas = await Website.find({ ref_id: id }).lean();
          const websiteDataForProdi = await Website.find({ ref_id: { $in: prodiData.map(prodi => prodi._id) } }).lean();
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
            data: groupSarans
          }), {
            status: 200,
            headers: {
              'Content-Type': 'application/json'
            }
          });
        } else {

          groupSaran = await Website.find({ ref_id: id }).lean();
        }
      }

      if (!groupSaran || groupSaran.length === 0) {
        return new NextResponse(JSON.stringify({
          success: false,
          message: "Data not found",
        }), {
          status: 404,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }

      const saranCount = await Saran.countDocuments({ webId: groupSaran._id });

      return new NextResponse(JSON.stringify({
        success: true,
        message: "Data retrieved successfully",
        data: {
          ...groupSaran,
          saranCount
        }
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      });

    } catch (error) {
      console.error("Error fetching data by ID:", error);
      return new NextResponse(JSON.stringify({
        success: false,
        message: "Failed to retrieve data by ID",
        error: {
          details: error.message,
        }
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
  }
  else if (id) {
    try {
      let groupSaran;
      if (!uuidValidate(id)) {
        groupSaran = await Website.findOne({ link_advice: id }).lean();
      } else {
        groupSaran = await Website.findById(id).lean();
      }

      if (!groupSaran) {
        return new NextResponse(JSON.stringify({
          success: false,
          message: "Data not found",
        }), {
          status: 404,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }

      const saranCount = await Saran.countDocuments({ webId: groupSaran._id });
      return new NextResponse(JSON.stringify({
        success: true,
        message: "Data retrieved successfully",
        data: {
          ...groupSaran,
          saranCount
        }
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      });

    } catch (error) {
      console.error("Error fetching data by ID:", error);
      return new NextResponse(JSON.stringify({
        success: false,
        message: "Failed to retrieve data by ID",
        error: {
          details: error.message,
        }
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
  } else {
    try {
      const groupSarans = await Website.find().lean();

      return new NextResponse(JSON.stringify({
        success: true,
        message: "Data retrieved successfully",
        data: groupSarans
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error("Error fetching all data:", error);
      return new NextResponse(JSON.stringify({
        success: false,
        message: "Failed to retrieve data",
        error: {
          details: error.message,
        }
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      });
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