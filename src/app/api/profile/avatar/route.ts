import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs/promises';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

// Maximum file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    // Get server session
    const session = await getServerSession();
    
    // Validate authentication
    if (!session?.user?.email) {
      return NextResponse.json({ 
        error: 'Not authenticated' 
      }, { status: 401 });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('avatar');
    
    // Validate file
    if (!file || typeof file === 'string') {
      return NextResponse.json({ 
        error: 'No file uploaded' 
      }, { status: 400 });
    }

    // Validate file type
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validImageTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' 
      }, { status: 400 });
    }

    // Validate file size
    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.length > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        error: 'File size must be less than 5MB' 
      }, { status: 400 });
    }

    // Generate unique filename
    const ext = file.name.split('.').pop();
    const filename = `${session.user.id}_${randomBytes(8).toString('hex')}.${ext}`;
    
    // Ensure avatars directory exists
    const avatarsDir = path.join(process.cwd(), 'public', 'avatars');
    await fs.mkdir(avatarsDir, { recursive: true });
    
    // Save file
    const filepath = path.join(avatarsDir, filename);
    await fs.writeFile(filepath, buffer);
    const imageUrl = `/avatars/${filename}`;

    // Update user in database
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: { 
        image: imageUrl,
        updatedAt: new Date()
      },
    });

    // Return success response
    return NextResponse.json({ 
      image: imageUrl,
      message: 'Avatar successfully updated'
    });
  } catch (error) {
    // Log error for server-side tracking
    console.error('Avatar upload error:', error);

    // Return generic error response
    return NextResponse.json({ 
      error: 'An unexpected error occurred',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 