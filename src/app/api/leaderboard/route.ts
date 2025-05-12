import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const artistId = searchParams.get('artistId');
  const userId = searchParams.get('userId');
  try {
    let leaderboard;
    if (artistId) {
      leaderboard = await prisma.quizAttempt.findMany({
        where: { artistId: artistId.toString() },
        orderBy: [
          { score: 'desc' },
          { time: 'asc' },
        ],
        take: 10,
        include: {
          user: {
            select: { username: true, image: true, id: true },
          },
        },
      });
    } else {
      leaderboard = await prisma.quizAttempt.findMany({
        orderBy: [
          { score: 'desc' },
          { time: 'asc' },
        ],
        take: 10,
        include: {
          user: {
            select: { username: true, image: true, id: true },
          },
        },
      });
    }
    // Format for frontend
    const formatted = leaderboard.map((entry) => ({
      username: entry.user?.username || 'Anonymous',
      score: entry.score,
      time: entry.time,
      image: entry.user?.image || undefined,
      userId: entry.user?.id || undefined,
    }));
    let userRank = null;
    let userBest = null;
    if (userId) {
      let allAttempts;
      if (artistId) {
        allAttempts = await prisma.quizAttempt.findMany({
          where: { artistId: artistId.toString() },
          orderBy: [
            { score: 'desc' },
            { time: 'asc' },
          ],
          include: {
            user: { select: { username: true, image: true, id: true } },
          },
        });
      } else {
        allAttempts = await prisma.quizAttempt.findMany({
          orderBy: [
            { score: 'desc' },
            { time: 'asc' },
          ],
          include: {
            user: { select: { username: true, image: true, id: true } },
          },
        });
      }
      const userIndex = allAttempts.findIndex(a => a.user?.id === userId);
      if (userIndex !== -1) {
        userRank = userIndex + 1;
        const entry = allAttempts[userIndex];
        userBest = {
          username: entry.user?.username || 'You',
          score: entry.score,
          time: entry.time,
          image: entry.user?.image || undefined,
          userId: entry.user?.id || undefined,
        };
      }
    }
    return NextResponse.json({ leaderboard: formatted, userRank, userBest });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
} 