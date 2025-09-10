import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Registration from '@/models/Registration';
import * as XLSX from 'xlsx';
import PDFDocument from 'pdfkit';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format');
    const ids = searchParams.get('ids')?.split(',');

    await connectDB();
    let registrations;

    if (ids && ids.length > 0 && ids[0] !== 'all') {
      registrations = await Registration.find({ _id: { $in: ids } });
    } else {
      registrations = await Registration.find({});
    }

    if (!registrations || registrations.length === 0) {
      return NextResponse.json({ success: false, error: 'No data to export' }, { status: 404 });
    }

    const cleanedData = registrations.map(reg => {
      const obj = reg.toObject();
      return {
        'Ticket No.': obj._id.toString(),
        'Full Name': obj.fullName,
        'Email Address': obj.email,
        'Phone Number': obj.phoneNumber,
        'Date of Birth': obj.dob ? obj.dob.toISOString().split('T')[0] : 'N/A',
        'Experience': obj.experience,
        'Institution': obj.institution,
        'Call Date/Time': obj.callDateTime ? new Date(obj.callDateTime).toLocaleString() : 'N/A',
        'Heard About Us': obj.hearAboutUs,
        'Current Profession': obj.currentProfession,
        'Specialization': obj.specialization,
        'Learning Goals': obj.learningGoals,
        'Training Programs': obj.trainingPrograms.join(', '),
        'Additional Programs': obj.additionalPrograms.join(', '),
        'Status': obj.status,
      };
    });

    if (format === 'excel') {
      const worksheet = XLSX.utils.json_to_sheet(cleanedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Registrations');
      const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="registrations.xlsx"`,
        },
      });
    }

    if (format === 'pdf') {
      const doc = new PDFDocument();
      const buffers: any[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const buffer = Buffer.concat(buffers);
        return new NextResponse(buffer, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="registrations.pdf"`,
          },
        });
      });

      doc.fontSize(16).text('Registration Data', { align: 'center' }).moveDown();

      cleanedData.forEach(item => {
        doc.fontSize(12).text(`Ticket No: ${item['Ticket No.']}`);
        doc.fontSize(10).text(`Full Name: ${item['Full Name']}`);
        doc.text(`Email: ${item['Email Address']}`);
        doc.text(`Profession: ${item['Current Profession']}`);
        doc.text('---').moveDown();
      });

      doc.end();
      return new NextResponse(doc);
    }

    return NextResponse.json({ success: false, error: 'Invalid format specified' }, { status: 400 });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
    console.error('Export error:', err);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}