
import React from 'react';
import { Player, PieceColor } from '../types'; // Added PieceColor for typing

interface PlayerInfoProps {
  player: Player;
  isCurrent: boolean;
  isOpponent: boolean; 
  timeLeft?: number | null; // Optional: time left in seconds, or null if timer disabled
}

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const PlayerInfo: React.FC<PlayerInfoProps> = ({ player, isCurrent, timeLeft }) => {
  return (
    <div className={`p-3 rounded-lg shadow-md transition-all duration-300 ease-in-out w-48 text-center ${ // Added w-48 for consistent width
      isCurrent ? 'bg-gradient-to-r from-green-500 to-teal-500 scale-105 ring-2 ring-white' : 'bg-slate-700'
    }`}>
      <p className={`font-semibold text-lg truncate ${isCurrent ? 'text-white' : 'text-slate-300'}`}>
        {player.name}
      </p>
      <p className={`text-sm ${isCurrent ? 'text-green-200' : 'text-slate-400'}`}>
        Playing as {player.color.charAt(0) + player.color.slice(1).toLowerCase()}
      </p>
      {typeof timeLeft === 'number' && ( // Only display if timeLeft is a number (timer enabled)
        <div className={`mt-1 text-lg font-mono flex items-center justify-center ${
          isCurrent ? 'text-white' : 'text-slate-200'
        } ${timeLeft <= 10 && timeLeft > 0 && isCurrent ? 'animate-pulse text-red-300' : ''}
           ${timeLeft === 0 ? 'text-red-500 font-bold' : ''} 
        `}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.414L11 9.586V6z" clipRule="evenodd" />
          </svg>
          {formatTime(timeLeft)}
        </div>
      )}
    </div>
  );
};

export default PlayerInfo;