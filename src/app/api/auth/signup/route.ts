import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { email, username, password, name } = await request.json();
    
    console.log('Signup attempt:', { email, username, name });

    if (!email || !username || !password) {
      console.error('Missing required fields');
      return NextResponse.json({ 
        error: 'Missing required fields',
        details: {
          email: !!email,
          username: !!username,
          password: !!password
        }
      }, { status: 400 });
    }

    // Check if email or username already exists
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username },
        ],
      },
    });

    if (existing) {
      console.error('Email or username already in use', { 
        existingEmail: existing.email, 
        existingUsername: existing.username 
      });
      return NextResponse.json({ 
        error: 'Email or username already in use',
        details: {
          emailTaken: existing.email === email,
          usernameTaken: existing.username === username
        }
      }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 10);
    
    try {
      const user = await prisma.user.create({
        data: {
          email,
          username,
          name: name || username, // Use username if name is not provided
          password: hashed,
        },
        select: {
          id: true,
          email: true,
          username: true,
          name: true,
          createdAt: true,
        },
      });

      console.log('User created successfully:', { 
        id: user.id, 
        email: user.email, 
        username: user.username 
      });

      return NextResponse.json({ 
        user,
        message: 'User created successfully' 
      });
    } catch (createError) {
      console.error('Error creating user:', createError);
      return NextResponse.json({ 
        error: 'Failed to create user',
        details: createError instanceof Error ? createError.message : createError
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Signup route error:', error);
    return NextResponse.json({ 
      error: 'Failed to process signup',
      details: error instanceof Error ? error.message : error
    }, { status: 500 });
  }
} 