
export enum PieceColor {
  WHITE = 'WHITE',
  BLACK = 'BLACK',
}

export enum PieceType {
  PAWN = 'PAWN',
  ROOK = 'ROOK',
  KNIGHT = 'KNIGHT',
  BISHOP = 'BISHOP',
  QUEEN = 'QUEEN',
  KING = 'KING',
}

export interface Piece {
  id: string; // Unique ID for React keys, e.g., `P_W_A1`
  color: PieceColor;
  type: PieceType;
  hasMoved?: boolean;
}

export interface SquareState {
  piece: Piece | null;
  coords: { row: number; col: number };
}

export type BoardState = SquareState[][];

export interface Player {
  name: string;
  color: PieceColor;
}

export enum BoardDisplayMode {
  SINGLE_FLIPPING = 'SINGLE_FLIPPING', // Default, board rotates
  DUAL_STATIC = 'DUAL_STATIC',       // Two boards, fixed perspectives
}

export interface GameSettings {
  player1: Player;
  player2: Player;
  player1Starts: boolean; // True if player1 is white
  timerDurationSeconds: number | null; // Duration in seconds per move, or null if timer is disabled
  boardDisplayMode: BoardDisplayMode; // New setting for board display
}

export interface Move {
  from: { row: number; col: number };
  to: { row: number; col: number };
}

export interface GameStatus {
  message: string;
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  winner: PieceColor | null;
}

// This interface is implicitly defined by BoardOverlay.tsx props, 
// but explicitly defining it here for clarity if needed elsewhere,
// or for better type checking across files.
// If not used elsewhere, it can remain implicit in BoardOverlay.tsx.
export interface BoardOverlayProps {
  winner: PieceColor | null;
  boardOrientation: PieceColor;
  boardDisplayMode?: BoardDisplayMode; // Make explicit if used for prop-types or context
}
