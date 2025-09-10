import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Registration from "@/models/Registration";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const { id } = params;
    const body = await req.json();

    const updatedRegistration = await Registration.findByIdAndUpdate(
      id,
      { $set: { status: body.status, isExpired: body.isExpired } },
      { new: true } // returns the updated document
    );

    if (!updatedRegistration) {
      return NextResponse.json({ success: false, error: "Registration not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedRegistration });
  } catch (err: unknown) {
    console.error("❌ Error updating registration:", err);
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}