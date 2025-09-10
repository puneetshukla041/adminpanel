import { NextResponse } from 'next/server';
import { MongoClient, GridFSBucket, ObjectId } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI!;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid or missing file ID' }, { status: 400 });
    }

    const mongoClient = new MongoClient(MONGODB_URI);
    await mongoClient.connect();
    const db = mongoClient.db();
    const bucket = new GridFSBucket(db, { bucketName: 'uploads' });

    const file = await bucket.find({ _id: new ObjectId(id) }).limit(1).next();
    if (!file) {
      return NextResponse.json({ success: false, error: 'File not found' }, { status: 404 });
    }

    const downloadStream = bucket.openDownloadStream(new ObjectId(id));

    // To serve the file, you'll need to stream the data to the response.
    // This is a simplified approach; in production, you might want a more robust solution.
    const chunks: Uint8Array[] = [];
    for await (const chunk of downloadStream) {
      chunks.push(chunk);
    }

    const buffer = Buffer.concat(chunks);
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': file.contentType || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${file.filename}"`,
      },
    });

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
    console.error('Error serving file:', err);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}