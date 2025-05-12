import React, { useState } from 'react';
import ConfettiCelebration from './page';

export interface LeaderboardEntry {
  username: string;
  score: number;
  time: number;
  image?: string;
}

interface EndGameScreenProps {
  artist: string;
  artistPfp?: string;
  percentile: number;
  score: number;
  totalQuestions: number;
  time: number;
  leaderboard: LeaderboardEntry[];
  userRank: number;
  user: LeaderboardEntry;
  onPlayAgain: () => void;
  onShare: () => void;
  onBack: () => void;
  isHighScore: boolean;
}

// Fun facts for specific artists
const ARTIST_FACTS: Record<string, string> = {
  'Drake': 'Drake holds the record for the most charted songs (over 200) on the Billboard Hot 100.',
  'Eminem': 'Eminem is the first artist to have ten consecutive number one albums in the US.',
  'Billie Eilish': 'Billie Eilish is the youngest artist to win all four major Grammy categories in one night.',
  'Daft Punk': 'Daft Punk never revealed their faces in public, always appearing as robots.',
  'Olivia Rodrigo': 'Olivia Rodrigo became the youngest artist to debut atop the Billboard Hot 100 with her first single.',
};
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
function getArtistFact(artist: string) {
  return ARTIST_FACTS[artist] || '';
}

export default function EndGameScreen({
  artist,
  artistPfp,
  percentile,
  score,
  totalQuestions,
  time,
  leaderboard,
  userRank,
  user,
  onPlayAgain,
  onShare,
  onBack,
  isHighScore,
}: EndGameScreenProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const handlePlayAgain = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 1800);
    onPlayAgain();
  };

  const shareText = `I scored ${score}/${totalQuestions} on ${artist} in Guess The Song! Can you beat my score?`;
  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 1500);
  };
  const shareUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
      <div className="flex flex-col md:flex-row gap-8 w-full max-w-5xl items-center justify-center">
        {/* Result Card */}
        <div className="bg-gradient-to-br from-yellow-100/10 to-yellow-300/10 rounded-xl shadow-lg p-6 w-full max-w-sm flex flex-col items-center border border-yellow-300/30">
          <div className="w-32 h-32 bg-gray-800 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
            {artistPfp ? (
              <img src={artistPfp} alt={artist} className="w-full h-full object-cover rounded-lg" />
            ) : (
              <span className="text-5xl text-yellow-300">🎵</span>
            )}
          </div>
          <div className="text-center mb-4">
            <div className="text-sm text-yellow-300 font-semibold mb-1">Among Top <span className="font-bold">{percentile}%</span> fans of</div>
            <div className="text-2xl font-bold text-yellow-200 mb-2">{artist}</div>
            <div className="text-base text-yellow-100">Guessed <span className="font-bold">{score}/{totalQuestions}</span> songs under <span className="font-bold">{time} secs</span></div>
          </div>
          <div className="text-xs text-gray-500 mt-1">{new Date().toLocaleDateString()}</div>
        </div>
        {/* Leaderboard */}
        <div className="bg-yellow-300/10 rounded-xl shadow-lg p-6 w-full max-w-md flex flex-col">
          <div className="text-lg font-bold text-yellow-200 mb-4 text-center">{artist} Fan Leaderboard</div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-yellow-300 text-sm">
                  <th className="py-1">Fans</th>
                  <th className="py-1 text-center">Score</th>
                  <th className="py-1 text-center">Time</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, idx) => (
                  <tr key={entry.username} className={`rounded-lg ${idx === 0 ? 'bg-yellow-300/20 border-2 border-yellow-300' : ''}` + ' ' + (idx % 2 ? 'bg-yellow-300/5' : '')}>
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
                {/* User's own rank at the bottom if not in top 10 */}
                <tr className="h-4"><td colSpan={3}></td></tr>
                <tr className={`bg-yellow-300/20 border-t-2 border-yellow-300 rounded-lg leaderboard-user-row`}>
                  <td className="py-1 px-2 font-semibold text-yellow-300 flex items-center gap-2">
                    <span style={{ width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', display: 'inline-block', background: user.image ? 'none' : '#facc15', color: user.image ? 'inherit' : '#232834', textAlign: 'center', fontWeight: 700, fontSize: 18 }}>
                      {user.image ? (
                        <img src={user.image} alt={user.username} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        user.username[0]?.toUpperCase() || '?' 
                      )}
                    </span>
                    {userRank}. {user.username}
                  </td>
                  <td className="py-1 px-2 text-center">{user.score}</td>
                  <td className="py-1 px-2 text-center">{user.time}s</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* Share Buttons Row */}
      <div className="flex flex-row gap-8 mt-10 w-full max-w-2xl justify-center items-end">
        {/* Copy/Share */}
        <div className="flex flex-col items-center">
          <button
            onClick={handleCopy}
            className="w-20 h-20 rounded-full bg-yellow-300 flex items-center justify-center shadow-lg hover:bg-yellow-400 transition-colors relative"
            aria-label="Copy share text"
          >
            <span className="text-3xl text-black">📋</span>
            {shareCopied && (
              <span className="absolute left-1/2 -translate-x-1/2 top-0 mt-[-2.2rem] bg-gray-900 text-yellow-300 px-4 py-2 rounded shadow-lg text-base">Copied!</span>
            )}
          </button>
          <span className="mt-2 text-sm text-white">Share</span>
        </div>
        {/* WhatsApp */}
        <div className="flex flex-col items-center">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-20 h-20 rounded-full bg-green-400 flex items-center justify-center shadow-lg hover:bg-green-500 transition-colors"
            aria-label="Share on WhatsApp"
          >
            <svg width="36" height="36" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="16" fill="#25D366"/><path d="M24.5 19.5c-.4-.2-2.3-1.1-2.6-1.2-.3-.1-.5-.2-.7.2-.2.4-.8 1.2-1 1.4-.2.2-.4.3-.8.1-.4-.2-1.7-.6-3.2-2-1.2-1.1-2-2.4-2.2-2.8-.2-.4 0-.6.2-.8.2-.2.4-.5.6-.7.2-.2.2-.4.3-.6.1-.2 0-.5 0-.7 0-.2-.7-1.7-1-2.3-.3-.6-.6-.5-.8-.5-.2 0-.4 0-.6 0-.2 0-.5.1-.7.3-.2.2-.9.9-.9 2.2 0 1.3.9 2.5 1 2.7.1.2 1.7 2.7 4.1 3.7 2.4 1 2.4.7 2.8.7.4 0 1.4-.6 1.6-1.2.2-.6.2-1.1.1-1.2z" fill="#fff"/></svg>
          </a>
          <span className="mt-2 text-sm text-white">WhatsApp</span>
        </div>
        {/* Facebook */}
        <div className="flex flex-col items-center">
          <a
            href={facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-20 h-20 rounded-full bg-blue-700 flex items-center justify-center shadow-lg hover:bg-blue-800 transition-colors"
            aria-label="Share on Facebook"
          >
            <svg width="36" height="36" viewBox="0 0 32 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="16" fill="#1877F3"/><path d="M21.5 16h-3v8h-3v-8h-2v-3h2v-2c0-2.1 1.3-3 3.2-3 .9 0 1.8.1 1.8.1v2h-1c-.9 0-1.1.4-1.1 1v2h2.2l-.3 3z" fill="#fff"/></svg>
          </a>
          <span className="mt-2 text-sm text-white">Facebook</span>
        </div>
        {/* X (Twitter) */}
        <div className="flex flex-col items-center">
          <a
            href={twitterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-20 h-20 rounded-full bg-black flex items-center justify-center shadow-lg hover:bg-gray-800 transition-colors"
            aria-label="Share on X"
          >
            <svg width="36" height="36" viewBox="0 0 1200 1227" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="600" cy="613.5" r="600" fill="#000"/><path d="M908.5 320.5L671.5 601.5L917.5 906.5H782.5L600.5 687.5L406.5 906.5H282.5L540.5 601.5L303.5 320.5H438.5L600.5 522.5L782.5 320.5H908.5Z" fill="#fff"/></svg>
          </a>
          <span className="mt-2 text-sm text-white">X</span>
        </div>
        {/* Email */}
        <div className="flex flex-col items-center">
          <a
            href={`mailto:?subject=Guess The Song Score&body=${encodeURIComponent(shareText + ' ' + shareUrl)}`}
            className="w-20 h-20 rounded-full bg-gray-500 flex items-center justify-center shadow-lg hover:bg-gray-400 transition-colors"
            aria-label="Share by Email"
          >
            <svg width="36" height="36" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="16" fill="#888"/><rect x="7" y="11" width="18" height="10" rx="2" fill="#fff"/><path d="M7 11l9 7 9-7" stroke="#888" strokeWidth="2"/></svg>
          </a>
          <span className="mt-2 text-sm text-white">Email</span>
        </div>
      </div>
      {/* Play Again and Back Buttons */}
      <div className="flex flex-col gap-4 mt-4 w-full max-w-2xl justify-center">
        <button onClick={onBack} className="flex-1 py-3 rounded-full border-2 border-gray-400 text-gray-300 font-semibold text-xl hover:bg-gray-600 transition-colors shadow-lg">Back to Main Menu</button>
      </div>
      {/* Fun fact or trivia */}
      {getArtistFact(artist) && (
        <div className="w-full max-w-sm text-center mt-4 text-yellow-200 text-base italic">
          {getArtistFact(artist)}
        </div>
      )}
      {/* High score animation */}
      {isHighScore && <div className="high-score-animate text-3xl text-yellow-300 font-extrabold text-center mt-4">New High Score!</div>}
      {showConfetti && <ConfettiCelebration />}
    </div>
  );
} 