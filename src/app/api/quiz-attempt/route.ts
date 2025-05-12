import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { artistId, artistName, score, totalQuestions, time } = await request.json();
    
    if (!artistId || !artistName || score === undefined || !totalQuestions || !time) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const attempt = await prisma.quizAttempt.create({
      data: {
        userId: session.user.id,
        artistId,
        artistName,
        score,
        totalQuestions,
        time,
      },
    });

    return NextResponse.json({ attempt });
  } catch (error) {
    console.error('Error recording quiz attempt:', error);
    return NextResponse.json({ error: 'Failed to record quiz attempt' }, { status: 500 });
  }
} 