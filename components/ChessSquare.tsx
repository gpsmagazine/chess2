import React from 'react';
import ChessPieceIcon from './ChessPieceIcon';
import { SquareState, Piece, PieceType, PieceColor } from '../types';
import { 
  LIGHT_SQUARE_COLOR, 
  DARK_SQUARE_COLOR,
  RUBBLE_SVG_PATH,
  RUBBLE_FILL_COLOR_SVG,
  RUBBLE_STROKE_COLOR_SVG,
  BLACK_RUBBLE_FILL_COLOR_SVG, // Added
  BLACK_RUBBLE_STROKE_COLOR_SVG, // Added
  BOARD_SIZE
} from '../constants';

interface ChessSquareProps {
  squareData: SquareState; // Contains canonical .coords
  onClick: () => void;
  isLightSquare: boolean;
  isSelected: boolean; // For square highlighting
  isPossibleMove: boolean;
  isKingInCheck: boolean;
  isFadingOut?: boolean; // Optional: For Easter Egg animation
  isPieceVisuallySelected?: boolean; // Optional: For piece vibration
  pieceAnimatingCapture: { piece: Piece; coords: { row: number; col: number } } | null; // For capture animation
  kingAnimatingCheckmateCoords: { row: number; col: number } | null; // For King blast
  winner: PieceColor | null; // Winner of the game
}

const ChessSquare: React.FC<ChessSquareProps> = ({
  squareData,
  onClick,
  isLightSquare,
  isSelected,
  isPossibleMove,
  isKingInCheck,
  isFadingOut,
  isPieceVisuallySelected,
  pieceAnimatingCapture,
  kingAnimatingCheckmateCoords,
  winner,
}) => {
  const bgColor = isLightSquare ? LIGHT_SQUARE_COLOR : DARK_SQUARE_COLOR;

  let highlightClass = '';
  if (isKingInCheck) {
    highlightClass = 'highlight-check';
  } else if (isSelected) {
    highlightClass = 'highlight-selected';
  } else if (isPossibleMove) {
    highlightClass = 'highlight-possible';
  }

  const showCaptureAnimation = pieceAnimatingCapture &&
                               pieceAnimatingCapture.coords.row === squareData.coords.row &&
                               pieceAnimatingCapture.coords.col === squareData.coords.col;

  const isThisKingCheckmated =
    squareData.piece &&
    squareData.piece.type === PieceType.KING &&
    kingAnimatingCheckmateCoords &&
    kingAnimatingCheckmateCoords.row === squareData.coords.row &&
    kingAnimatingCheckmateCoords.col === squareData.coords.col &&
    (winner === null || squareData.piece.color !== winner);

  return (
    <div
      className={`chess-square aspect-square flex items-center justify-center cursor-pointer transition-colors duration-150 ${bgColor} ${highlightClass} relative`}
      onClick={onClick}
      role="button"
      aria-label={`Square ${String.fromCharCode(65 + squareData.coords.col)}${BOARD_SIZE - squareData.coords.row}${squareData.piece ? `, contains ${squareData.piece.color} ${squareData.piece.type}` : ', empty'}`}
    >
      {/* Render the current piece on the board */}
      {squareData.piece && (
        <ChessPieceIcon
          piece={squareData.piece}
          isFadingOut={isFadingOut}
          isVisuallySelected={isPieceVisuallySelected}
          isKingBlastAnimating={isThisKingCheckmated} // King will play its "disappear" animation
        />
      )}

      {/* Render the rubble pile if this king is checkmated */}
      {isThisKingCheckmated && squareData.piece && ( // Ensure squareData.piece exists for color check
        <div 
          className="absolute inset-0 flex items-center justify-center rubble-pile" 
          style={{ zIndex: 5 }}
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 24" className="w-2/3 h-2/3"> {/* Rubble is smaller than the square */}
            <path 
              d={RUBBLE_SVG_PATH} 
              fill={squareData.piece.color === PieceColor.BLACK ? BLACK_RUBBLE_FILL_COLOR_SVG : RUBBLE_FILL_COLOR_SVG} 
              stroke={squareData.piece.color === PieceColor.BLACK ? BLACK_RUBBLE_STROKE_COLOR_SVG : RUBBLE_STROKE_COLOR_SVG} 
              strokeWidth="1" // Increased stroke width slightly for jagged look
            />
          </svg>
        </div>
      )}
      
      {/* Render the captured piece's animation if this square is where it was captured */}
      {showCaptureAnimation && pieceAnimatingCapture && !isThisKingCheckmated && (
        <ChessPieceIcon
          piece={pieceAnimatingCapture.piece}
          isCaptureAnimating={true}
        />
      )}
    </div>
  );
};

export default ChessSquare;