
import React, { useState, useCallback } from 'react';
import { PieceColor, Player, GameSettings, PieceType, BoardDisplayMode } from '../types';
import ChessPieceIcon from './ChessPieceIcon'; 
import { BLACK_PIECE_COLOR_SVG, WHITE_PIECE_COLOR_SVG, PLAYER_MOVE_TIME_LIMIT_SECONDS } from '../constants'; 

interface HomeScreenProps {
  onStartGame: (settings: GameSettings) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onStartGame }) => {
  const [player1Name, setPlayer1Name] = useState<string>('Player 1');
  const [player2Name, setPlayer2Name] = useState<string>('Player 2');
  const [player1ChosenColor, setPlayer1ChosenColor] = useState<PieceColor>(PieceColor.WHITE);
  const [useTimer, setUseTimer] = useState<boolean>(true);
  const [timerDuration, setTimerDuration] = useState<number>(PLAYER_MOVE_TIME_LIMIT_SECONDS);
  const [boardDisplayMode, setBoardDisplayMode] = useState<BoardDisplayMode>(BoardDisplayMode.SINGLE_FLIPPING);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!player1Name.trim() || !player2Name.trim()) {
      alert("Player names cannot be empty.");
      return;
    }

    const player1: Player = {
      name: player1Name,
      color: player1ChosenColor,
    };
    const player2: Player = {
      name: player2Name,
      color: player1ChosenColor === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE,
    };

    onStartGame({
      player1,
      player2,
      player1Starts: player1.color === PieceColor.WHITE, 
      timerDurationSeconds: useTimer ? timerDuration : null,
      boardDisplayMode: boardDisplayMode,
    });
  }, [player1Name, player2Name, player1ChosenColor, useTimer, timerDuration, boardDisplayMode, onStartGame]);

  const ColorChoiceButton: React.FC<{
    colorName: string; 
    iconType: 'outline' | 'filled';
    isSelected: boolean;
    onClick: () => void;
    ariaLabel: string;
  }> = ({ colorName, iconType, isSelected, onClick, ariaLabel }) => {
    
    const iconFill = iconType === 'filled' ? BLACK_PIECE_COLOR_SVG : 'transparent';
    const iconStroke = iconType === 'filled' ? WHITE_PIECE_COLOR_SVG : WHITE_PIECE_COLOR_SVG;
    
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={ariaLabel}
        className={`w-36 h-40 sm:w-40 sm:h-44 p-4 bg-slate-700 rounded-xl shadow-lg flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none
                    ${isSelected ? 'ring-4 ring-sky-500' : 'ring-2 ring-slate-600 hover:ring-sky-400'}`}
      >
        <div className="w-16 h-16 sm:w-20 sm:h-20 mb-2">
          <ChessPieceIcon
            piece={{ 
              id: `select-rook-${colorName}`, 
              type: PieceType.ROOK, 
              color: iconType === 'filled' ? PieceColor.BLACK : PieceColor.WHITE 
            }}
            fillColor={iconFill}
            strokeColor={iconStroke}
            strokeWidth={1.5}
          />
        </div>
        <span className={`text-sm font-medium ${isSelected ? 'text-sky-400' : 'text-slate-300'}`}>{colorName}</span>
      </button>
    );
  };


  return (
    <div className="w-full max-w-md p-6 sm:p-8 space-y-6 bg-slate-800 rounded-xl shadow-2xl">
      <h2 className="text-4xl font-extrabold text-center text-slate-100">Game Setup</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="player1Name" className="block text-sm font-medium text-slate-300 mb-1">
            Player 1 Name
          </label>
          <input
            type="text"
            id="player1Name"
            value={player1Name}
            onChange={(e) => setPlayer1Name(e.target.value)}
            className="mt-1 block w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-md shadow-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
            required
            aria-label="Player 1 Name Input"
          />
        </div>
        <div>
          <label htmlFor="player2Name" className="block text-sm font-medium text-slate-300 mb-1">
            Player 2 Name
          </label>
          <input
            type="text"
            id="player2Name"
            value={player2Name}
            onChange={(e) => setPlayer2Name(e.target.value)}
            className="mt-1 block w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-md shadow-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
            required
            aria-label="Player 2 Name Input"
          />
        </div>
        
        <div className="space-y-4 pt-2">
          <span className="block text-sm font-medium text-slate-300 text-center">Player 1 Chooses Color</span>
          <div className="flex justify-around items-center gap-4">
            <ColorChoiceButton
              colorName="White"
              iconType="outline"
              isSelected={player1ChosenColor === PieceColor.WHITE}
              onClick={() => setPlayer1ChosenColor(PieceColor.WHITE)}
              ariaLabel="Choose White Pieces"
            />
            <ColorChoiceButton
              colorName="Black"
              iconType="filled"
              isSelected={player1ChosenColor === PieceColor.BLACK}
              onClick={() => setPlayer1ChosenColor(PieceColor.BLACK)}
              ariaLabel="Choose Black Pieces"
            />
          </div>
           <p className="text-xs text-slate-400 text-center pt-1">
            Player 2 will be {player1ChosenColor === PieceColor.WHITE ? 'Black' : 'White'}. White starts.
          </p>
        </div>

        <div className="space-y-4 pt-2 border-t border-slate-700">
            <h3 className="text-lg font-medium text-slate-200 text-center">Timer Settings</h3>
            <div className="flex items-center justify-center space-x-3">
                <input
                    type="checkbox"
                    id="useTimer"
                    checked={useTimer}
                    onChange={(e) => setUseTimer(e.target.checked)}
                    className="h-5 w-5 rounded text-sky-500 bg-slate-600 border-slate-500 focus:ring-sky-500 focus:ring-offset-slate-800"
                    aria-labelledby="useTimerLabel"
                />
                <label htmlFor="useTimer" id="useTimerLabel" className="text-sm font-medium text-slate-300">
                    Enable Timer
                </label>
            </div>
            {useTimer && (
                <div className="space-y-2">
                    <label htmlFor="timerDuration" className="block text-sm font-medium text-slate-300 mb-1">
                        Time per move: <span className="font-bold text-sky-400">{timerDuration} seconds</span>
                    </label>
                    <input
                        type="range"
                        id="timerDuration"
                        value={timerDuration}
                        onChange={(e) => setTimerDuration(parseInt(e.target.value, 10))}
                        min="10"
                        max="600"
                        step="10" 
                        className="mt-1 block w-full h-3 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-800"
                        aria-label="Timer duration in seconds"
                    />
                </div>
            )}
        </div>

        <div className="space-y-4 pt-2 border-t border-slate-700">
          <h3 className="text-lg font-medium text-slate-200 text-center">Board Display Mode</h3>
          <div className="flex justify-around">
            <div className="flex items-center">
              <input
                id="singleBoardMode"
                name="boardDisplayMode"
                type="radio"
                value={BoardDisplayMode.SINGLE_FLIPPING}
                checked={boardDisplayMode === BoardDisplayMode.SINGLE_FLIPPING}
                onChange={(e) => setBoardDisplayMode(e.target.value as BoardDisplayMode)}
                className="h-4 w-4 text-sky-500 border-slate-500 bg-slate-600 focus:ring-sky-500"
              />
              <label htmlFor="singleBoardMode" className="ml-2 block text-sm font-medium text-slate-300">
                Single Board (Rotates)
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="dualBoardMode"
                name="boardDisplayMode"
                type="radio"
                value={BoardDisplayMode.DUAL_STATIC}
                checked={boardDisplayMode === BoardDisplayMode.DUAL_STATIC}
                onChange={(e) => setBoardDisplayMode(e.target.value as BoardDisplayMode)}
                className="h-4 w-4 text-sky-500 border-slate-500 bg-slate-600 focus:ring-sky-500"
              />
              <label htmlFor="dualBoardMode" className="ml-2 block text-sm font-medium text-slate-300">
                Dual Boards (Fixed)
              </label>
            </div>
          </div>
        </div>


        <button
          type="submit"
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-lg text-base font-medium text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 focus:ring-offset-slate-800 transition-transform transform hover:scale-105"
        >
          Start Game
        </button>
      </form>
    </div>
  );
};

export default HomeScreen;
