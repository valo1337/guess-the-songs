'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import EndGameScreen from './EndGameScreen';
import { useSession } from 'next-auth/react';

interface Song {
  id: number;
  title: string;
  artist: string;
  preview: string;
  album?: { cover_medium?: string };
  cover?: string;
}

interface Artist {
  id: number;
  name: string;
  picture: string;
}

function getSongCover(song: Song) {
  return song.album?.cover_medium || song.cover || '';
}

function getRandomSongs(songs: Song[], correctSong: Song, count: number) {
  const others = songs.filter((s) => s.id !== correctSong.id);
  const shuffled = others.sort(() => 0.5 - Math.random());
  return [correctSong, ...shuffled.slice(0, count - 1)].sort(() => 0.5 - Math.random());
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function CustomAudioPlayer({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    setCurrent(0);
    setPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [src]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  const onTimeUpdate = () => {
    if (audioRef.current) setCurrent(audioRef.current.currentTime);
  };
  const onLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  };
  const onSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Number(e.target.value);
      setCurrent(Number(e.target.value));
    }
  };
  const onVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      audioRef.current.volume = Number(e.target.value);
      setVolume(Number(e.target.value));
    }
  };
  const skip = (amount: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + amount));
    }
  };
  const onEnded = () => setPlaying(false);

  return (
    <div className="w-full flex flex-col items-center">
      <div className={`vinyl-record ${playing ? 'playing' : ''}`}>
        <img src="/vinyl-placeholder.svg" alt="Vinyl Record" />
      </div>
      <div className="audio-player bg-[#232834] rounded-2xl px-6 py-3 flex items-center gap-4 w-full max-w-2xl shadow-lg">
        <div className="audio-controls">
          <button onClick={() => skip(-15)} className="text-gray-300 hover:text-white">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v8m0 0l-4-4m4 4l4-4M5 12a7 7 0 1114 0 7 7 0 01-14 0z" />
            </svg>
          </button>
        <button onClick={togglePlay} className="text-gray-300 hover:text-white">
          {playing ? (
              <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" />
                <rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" />
              </svg>
          ) : (
              <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <polygon points="6,4 20,12 6,20" fill="currentColor" />
              </svg>
          )}
        </button>
          <button onClick={() => skip(15)} className="text-gray-300 hover:text-white">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 16V8m0 0l4 4m-4-4l-4 4M19 12a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
        <span className="text-gray-300 text-lg w-12 text-right font-mono">{formatTime(current)}</span>
        <input
          type="range"
          min={0}
          max={duration}
          value={current}
          onChange={onSeek}
          className="flex-1 mx-2 accent-yellow-300 h-2"
        />
        <span className="text-gray-300 text-lg w-12 text-left font-mono">{formatTime(duration)}</span>
        <div className="flex items-center gap-2">
          <svg className="text-gray-300" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5v14a1 1 0 001 1h1a1 1 0 001-1V5a1 1 0 00-1-1h-1a1 1 0 00-1 1z" />
          </svg>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={onVolume}
          className="w-20 accent-yellow-300"
        />
        </div>
      </div>
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onEnded={onEnded}
        style={{ display: 'none' }}
      />
    </div>
  );
}

const FEATURED_ARTISTS = [
  { id: 412, name: 'Drake', picture: 'https://api.deezer.com/artist/412/image' },
  { id: 13, name: 'Eminem', picture: 'https://api.deezer.com/artist/13/image' },
  { id: 384236, name: 'Billie Eilish', picture: 'https://api.deezer.com/artist/384236/image' },
  { id: 27, name: 'Daft Punk', picture: 'https://api.deezer.com/artist/27/image' },
  { id: 9635624, name: 'Olivia Rodrigo', picture: 'https://api.deezer.com/artist/9635624/image' },
];
const FUN_FACTS = [
  "The world's longest officially released song is over 13 hours long!",
  "Mozart wrote his first symphony at age 8.",
  "The most expensive musical instrument ever sold is a Stradivarius violin for $15.9 million.",
  "The Beatles used the word 'love' 613 times in their songs.",
  "The first CD pressed in the US was Bruce Springsteen's 'Born in the USA'.",
  "A piano has 88 keys, but a standard guitar has only 6 strings.",
  "Queen's 'Bohemian Rhapsody' has no chorus!",
  "The most covered song ever is 'Yesterday' by The Beatles.",
];

function getRandomFact() {
  return FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)];
}

const QUIZZES_PLAYED = '8,740,791'; // You can make this dynamic if you want

// Add sound effects
const CORRECT_SOUND = '/sounds/correct.mp3';
const INCORRECT_SOUND = '/sounds/incorrect.mp3';
const GAME_OVER_SOUND = '/sounds/gameover.mp3';

// Add confetti component for perfect score
function ConfettiCelebration() {
  // Simple confetti using CSS and random positions/colors
  const confettiCount = 60;
  const confetti = Array.from({ length: confettiCount });
  return (
    <div className="confetti-overlay pointer-events-none fixed inset-0 z-50">
      {confetti.map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 1.5;
        const duration = 2.5 + Math.random() * 1.5;
        const size = 8 + Math.random() * 10;
        const colors = ['#facc15', '#fbbf24', '#fde68a', '#f59e42', '#fff', '#f87171', '#60a5fa'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const rotate = Math.random() * 360;
        return (
          <div
            key={i}
            className="confetti-piece"
            style={{
              left: `${left}%`,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
              width: size,
              height: size * 2,
              background: color,
              transform: `rotate(${rotate}deg)`
            }}
          />
        );
      })}
    </div>
  );
}

export default function Home() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [choices, setChoices] = useState<Song[]>([]);
  const [score, setScore] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [artists, setArtists] = useState<Artist[]>([]);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedGuess, setSelectedGuess] = useState<Song | null>(null);
  const [showNext, setShowNext] = useState(false);
  const [totalQuizzes, setTotalQuizzes] = useState(0);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [question, setQuestion] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [shuffledSongs, setShuffledSongs] = useState<Song[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const autoNextTimeout = useRef<NodeJS.Timeout | null>(null);
  const BUBBLE_COUNT = 20;
  const [bubbleArtists, setBubbleArtists] = useState(FEATURED_ARTISTS);
  const [bubbleStyles, setBubbleStyles] = useState<{left: string, top: string, opacity: number, width: number, height: number}[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [funFact, setFunFact] = useState('');
  const subtitles = [
    "Guess the track within 5 seconds",
    "How many can you get right?",
    "Challenge your friends and climb the leaderboard!",
    "Test your music knowledge now!",
    "Can you beat your best score?",
  ];
  const [subtitle, setSubtitle] = useState(subtitles[0]);
  const [streak, setStreak] = useState(0);
  const correctSoundRef = useRef<HTMLAudioElement | null>(null);
  const incorrectSoundRef = useRef<HTMLAudioElement | null>(null);
  const [scorePop, setScorePop] = useState(false);
  const gameOverSoundRef = useRef<HTMLAudioElement | null>(null);
  const [prevHighScore, setPrevHighScore] = useState(0);
  const [isHighScore, setIsHighScore] = useState(false);
  const [fadeIn, setFadeIn] = useState(true);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [dailyChallengeArtist, setDailyChallengeArtist] = useState<Artist | null>(null);
  const [completedDailyChallenge, setCompletedDailyChallenge] = useState(false);

  // Placeholder leaderboard data for demo
  const leaderboard = [
    { username: 'dmqdisbackbabe', score: 100, time: 6 },
    { username: 'wee-jaguar824', score: 100, time: 8 },
    { username: 'Eddy', score: 100, time: 8 },
    { username: 'sneaky-jaguar12...', score: 100, time: 9 },
    { username: 'granular-peafow...', score: 100, time: 9 },
    { username: 'pleased-fly535', score: 100, time: 9 },
    { username: 'DAVID.YZY', score: 100, time: 10 },
    { username: 'Yeye', score: 100, time: 10 },
    { username: 'private-eland38...', score: 100, time: 10 },
    { username: 'Taedenn', score: 100, time: 10 },
  ];
  const userRank = 29859;
  const percentile = 33.22;
  const totalTime = 55;
  const user = { username: 'You', score, time: totalTime };

  const { data: session } = useSession();

  const handleShare = () => {
    const summary = `I scored ${score}/${score + wrong} on ${selectedArtist?.name || 'the artist'} in Guess The Song! Can you beat my score?`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(summary);
      alert('Result copied to clipboard!');
    } else {
      alert(summary);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchArtists = async (query: string) => {
    if (!query.trim()) {
      setArtists([]);
      setShowDropdown(false);
      return;
    }
    try {
      setSearching(true);
      setError(null);
      console.log('Searching for:', query);
      const response = await fetch(`/api/artists?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      console.log('Search response:', data);
      if (!response.ok) throw new Error(data.error || 'Failed to search artists');
      if (!data.data || !Array.isArray(data.data)) throw new Error('Invalid response format');
      setArtists(data.data);
      setShowDropdown(true);
    } catch (error) {
      console.error('Search error:', error);
      setError(error instanceof Error ? error.message : 'Failed to search artists');
      setArtists([]);
      setShowDropdown(false);
    } finally {
      setSearching(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (query.trim()) {
      setSearching(true);
    searchTimeoutRef.current = setTimeout(() => {
      searchArtists(query);
    }, 300);
    } else {
      setArtists([]);
      setShowDropdown(false);
    }
  };

  function shuffleArray<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  const fetchArtistSongs = async (artistId: number, artistName?: string) => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({ id: String(artistId) });
      if (artistName) params.append('name', artistName);
      const response = await fetch(`/api/artist-songs?${params.toString()}`);
      const data = await response.json();
      console.log('API response for artist songs:', data);
      if (!response.ok) throw new Error(data.error || 'Failed to fetch songs');
      if (!data.data || !Array.isArray(data.data)) throw new Error('Invalid response format');
      const formattedSongs = data.data.map((track: any) => ({
        id: track.id,
        title: track.title,
        artist: track.artist.name,
        preview: track.preview,
        album: track.album,
        cover: track.album?.cover_medium || track.album?.cover || '',
      }));
      console.log('Formatted songs:', formattedSongs);
      if (formattedSongs.length < 3) throw new Error('Not enough songs for this artist');
      const tq = Math.min(10, formattedSongs.length);
      setSongs(formattedSongs);
      const shuffled = shuffleArray(formattedSongs).slice(0, tq) as Song[];
      setShuffledSongs(shuffled);
      setTotalQuestions(tq);
      setQuestion(1);
      setCurrentQuestionIndex(0);
      setScore(0);
      setWrong(0);
      setGameOver(false);
      setSelectedGuess(null);
      setShowNext(false);
      setChoices([]);
      setCurrentSong(null);
      // Start first round after shuffling
      setTimeout(() => startNewRound(0, shuffled, tq), 0);
    } catch (error) {
      console.error('Error in fetchArtistSongs:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch songs');
    } finally {
      setLoading(false);
    }
  };

  const handleArtistSelect = (artist: Artist) => {
    console.log('Artist selected:', artist);
    setSelectedArtist(artist);
    setArtists([]);
    setSearchQuery('');
    setShowDropdown(false);
    setGameStartTime(Date.now());
    fetchArtistSongs(artist.id, artist.name);
  };

  function getRandomChoices(songs: Song[], correct: Song, count: number) {
    const others = songs.filter((s) => s.id !== correct.id);
    const shuffled = shuffleArray(others);
    return [correct, ...shuffled.slice(0, count - 1)].sort(() => 0.5 - Math.random());
  }

  function startNewRound(qIdx: number = currentQuestionIndex, songList: Song[] = shuffledSongs, tq: number = totalQuestions) {
    console.log('startNewRound called', { qIdx, songList, tq });
    if (qIdx >= tq || qIdx >= songList.length) {
      setGameOver(true);
      return;
    }
    const correct = songList[qIdx];
    setCurrentSong(correct);
    setChoices(getRandomChoices(songList, correct, 3));
    setSelectedGuess(null);
    setShowNext(false);
    setQuestion(qIdx + 1);
    setTotalQuestions(tq);
    setCurrentQuestionIndex(qIdx);
    console.log('Current song set:', correct);
  }

  const handleGuess = (song: Song) => {
    if (!currentSong || selectedGuess) return;
    setSelectedGuess(song);
    setShowNext(true);
    if (song.id === currentSong.id) {
      setScore((prev) => prev + 1);
      setStreak((prev) => prev + 1);
      correctSoundRef.current?.play().catch(console.error);
    } else {
      setWrong((prev) => prev + 1);
      setStreak(0);
      incorrectSoundRef.current?.play().catch(console.error);
    }
    // Auto-advance after 2 seconds
    if (autoNextTimeout.current) clearTimeout(autoNextTimeout.current);
    autoNextTimeout.current = setTimeout(() => {
      handleNext();
    }, 2000);
  };

  useEffect(() => {
    // Clear timeout on unmount or new question
    return () => {
      if (autoNextTimeout.current) clearTimeout(autoNextTimeout.current);
    };
  }, [currentQuestionIndex]);

  const handleNext = async () => {
    const nextIdx = currentQuestionIndex + 1;
    if (nextIdx >= totalQuestions) {
      setGameOver(true);
      // Record the quiz attempt and then fetch leaderboard
      if (selectedArtist) {
        const post = fetch('/api/quiz-attempt', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            artistId: selectedArtist.id.toString(),
            artistName: selectedArtist.name,
            score,
            totalQuestions,
            time: Math.floor((Date.now() - gameStartTime) / 1000),
          }),
        });
        await post;
        const userId = session?.user && typeof session.user === 'object' && 'id' in session.user ? String(session.user.id) : undefined;
        await fetchEndgameLeaderboard(selectedArtist.id, userId);
        // If this was the daily challenge artist, set badge
        if (dailyChallengeArtist && selectedArtist.id === dailyChallengeArtist.id) {
          setCompletedDailyChallenge(true);
        }
      }
    } else {
      startNewRound(nextIdx, shuffledSongs, totalQuestions);
      setCurrentQuestionIndex(nextIdx);
    }
  };

  const resetGame = () => {
    setScore(0);
    setWrong(0);
    setGameOver(false);
    setSelectedGuess(null);
    setShowNext(false);
    setQuestion(1);
    setCurrentQuestionIndex(0);
    setStreak(0);
    if (songs.length > 0) {
      const tq = Math.min(10, songs.length);
      setTotalQuestions(tq);
      const shuffled = shuffleArray(songs).slice(0, tq) as Song[];
      setShuffledSongs(shuffled);
      setTimeout(() => startNewRound(0, shuffled, tq), 0);
    }
  };

  const startNewGame = () => {
    setSelectedArtist(null);
    setSongs([]);
    setCurrentSong(null);
    setScore(0);
    setWrong(0);
    setGameOver(false);
    setSelectedGuess(null);
    setShowNext(false);
    setQuestion(1);
    setTotalQuestions(10);
    setCurrentQuestionIndex(0);
    setGameStartTime(0);
    setStreak(0);
  };

  useEffect(() => {
    if (!selectedArtist) {
      fetch('/api/artists?q=a')
        .then(res => res.json())
        .then(data => {
          if (data.data && Array.isArray(data.data)) {
            // Shuffle and pick BUBBLE_COUNT unique artists
            const shuffled = data.data.sort(() => 0.5 - Math.random());
            setBubbleArtists(shuffled.slice(0, BUBBLE_COUNT));
          }
        });
    }
  }, [selectedArtist]);

  useEffect(() => {
    setIsClient(true);
    // Always generate enough styles for all bubbles
    const count = (bubbleArtists.length || BUBBLE_COUNT) * 2;
    if (bubbleStyles.length !== count) {
      const styles = Array.from({length: count}).map(() => ({
        left: `${8 + Math.random() * 84}%`,
        top: `${Math.random() * 90}%`,
        opacity: 0.13 + Math.random() * 0.18,
        width: 54 + Math.random() * 36,
        height: 54 + Math.random() * 36,
      }));
      setBubbleStyles(styles);
      console.log('Bubble styles regenerated:', styles.length);
    }
  }, [bubbleArtists]);

  useEffect(() => {
    if (isClient && !selectedArtist) setFunFact(getRandomFact());
    // Optionally, reset funFact when artist is selected
    if (selectedArtist) setFunFact('');
  }, [isClient, selectedArtist]);

  useEffect(() => {
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % subtitles.length;
      setSubtitle(subtitles[idx]);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedArtist && songs.length > 0 && !currentSong && !loading && !error) {
      // Start the first question if not already started
      const tq = Math.min(10, songs.length);
      const shuffled = shuffleArray(songs).slice(0, tq) as Song[];
      setShuffledSongs(shuffled);
      setTotalQuestions(tq);
      setQuestion(1);
      setCurrentQuestionIndex(0);
      setScore(0);
      setWrong(0);
      setGameOver(false);
      setSelectedGuess(null);
      setShowNext(false);
      setChoices([]);
      setCurrentSong(null);
      setTimeout(() => startNewRound(0, shuffled, tq), 0);
    }
  }, [selectedArtist, songs, currentSong, loading, error]);

  // Add this new useEffect for fetching stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats');
        const data = await response.json();
        if (response.ok) {
          setTotalQuizzes(data.totalAttempts);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  // Add gameStartTime state
  const [gameStartTime, setGameStartTime] = useState(0);

  // Initialize sound effects
  useEffect(() => {
    correctSoundRef.current = new Audio(CORRECT_SOUND);
    incorrectSoundRef.current = new Audio(INCORRECT_SOUND);
  }, []);

  // Animate score when it increases
  useEffect(() => {
    if (score > 0) {
      setScorePop(true);
      const timeout = setTimeout(() => setScorePop(false), 400);
      return () => clearTimeout(timeout);
    }
  }, [score]);

  // Debug logs for artist search
  useEffect(() => {
    console.log('Artist search state:', {searchQuery, artists, searching, showDropdown});
  }, [searchQuery, artists, searching, showDropdown]);

  if (process.env.NODE_ENV !== 'production') {
    console.log('DEBUG:', {
      selectedArtist,
      songsLength: songs.length,
      currentSong,
      choices,
      loading,
      error,
      gameOver,
    });
  }

  // Optionally, render a visible debug panel for development
  const debugPanel = session?.user && (session.user as any).isAdmin ? (
    <div style={{ position: 'fixed', top: 0, left: 0, background: '#222', color: '#fff', zIndex: 9999, fontSize: 12, padding: 8, opacity: 0.8 }}>
      <div>selectedArtist: {selectedArtist ? selectedArtist.name : 'null'}</div>
      <div>songs.length: {songs.length}</div>
      <div>currentSong: {currentSong ? currentSong.title : 'null'}</div>
      <div>choices: {choices.length}</div>
      <div>loading: {String(loading)}</div>
      <div>error: {error || 'none'}</div>
      <div>gameOver: {String(gameOver)}</div>
    </div>
  ) : null;

  // Real-time leaderboard state
  const [realtimeLeaderboard, setRealtimeLeaderboard] = useState(leaderboard);
  const [userRankState, setUserRankState] = useState<number | null>(null);
  const [userBest, setUserBest] = useState<any>(null);
  const [endgameLeaderboardLoading, setEndgameLeaderboardLoading] = useState(false);

  // Fetch leaderboard after quiz attempt is saved
  const fetchEndgameLeaderboard = async (artistId: number, userId?: string) => {
    setEndgameLeaderboardLoading(true);
    try {
      const url = `/api/leaderboard?artistId=${artistId}${userId ? `&userId=${userId}` : ''}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data && Array.isArray(data.leaderboard)) {
        setRealtimeLeaderboard(data.leaderboard);
        setUserRankState(data.userRank ?? 0);
        setUserBest(data.userBest);
      }
    } catch {}
    setEndgameLeaderboardLoading(false);
  };

  // Global leaderboard for main menu
  const [globalLeaderboard, setGlobalLeaderboard] = useState<any[]>([]);
  useEffect(() => {
    fetch('/api/leaderboard')
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.leaderboard)) {
          setGlobalLeaderboard(data.leaderboard);
        }
      })
      .catch(() => {});
  }, []);

  // Pick a random artist of the day (stable per day)
  function getDailyChallengeArtist(artists: Artist[]) {
    const today = new Date().toISOString().slice(0, 10);
    let hash = 0;
    for (let i = 0; i < today.length; i++) hash = today.charCodeAt(i) + ((hash << 5) - hash);
    const idx = Math.abs(hash) % artists.length;
    return artists[idx];
  }

  // On mount, set daily challenge artist
  useEffect(() => {
    if (FEATURED_ARTISTS.length > 0) {
      setDailyChallengeArtist(getDailyChallengeArtist(FEATURED_ARTISTS));
    }
  }, []);

  // When user completes daily challenge, set badge in localStorage
  useEffect(() => {
    if (completedDailyChallenge) {
      localStorage.setItem('dailyChallengeCompleted', new Date().toISOString().slice(0, 10));
    }
  }, [completedDailyChallenge]);
  // On mount, check if badge should be shown
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    if (localStorage.getItem('dailyChallengeCompleted') === today) {
      setCompletedDailyChallenge(true);
    }
  }, []);

  // Start daily challenge game
  const startDailyChallenge = () => {
    if (dailyChallengeArtist) {
      handleArtistSelect(dailyChallengeArtist);
    }
  };

    return (
    <>
      {debugPanel}
      {error ? (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-2xl text-red-500">{error}</p>
          <button
            onClick={() => selectedArtist ? fetchArtistSongs(selectedArtist.id) : searchArtists(searchQuery)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
      ) : selectedArtist && loading && !currentSong ? (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
          <div className="flex flex-col items-center gap-6">
            {/* Animated vinyl record */}
            <div className="vinyl-record playing" style={{position: 'relative'}}>
              <img src="/vinyl-placeholder.svg" alt="Vinyl Record" />
              <div className="vinyl-shine" />
            </div>
            {/* Artist image */}
            {selectedArtist.picture && (
              <img src={selectedArtist.picture} alt={selectedArtist.name} className="w-24 h-24 rounded-full border-4 border-yellow-300 shadow-lg" />
            )}
            <div className="text-2xl font-bold text-yellow-200 animate-fadein">Loading songs for {selectedArtist.name}...</div>
            <div className="text-lg text-yellow-100 animate-fadein">Crate digging for the best tracks...</div>
            <div className="loading-spinner mt-4"></div>
          </div>
        </div>
      ) : !selectedArtist ? (
        <main className={`min-h-screen flex items-center justify-center p-2 pt-2 bg-gray-900 text-white relative overflow-hidden`}>
          {/* Animated musician bubbles background */}
          {isClient && bubbleStyles.length > 0 && (
            <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
              {bubbleArtists.concat(bubbleArtists).map((artist, i) => (
                <div
                  key={i}
                  className="absolute animate-bubble"
                  style={{
                    ...bubbleStyles[i],
                    zIndex: 0,
                    filter: 'blur(0.5px)',
                  }}
                >
                  <img
                    src={artist.picture}
                    alt={artist.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '3px solid #facc15',
                      boxShadow: '0 2px 16px 0 rgba(0,0,0,0.12)',
                    }}
                  />
                </div>
              ))}
            </div>
          )}
          {/* Main menu and leaderboard layout */}
          <div className="z-10 relative w-full flex flex-col items-center justify-center">
            <div className="flex flex-col md:flex-row w-full max-w-5xl gap-8 items-start justify-center">
              {/* Main menu content */}
              <div className="flex-1 flex flex-col items-center min-w-[320px]">
                {/* Stats */}
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="inline-block w-3 h-3 rounded-full bg-green-400 mr-1"></span>
                  <span className="text-lg text-gray-100 font-medium">{totalQuizzes.toLocaleString()} quizzes played</span>
                </div>
                {/* How to Play button */}
                <button
                  onClick={() => setShowHowToPlay(true)}
                  className="mb-4 px-6 py-2 rounded-full bg-yellow-300 text-gray-900 font-bold text-lg shadow-md hover:bg-yellow-400 transition-colors"
                >
                  How to Play
                </button>
                {/* Headline */}
                <h1 className="text-4xl md:text-5xl font-extrabold text-center text-yellow-200 mb-2 leading-tight flex flex-col items-center" style={{letterSpacing: '-1px'}}>
                  <span role="img" aria-label="music" className="text-5xl mb-2">{'🎵'}</span>
                  Only real fans can <span className="bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent">guess every song</span>
                  <br />
                  <span className="text-yellow-400">Are you up for the challenge?</span>
                </h1>
                {/* Animated, rotating subtitle */}
                <div className="text-xl text-gray-100 text-center mb-6 animate-fadein">
                  {subtitle}
        </div>
                {/* Search bar and button */}
                <form className="w-full max-w-xl flex flex-col items-center gap-4" onSubmit={e => { e.preventDefault(); }}>
                  <div className="relative w-full">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-gray-400">
                      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="11" cy="11" r="8" strokeWidth="2"/><path strokeWidth="2" d="M21 21l-4.35-4.35"/></svg>
                    </span>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                      placeholder="Type an artist's name"
                      className="w-full pl-12 pr-4 py-4 rounded-full bg-[#222733] text-lg text-white border border-transparent focus:outline-none focus:border-yellow-300 transition-colors shadow-md placeholder-gray-400"
              />
                    {searching && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="loading-spinner"></div>
                      </div>
                    )}
              {showDropdown && artists.length > 0 && (
                      <div className="artist-dropdown absolute z-10 w-full mt-2 rounded-md shadow-lg max-h-60 overflow-auto">
                  {artists.map((artist) => (
                    <button
                      key={artist.id}
                      onClick={() => handleArtistSelect(artist)}
                      className="w-full p-3 hover:bg-gray-700 text-left flex items-center space-x-3 transition-colors"
                    >
                      {artist.picture && (
                        <img
                          src={artist.picture}
                          alt={artist.name}
                          className="w-10 h-10 rounded-full"
                        />
                      )}
                      <span>{artist.name}</span>
                    </button>
                  ))}
                </div>
              )}
                  </div>
                  <button
                    type="submit"
                    disabled={!searchQuery.trim()}
                    className="w-full py-4 rounded-full bg-yellow-300 text-gray-900 font-extrabold text-xl shadow-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed hover:bg-yellow-400"
                    style={{letterSpacing: '0.5px'}}>
                    Let's go
                  </button>
                </form>
                {/* Optionally, keep fun fact or other elements below */}
                {isClient && funFact && (
                  <div className="text-center text-yellow-200 text-base italic mt-6">
                    <span role="img" aria-label="music">🎶</span> {funFact}
                  </div>
                )}
                {/* Daily Challenge button and badge */}
                <div className="flex items-center gap-3 mb-4">
                  <button
                    onClick={startDailyChallenge}
                    className="px-6 py-2 rounded-full bg-pink-500 text-white font-bold text-lg shadow-md hover:bg-pink-600 transition-colors"
                  >
                    🎯 Daily Challenge
                  </button>
                  {completedDailyChallenge && (
                    <span className="inline-block px-3 py-1 rounded-full bg-green-400 text-gray-900 font-bold text-sm shadow">Completed!</span>
                  )}
                </div>
              </div>
              {/* Global Leaderboard sidebar */}
              <div className="w-full md:w-96 max-w-xl bg-yellow-300/10 rounded-xl shadow-lg p-4 mb-6 mt-2 md:mb-0 md:mt-0">
                <div className="text-lg font-bold text-yellow-200 mb-2 text-center">Global Leaderboard</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-yellow-300 text-sm">
                        <th className="py-1">Player</th>
                        <th className="py-1 text-center">Score</th>
                        <th className="py-1 text-center">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {globalLeaderboard.map((entry, idx) => (
                        <tr key={entry.username + idx} className={`rounded-lg ${idx === 0 ? 'bg-yellow-300/20 border-2 border-yellow-300' : ''}` + ' ' + (idx % 2 ? 'bg-yellow-300/5' : '')}>
                          <td className={`py-1 px-2 font-semibold flex items-center gap-2 ${idx === 0 ? 'text-yellow-300' : 'text-white'}`}>
                            <span style={{ width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', display: 'inline-block', background: entry.image ? 'none' : '#facc15', color: entry.image ? 'inherit' : '#232834', textAlign: 'center', fontWeight: 700, fontSize: 18 }}>
                              {entry.image ? (
                                <img src={entry.image} alt={entry.username} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                              ) : (
                                entry.username[0]?.toUpperCase() || '?' 
                              )}
                            </span>
                            {idx + 1}. {entry.username}
                          </td>
                          <td className="py-1 px-2 text-center">{entry.score}</td>
                          <td className="py-1 px-2 text-center">{entry.time}s</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </main>
      ) : gameOver ? (
        endgameLeaderboardLoading ? (
          <div className="min-h-screen flex items-center justify-center text-2xl text-yellow-200">Loading leaderboard...</div>
        ) : (
          <>
            {/* Perfect score celebration */}
            {score === totalQuestions && <ConfettiCelebration />}
            <EndGameScreen
              artist={selectedArtist.name}
              artistPfp={selectedArtist.picture}
              percentile={percentile}
              score={score}
              totalQuestions={totalQuestions}
              time={Math.floor((Date.now() - gameStartTime) / 1000)}
              leaderboard={realtimeLeaderboard}
              userRank={userRankState ?? 0}
              user={userBest || user}
              onPlayAgain={resetGame}
              onShare={handleShare}
              onBack={startNewGame}
              isHighScore={isHighScore}
            />
          </>
        )
      ) : selectedArtist && currentSong ? (
        <main className="min-h-screen flex flex-col items-center justify-center p-2 pt-2 bg-gray-900 text-white relative overflow-hidden">
          <div className="max-w-xl w-full space-y-4 mt-2">
            <div className="flex justify-start mb-1">
              <button
                onClick={startNewGame}
                className="flex items-center gap-2 text-yellow-300 hover:text-yellow-400 font-semibold px-4 py-2 rounded transition-colors"
              >
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
            </div>
            <div className="text-center">
              <div className="mb-2">
                <p className="text-xl">Artist: {selectedArtist.name}</p>
                <p className={`text-xl score-increase ${scorePop ? 'score-pop' : ''}`}>Score: {score} / {score + wrong}</p>
                <p className="text-lg">Question {question} / {totalQuestions}</p>
                {/* Add streak counter with tooltip */}
                {streak > 1 && (
                  <div className="relative has-tooltip inline-block">
                    <p className="text-yellow-300 font-bold animate-pulse streak-pulse">🔥 {streak}x Streak!</p>
                    <span className="tooltip">Consecutive correct answers! Keep it up for a higher streak.</span>
                  </div>
                )}
              </div>
            </div>
            {/* Add progress bar with tooltip */}
            <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4 relative has-tooltip">
              <div 
                className="bg-yellow-300 h-2.5 rounded-full transition-all duration-300 progress-bar-fill"
                style={{ width: `${(question / totalQuestions) * 100}%` }}
              ></div>
              <span className="tooltip">Progress through the quiz</span>
            </div>
            <div className="space-y-3">
            {currentSong && (
                <div style={{ marginBottom: '0.5rem' }}>
              <CustomAudioPlayer src={currentSong.preview} />
                </div>
            )}
              <div className="flex flex-row items-end justify-center gap-6 flex-wrap">
              {choices.map((song) => {
                const isCorrect = currentSong && song.id === currentSong.id;
                const isSelected = selectedGuess && song.id === selectedGuess.id;
                let border = 'border-4 border-transparent';
                if (selectedGuess) {
                  if (isCorrect) border = 'border-4 border-green-400';
                  if (isSelected && !isCorrect) border = 'border-4 border-red-400';
                }
                return (
                  <button
                    key={song.id}
                    onClick={() => handleGuess(song)}
                      className={`song-choice flex flex-col items-center bg-gray-800 rounded-xl p-3 w-40 shadow-lg transition-colors focus:outline-none ${border} relative`}
                    disabled={!!selectedGuess}
                  >
                    <img
                      src={getSongCover(song) || '/no-cover.png'}
                      alt={song.title}
                      className="w-32 h-32 object-cover rounded-lg mb-2"
                    />
                    {selectedGuess && isCorrect && (
                      <span className="absolute top-2 right-2 bg-green-400 rounded-full p-1">
                          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-white">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                      </span>
                    )}
                    {selectedGuess && isSelected && !isCorrect && (
                      <span className="absolute top-2 right-2 bg-red-400 rounded-full p-1">
                          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-white">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                      </span>
                    )}
                    <span className="truncate w-full text-center font-medium mt-2">
                      {song.title.length > 22 ? song.title.slice(0, 19) + '...' : song.title}
                    </span>
                  </button>
                );
              })}
            </div>
            {showNext && (
                <div className="flex flex-col items-center mt-2">
                <button
                  onClick={handleNext}
                    className="w-80 py-3 rounded-full bg-gradient-to-r from-yellow-300 to-yellow-500 text-black font-semibold text-xl hover:from-yellow-400 hover:to-yellow-600 transition-colors mb-2 transform hover:scale-105"
                >
                  Next
                </button>
                  <div className="text-lg mt-1">{totalQuestions - question} questions left</div>
              </div>
            )}
            </div>
          </div>
        </main>
      ) : null}
      {/* How to Play Modal */}
      {showHowToPlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" onClick={() => setShowHowToPlay(false)}>
          <div className="bg-gray-900 rounded-2xl shadow-2xl p-8 max-w-lg w-full relative text-white" onClick={e => e.stopPropagation()}>
              <button
              className="absolute top-4 right-4 text-yellow-300 text-2xl font-bold hover:text-yellow-400"
              onClick={() => setShowHowToPlay(false)}
              aria-label="Close"
              >
              ×
              </button>
            <h2 className="text-2xl font-extrabold mb-4 text-yellow-300 text-center">How to Play</h2>
            <ul className="list-disc pl-6 space-y-2 text-lg">
              <li>Pick your favorite artist or search for one.</li>
              <li>Listen to short song previews and guess the correct track from the choices.</li>
              <li>Get as many right as you can fast answers and streaks boost your score!</li>
              <li>Compete for the top spot on the leaderboard.</li>
              <li>Share your results and challenge your friends!</li>
            </ul>
            <div className="mt-6 text-center text-yellow-200 text-base">Ready? Search for an artist and press <b>Let's go</b>!</div>
            </div>
          </div>
        )}
    </>
  );
}
