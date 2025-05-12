import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const artistId = searchParams.get('id');
  const artistName = searchParams.get('name');

  if (!artistId && !artistName) {
    return NextResponse.json(
      { error: 'Artist ID or name is required' },
      { status: 400 }
    );
  }

  try {
    let searchTracks: any[] = [];
    let topTracks: any[] = [];
    // Fetch up to 100 tracks from search
    if (artistName) {
      const searchUrl = `https://api.deezer.com/search/track?q=artist:%22${encodeURIComponent(artistName)}%22&limit=100`;
      const searchRes = await fetch(searchUrl);
      if (searchRes.ok) {
        const searchData = await searchRes.json();
        if (searchData.data && Array.isArray(searchData.data)) {
          searchTracks = searchData.data;
        }
      }
    }
    // Also fetch top tracks for artist ID
    if (artistId) {
      const topUrl = `https://api.deezer.com/artist/${artistId}/top?limit=100`;
      const topRes = await fetch(topUrl);
      if (topRes.ok) {
        const topData = await topRes.json();
        if (topData.data && Array.isArray(topData.data)) {
          topTracks = topData.data;
        }
      }
    }
    // Combine and deduplicate by track id
    const allTracksMap = new Map();
    [...searchTracks, ...topTracks].forEach((track: any) => {
      if (track && track.id) allTracksMap.set(track.id, track);
    });
    let allTracks = Array.from(allTracksMap.values());
    // Filter out songs without preview
    let songsWithPreview = allTracks.filter((track: any) => track.preview);
    // Further filter: only tracks where artist is main or in contributors
    if (artistId) {
      const artistIdNum = Number(artistId);
      songsWithPreview = songsWithPreview.filter((track: any) => {
        if (track.artist && track.artist.id === artistIdNum) return true;
        if (Array.isArray(track.contributors)) {
          return track.contributors.some((c: any) => c.id === artistIdNum);
        }
        return false;
      });
    }
    if (songsWithPreview.length === 0) {
      throw new Error('No songs with preview available for this artist');
    }
    return NextResponse.json({ data: songsWithPreview });
  } catch (error) {
    console.error('Error fetching artist songs:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch artist songs' },
      { status: 500 }
    );
  }
} 