// src/app/api/export/route.ts

import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import RegistrationModel from '@/models/Registration';
import * as XLSX from 'xlsx';
import PDFDocument from 'pdfkit';

const connectDB = async () => {
  if (mongoose.connections[0].readyState) {
    return;
  }
  await mongoose.connect(process.env.MONGODB_URI!);
};

export async function GET(request: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') as 'pdf' | 'excel';
  const ids = searchParams.get('ids');

  let registrations;
  try {
    if (ids === 'all') {
      registrations = await RegistrationModel.find({});
    } else {
      const idArray = ids?.split(',') || [];
      registrations = await RegistrationModel.find({ _id: { $in: idArray } });
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch data for export' }, { status: 500 });
  }

  if (format === 'excel') {
    const ws = XLSX.utils.json_to_sheet(registrations);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Registrations');
    const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="registrations.xlsx"',
      },
    });
  }

  if (format === 'pdf') {
    const doc = new PDFDocument();
    const buffers: Buffer[] = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(buffers);
      resolve(pdfBuffer);
    });
    
    // PDF generation logic (simplified)
    doc.fontSize(25).text('Training Registrations Report', { align: 'center' });
    doc.moveDown();
    registrations.forEach((reg, index) => {
      doc.fontSize(14).text(`--- Registration ${index + 1} ---`);
      doc.fontSize(12).text(`Full Name: ${reg.fullName}`);
      doc.fontSize(12).text(`Email: ${reg.email}`);
      doc.fontSize(12).text(`Status: ${reg.status}`);
      doc.moveDown();
    });
    doc.end();

    return new NextResponse(doc as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="registrations.pdf"',
      },
    });
  }

  return NextResponse.json({ success: false, error: 'Invalid format' }, { status: 400 });
}