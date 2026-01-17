import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let text = '';

    if (file.name.endsWith('.pdf')) {
      // For PDF support, consider using a server-side solution or external API
      // For now, we'll prompt users to convert PDF to TXT
      return NextResponse.json(
        { error: 'PDF parsing requires additional setup. Please upload DOCX or TXT format, or copy-paste your resume text.' },
        { status: 400 }
      );
    } else if (file.name.endsWith('.docx')) {
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else if (file.name.endsWith('.txt')) {
      text = buffer.toString('utf-8');
    } else {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload DOCX or TXT.' },
        { status: 400 }
      );
    }

    if (!text || text.trim().length < 50) {
      return NextResponse.json(
        { error: 'Resume file appears to be empty or too short. Please check your file.' },
        { status: 400 }
      );
    }

    return NextResponse.json({ text, filename: file.name });
  } catch (error) {
    console.error('Error parsing file:', error);
    return NextResponse.json(
      { error: 'Failed to parse file. Please try again.' },
      { status: 500 }
    );
  }
}
