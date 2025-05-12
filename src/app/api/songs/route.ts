import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://api.deezer.com/chart/0/tracks');
    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching songs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch songs' },
      { status: 500 }
    );
  }
} 