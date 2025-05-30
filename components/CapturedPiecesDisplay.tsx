
import React from 'react';
import { Piece, PieceColor } from '../types';
import ChessPieceIcon from './ChessPieceIcon';

interface CapturedPiecesDisplayProps {
  pieces: Piece[];
  capturingPlayerColor: PieceColor; // Color of the player who captured these pieces
  alignment: 'left' | 'right';
}

const CapturedPiecesDisplay: React.FC<CapturedPiecesDisplayProps> = ({ pieces, capturingPlayerColor, alignment }) => {
  if (pieces.length === 0) {
    return <div className="h-8 sm:h-10"></div>; // Placeholder for consistent height
  }

  // Sort pieces by a predefined order (e.g., Queen, Rook, Bishop, Knight, Pawn)
  const pieceOrderValue = (piece: Piece) => {
    switch (piece.type) {
      case 'QUEEN': return 1;
      case 'ROOK': return 2;
      case 'BISHOP': return 3;
      case 'KNIGHT': return 4;
      case 'PAWN': return 5;
      default: return 6;
    }
  };
  const sortedPieces = [...pieces].sort((a, b) => pieceOrderValue(a) - pieceOrderValue(b));


  return (
    <div className={`captured-pieces-display flex flex-wrap gap-0.5 p-1.5 rounded-md bg-slate-700/70 shadow min-h-[32px] sm:min-h-[40px] w-full max-w-[160px] sm:max-w-[200px] justify-start ${alignment === 'left' ? 'sm:justify-start' : 'sm:justify-start'}`}>
      {sortedPieces.map((piece, index) => (
        <div key={`${piece.id}-${index}`} className="w-5 h-5 sm:w-6 sm:h-6" title={`${piece.color} ${piece.type} captured by ${capturingPlayerColor}`}>
          <ChessPieceIcon piece={piece} />
        </div>
      ))}
    </div>
  );
};

export default CapturedPiecesDisplay;