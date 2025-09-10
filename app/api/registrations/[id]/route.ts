import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Registration from '@/models/Registration';
import mongoose from 'mongoose';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const { status, isExpired } = await req.json();

  if (!id) {
    return NextResponse.json({ success: false, error: 'Registration ID is required' }, { status: 400 });
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ success: false, error: 'Invalid Registration ID' }, { status: 400 });
  }

  try {
    await connectDB();
    const updatedRegistration = await Registration.findByIdAndUpdate(
      id,
      { status: status, isExpired: isExpired },
      { new: true, runValidators: true }
    );

    if (!updatedRegistration) {
      return NextResponse.json({ success: false, error: 'Registration not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedRegistration });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
    console.error(`Error updating registration ${id}:`, err);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}