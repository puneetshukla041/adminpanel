import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Registration from "@/models/Registration";

// POST => Create new registration
export async function POST(req: Request) {
  try {
    const body = await req.json();
    await connectDB();

    const newRegistration = new Registration(body);
    await newRegistration.save();

    return NextResponse.json({ success: true, data: newRegistration });
  } catch (error) {
    console.error("❌ Registration Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to register" },
      { status: 500 }
    );
  }
}

// GET => Fetch all registrations (for admin dashboard later)
export async function GET() {
  try {
    await connectDB();
    const registrations = await Registration.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: registrations });
  } catch (error) {
    console.error("❌ Fetch Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch registrations" },
      { status: 500 }
    );
  }
}
