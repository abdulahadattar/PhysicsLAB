import { NextRequest, NextResponse } from 'next/server';
import fetch from 'node-fetch';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const pdfUrl = searchParams.get('url');

  if (!pdfUrl) {
    return NextResponse.json({ message: 'Missing PDF URL parameter' }, { status: 400 });
  }

  try {
    const response = await fetch(pdfUrl);

    if (!response.ok) {
      return NextResponse.json(
        { message: `Failed to fetch PDF from source: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/pdf')) {
      return NextResponse.json(
        { message: 'The linked resource is not a PDF file.' },
        { status: 400 }
      );
    }

    const pdfBuffer = await response.arrayBuffer();

    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    headers.set('Access-Control-Allow-Origin', '*'); // Allow CORS for your frontend

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: headers,
    });

  } catch (error: any) {
    console.error('PDF Proxy Error:', error);
    return NextResponse.json(
      { message: 'Error proxying PDF: ' + error.message },
      { status: 500 }
    );
  }
}