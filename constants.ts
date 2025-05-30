
import { PieceColor, PieceType, BoardState, SquareState, Piece } from './types';

export const BOARD_SIZE = 8;

const createPiece = (color: PieceColor, type: PieceType, idSuffix: string): Piece => ({
  id: `${type}_${color}_${idSuffix}`,
  color,
  type,
  hasMoved: false,
});

export const INITIAL_BOARD_SETUP: BoardState = Array(BOARD_SIZE)
  .fill(null)
  .map((_, r) =>
    Array(BOARD_SIZE)
      .fill(null)
      .map((_, c) => {
        const square: SquareState = { piece: null, coords: { row: r, col: c } };
        const idSuffix = `${String.fromCharCode(65 + c)}${BOARD_SIZE - r}`;

        if (r === 1) square.piece = createPiece(PieceColor.BLACK, PieceType.PAWN, idSuffix);
        if (r === 6) square.piece = createPiece(PieceColor.WHITE, PieceType.PAWN, idSuffix);

        if (r === 0) { // Black's back rank
          if (c === 0 || c === 7) square.piece = createPiece(PieceColor.BLACK, PieceType.ROOK, idSuffix);
          if (c === 1 || c === 6) square.piece = createPiece(PieceColor.BLACK, PieceType.KNIGHT, idSuffix);
          if (c === 2 || c === 5) square.piece = createPiece(PieceColor.BLACK, PieceType.BISHOP, idSuffix);
          if (c === 3) square.piece = createPiece(PieceColor.BLACK, PieceType.QUEEN, idSuffix);
          if (c === 4) square.piece = createPiece(PieceColor.BLACK, PieceType.KING, idSuffix);
        }
        if (r === 7) { // White's back rank
          if (c === 0 || c === 7) square.piece = createPiece(PieceColor.WHITE, PieceType.ROOK, idSuffix);
          if (c === 1 || c === 6) square.piece = createPiece(PieceColor.WHITE, PieceType.KNIGHT, idSuffix);
          if (c === 2 || c === 5) square.piece = createPiece(PieceColor.WHITE, PieceType.BISHOP, idSuffix);
          if (c === 3) square.piece = createPiece(PieceColor.WHITE, PieceType.QUEEN, idSuffix);
          if (c === 4) square.piece = createPiece(PieceColor.WHITE, PieceType.KING, idSuffix);
        }
        return square;
      })
  );

export const PIECE_SVG_PATHS: Record<PieceType, string> = {
  [PieceType.KING]: "M11 1 H13 V3 H15 V5 H13 V7 H11 V5 H9 V3 H11 V1 Z M7 9 H17 V21 H7 V9 Z M10 11 H14 V19 H10 V11 Z", 
  [PieceType.QUEEN]: "M12 3 L10.5 6 L13.5 6 L12 3 Z M8 4 L6.5 7 L9.5 7 L8 4 Z M16 4 L14.5 7 L17.5 7 L16 4 Z M7 9 H17 V21 H7 V9 Z M10 11 H14 V19 H10 V11 Z",
  [PieceType.ROOK]: "M4,21 L4,19 L6,19 L6,9 L5,9 L5,6 L7,6 L7,4 L9,4 L9,6 L11,6 L11,4 L13,4 L13,6 L15,6 L15,4 L17,4 L17,6 L19,6 L19,9 L18,9 L18,19 L20,19 L20,21 L4,21 Z",
  [PieceType.BISHOP]: "M12 2L6 10H18L12 2ZM8 12C8 14 10 16 12 16C14 16 16 14 16 12H8Z M10 18H14V22H10V18Z",
  [PieceType.KNIGHT]: "M6 2L10 6L6 10H4V2H6ZM8 4C8 2 10 2 12 4L16 10H10L8 4ZM10 12H18V18C18 20 16 22 14 22H10V12Z",
  [PieceType.PAWN]: "M12 6C10 6 8 8 8 10V14H16V10C16 8 14 6 12 6ZM10 16H14V20H10V16Z",
};

export const WHITE_PIECE_COLOR_SVG = "#E0E7FF"; // Light indigo
export const BLACK_PIECE_COLOR_SVG = "#374151"; // Cool gray 700

export const LIGHT_SQUARE_COLOR = "bg-slate-300"; // Lighter square
export const DARK_SQUARE_COLOR = "bg-slate-500"; // Darker square

// Sound Data URLs (Base64 encoded WAV)
export const MOVE_SOUND_DATA_URL = 'data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAZGF0YSAIAAAA//8='; 
export const CAPTURE_SOUND_DATA_URL = 'data:audio/wav;base64,UklGRkYAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQBAAAAAPz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pw==';
export const CHECK_SOUND_DATA_URL = 'data:audio/wav;base64,UklGRkoAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAZGF0YUYAAABSSc9Tdp9QSS9X9Uv1RvdN90P3OvY/9zT4QfZL8kH0QvRB9Eb1TfVK8kvwQPK78LnwfvBB8LXwuvCq8KTwlvCY8Irwfg==';
export const GAME_END_SOUND_DATA_URL = 'data:audio/wav;base64,UklGRlYAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAZGF0YVIAAAAEAAAAvyo/Nv+o/4P/Av9P/0D/ov7H/rn+v//A/8f/wv/I/6D/Pf5w/oH+zP7O/rz+vP7A/7n/qf+P/4b/gP+C/3n/fP9w/1j/Uv9Q/0s=';

// Easter Egg
export const EASTER_EGG_SEQUENCE: PieceType[] = [PieceType.ROOK, PieceType.KNIGHT, PieceType.KING, PieceType.KNIGHT];
export const EASTER_EGG_SOUND_DATA_URL = 'data:audio/wav;base64,UklGRlICAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAZGF0YUgCAACAgICAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwNDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8';

// Timer
export const PLAYER_MOVE_TIME_LIMIT_SECONDS = 60; // Default value for UI, actual game logic uses GameSettings

// Rubble for checkmated King
export const RUBBLE_SVG_PATH = "M6 21 L9 17 L12 19 L10 22 L6 21 Z M11 18 L15 15 L17 17 L14 20 L11 18 Z M13 22 L16 19 L19 21 L17 23 L13 22 Z M8 15 L12 13 L14 16 L10 18 L8 15 Z";
export const RUBBLE_FILL_COLOR_SVG = "#E5E7EB"; // Tailwind gray-200 (for white king)
export const RUBBLE_STROKE_COLOR_SVG = "#9CA3AF"; // Tailwind gray-400 (for white king)
export const BLACK_RUBBLE_FILL_COLOR_SVG = "#4B5563"; // Tailwind gray-600 (for black king)
export const BLACK_RUBBLE_STROKE_COLOR_SVG = "#1F2937"; // Tailwind gray-800 (for black king)--- END OF FILE components/HomeScreen.tsx ---
