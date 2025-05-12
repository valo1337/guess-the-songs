import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter is required' },
      { status: 400 }
    );
  }

  try {
    console.log('Searching for artist:', query);
    const response = await fetch(`https://api.deezer.com/search/artist?q=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      throw new Error(`Deezer API responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Deezer API response:', data);

    if (!data.data || !Array.isArray(data.data)) {
      throw new Error('Invalid response format from Deezer API');
    }

    // Format the response to match our needs
    const formattedArtists = data.data.map((artist: any) => ({
      id: artist.id,
      name: artist.name,
      picture: artist.picture_xl || artist.picture_big || artist.picture_medium || artist.picture_small || ''
    }));

    console.log('Formatted artists:', formattedArtists);
    return NextResponse.json({ data: formattedArtists });
  } catch (error) {
    console.error('Error searching artists:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to search artists' },
      { status: 500 }
    );
  }
} 