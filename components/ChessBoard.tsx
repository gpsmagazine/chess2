
import React, { useMemo } from 'react';
import ChessSquare from './ChessSquare';
import { BoardState, PieceColor, SquareState, Piece } from '../types'; 
import { BOARD_SIZE } from '../constants';

interface ChessBoardProps {
  boardState: BoardState; 
  onSquareClick: (row: number, col: number) => void; 
  selectedSquare: { row: number; col: number } | null | undefined; 
  possibleMoves: Array<{ row: number; col: number }>; 
  playerPerspective: PieceColor; 
  kingInCheckCoords: { row: number; col: number } | null; 
  isEasterEggFading?: boolean; 
  pieceAnimatingCapture: { piece: Piece; coords: { row: number; col: number } } | null; 
  kingAnimatingCheckmateCoords: { row: number; col: number } | null; 
  winner: PieceColor | null; 
}

const ChessBoard: React.FC<ChessBoardProps> = ({
  boardState,
  onSquareClick,
  selectedSquare,
  possibleMoves,
  playerPerspective,
  kingInCheckCoords,
  isEasterEggFading,
  pieceAnimatingCapture,
  kingAnimatingCheckmateCoords,
  winner,
}) => {

  const displayBoard = useMemo(() => {
    if (playerPerspective === PieceColor.BLACK) {
      const newDisplayBoard: SquareState[][] = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
      for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
          newDisplayBoard[r][c] = boardState[BOARD_SIZE - 1 - r][BOARD_SIZE - 1 - c];
        }
      }
      return newDisplayBoard;
    }
    return boardState; 
  }, [boardState, playerPerspective]);

  const getCanonicalCoords = (dispRow: number, dispCol: number): { row: number; col: number } => {
    if (playerPerspective === PieceColor.BLACK) {
      return {
        row: BOARD_SIZE - 1 - dispRow,
        col: BOARD_SIZE - 1 - dispCol,
      };
    }
    return { row: dispRow, col: dispCol };
  };

  const getDisplayCoords = (canonRow: number, canonCol: number): { row: number; col: number } => {
    if (playerPerspective === PieceColor.BLACK) {
      return {
        row: BOARD_SIZE - 1 - canonRow,
        col: BOARD_SIZE - 1 - canonCol,
      };
    }
    return { row: canonRow, col: canonCol };
  };

  return (
    <div 
      className={`chess-board-container grid grid-cols-8 w-full h-full border-4 border-slate-700 shadow-2xl rounded-md`}
      // The parent div in GameScreen.tsx will now control the aspect ratio and max-width/height
    >
      {displayBoard.map((rowItems, dispRowIndex) =>
        rowItems.map((squareData, dispColIndex) => {

          let isSquareHighlightedSelected = false;
          if (selectedSquare) {
            const displaySelected = getDisplayCoords(selectedSquare.row, selectedSquare.col);
            isSquareHighlightedSelected = displaySelected.row === dispRowIndex && displaySelected.col === dispColIndex;
          }

          const isPossibleMove = possibleMoves.some((move) => {
            const displayMove = getDisplayCoords(move.row, move.col);
            return displayMove.row === dispRowIndex && displayMove.col === dispColIndex;
          });

          let isKingInCheckHighlight = false;
          if (kingInCheckCoords) {
            const displayKingCheck = getDisplayCoords(kingInCheckCoords.row, kingInCheckCoords.col);
            isKingInCheckHighlight = displayKingCheck.row === dispRowIndex && displayKingCheck.col === dispColIndex;
          }
          
          const isPieceVisuallySelected = !!(
            selectedSquare &&
            squareData.piece && 
            selectedSquare.row === squareData.coords.row &&
            selectedSquare.col === squareData.coords.col
          );

          return (
            <ChessSquare
              key={`${dispRowIndex}-${dispColIndex}-${playerPerspective}`} // Add perspective to key for dual board
              squareData={squareData} 
              onClick={() => {
                const {row: canonRow, col: canonCol} = getCanonicalCoords(dispRowIndex, dispColIndex);
                onSquareClick(canonRow, canonCol);
              }}
              isLightSquare={(dispRowIndex + dispColIndex) % 2 === 0} 
              isSelected={isSquareHighlightedSelected} 
              isPossibleMove={isPossibleMove}
              isKingInCheck={isKingInCheckHighlight}
              isFadingOut={isEasterEggFading && !!squareData.piece}
              isPieceVisuallySelected={isPieceVisuallySelected} 
              pieceAnimatingCapture={pieceAnimatingCapture}
              kingAnimatingCheckmateCoords={kingAnimatingCheckmateCoords} 
              winner={winner} 
            />
          );
        })
      )}
    </div>
  );
};

export default ChessBoard;
