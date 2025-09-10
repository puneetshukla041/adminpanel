import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Registration from '@/models/Registration';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    const registrations = await Registration.find({});
    return NextResponse.json({ success: true, data: registrations });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
    console.error('Error fetching registrations:', err);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}