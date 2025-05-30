
import React, { useState, useEffect } from 'react';
import { PieceColor, BoardDisplayMode } from '../types'; // Added BoardDisplayMode

interface BoardOverlayProps {
  winner: PieceColor | null;
  boardOrientation: PieceColor; // The perspective of the board (whose pieces are at the bottom)
  boardDisplayMode?: BoardDisplayMode; // Optional: current board display mode
}

const BoardOverlay: React.FC<BoardOverlayProps> = ({ winner, boardOrientation, boardDisplayMode }) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (winner) {
      const timerId = setTimeout(() => setAnimate(true), 1000); // Delay animation start
      return () => clearTimeout(timerId);
    } else {
      setAnimate(false);
    }
  }, [winner]);

  if (!winner) {
    return null;
  }

  // DUAL_STATIC mode: Full board overlay
  if (boardDisplayMode === BoardDisplayMode.DUAL_STATIC) {
    const isWinnerSide = boardOrientation === winner;
    const overlayColorClass = isWinnerSide ? 'green-mask' : 'red-mask';
    
    return (
      <div className="board-overlay-container">
        <div
          className={`full-board-overlay-pane ${overlayColorClass} ${animate ? 'animate-fade-in' : ''}`}
          aria-hidden="true"
        />
      </div>
    );
  }

  // SINGLE_FLIPPING mode (default behavior): Half board slide
  const loserColor = winner === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;
  const piecesOnBottomScreenHalf = boardOrientation;
  const piecesOnTopScreenHalf = boardOrientation === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;

  const isLoserOnBottomScreenHalf = loserColor === piecesOnBottomScreenHalf;
  const isWinnerOnBottomScreenHalf = winner === piecesOnBottomScreenHalf;
  
  const isLoserOnTopScreenHalf = loserColor === piecesOnTopScreenHalf;
  const isWinnerOnTopScreenHalf = winner === piecesOnTopScreenHalf;

  const topHalfInitialClass = 
    isLoserOnTopScreenHalf ? 'animate-slide-up initial' : 
    isWinnerOnTopScreenHalf ? 'animate-slide-down initial' : '';
  const topHalfActiveClass = 
    isLoserOnTopScreenHalf ? 'red-mask animate-slide-up active' :
    isWinnerOnTopScreenHalf ? 'green-mask animate-slide-down active' : '';
  
  const bottomHalfInitialClass = 
    isLoserOnBottomScreenHalf ? 'animate-slide-up initial' :
    isWinnerOnBottomScreenHalf ? 'animate-slide-down initial' : '';
  const bottomHalfActiveClass =
    isLoserOnBottomScreenHalf ? 'red-mask animate-slide-up active' :
    isWinnerOnBottomScreenHalf ? 'green-mask animate-slide-down active' : '';

  return (
    <div className="board-overlay-container">
      <div 
        className={`overlay-half ${animate ? topHalfActiveClass : topHalfInitialClass}`}
        aria-hidden="true"
      />
      <div 
        className={`overlay-half ${animate ? bottomHalfActiveClass : bottomHalfInitialClass}`}
        aria-hidden="true"
      />
    </div>
  );
};

export default BoardOverlay;