// src/app/api/registrations/route.ts

import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import RegistrationModel from '@/models/Registration'; // Assuming you have a Mongoose model

// Connect to your database
const connectDB = async () => {
  if (mongoose.connections[0].readyState) {
    return;
  }
  await mongoose.connect(process.env.MONGODB_URI!);
};

// GET all registrations
export async function GET() {
  await connectDB();
  try {
    const registrations = await RegistrationModel.find({});
    return NextResponse.json({ success: true, data: registrations });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch data' }, { status: 500 });
  }
}

// PUT to update a single registration status
export async function PUT(request: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
  }

  const { status, isExpired } = await request.json();

  try {
    const updatedReg = await RegistrationModel.findByIdAndUpdate(
      id,
      { status, isExpired },
      { new: true, runValidators: true }
    );
    if (!updatedReg) {
      return NextResponse.json({ success: false, error: 'Registration not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updatedReg });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update status' }, { status: 500 });
  }
}