
import React from 'react';
import { Piece, PieceColor, PieceType } from '../types';
import { PIECE_SVG_PATHS, WHITE_PIECE_COLOR_SVG, BLACK_PIECE_COLOR_SVG } from '../constants';

interface ChessPieceIconProps {
  piece: Piece;
  fillColor?: string; // Optional override
  strokeColor?: string; // Optional override
  strokeWidth?: number; // Optional override
  isFadingOut?: boolean; // Optional: For Easter Egg animation
  isVisuallySelected?: boolean; // Optional: For selection vibration
  isCaptureAnimating?: boolean; // Optional: For capture animation
  isKingBlastAnimating?: boolean; // Optional: For King checkmate animation
}

const ChessPieceIcon: React.FC<ChessPieceIconProps> = ({ 
  piece, 
  fillColor: fillOverride,
  strokeColor: strokeOverride,
  strokeWidth: strokeWidthOverride,
  isFadingOut,
  isVisuallySelected,
  isCaptureAnimating,
  isKingBlastAnimating,
}) => {
  const path = PIECE_SVG_PATHS[piece.type];
  
  const defaultFillColor = piece.color === PieceColor.WHITE ? WHITE_PIECE_COLOR_SVG : BLACK_PIECE_COLOR_SVG;
  const defaultStrokeColor = piece.color === PieceColor.WHITE ? BLACK_PIECE_COLOR_SVG : WHITE_PIECE_COLOR_SVG; // For outline
  const defaultStrokeWidth = 0.5;

  const actualFillColor = fillOverride !== undefined ? fillOverride : defaultFillColor;
  const actualStrokeColor = strokeOverride !== undefined ? strokeOverride : defaultStrokeColor;
  const actualStrokeWidth = strokeWidthOverride !== undefined ? strokeWidthOverride : defaultStrokeWidth;

  const isActuallyFading = isFadingOut && piece.type !== PieceType.KING;

  const animationClasses = [];
  let hasDestructiveAnimation = false;

  if (isKingBlastAnimating) {
    animationClasses.push('king-blast-animation');
    hasDestructiveAnimation = true;
  } else if (isCaptureAnimating) {
    animationClasses.push('piece-capture-animation');
    hasDestructiveAnimation = true;
  }

  // Other animations should not play if a destructive one (blast/capture) is active
  if (!hasDestructiveAnimation) {
    if (isActuallyFading) { // Easter egg fade
      animationClasses.push('fade-out');
    }
    if (isVisuallySelected) {
      animationClasses.push('piece-vibrating');
    }
  }

  const style: React.CSSProperties = { filter: `drop-shadow(0 2px 2px rgba(0,0,0,0.3))` };
  
  // Regular capture animation uses absolute positioning for the temporary icon
  if (isCaptureAnimating && !isKingBlastAnimating) { // Ensure not king blast
    style.position = 'absolute';
    style.top = '0';
    style.left = '0';
    style.width = '100%'; 
    style.height = '100%';
    style.zIndex = 10; 
  }
  // King blast animation might need z-index if it's in-place to ensure it's on top during its animation
  if (isKingBlastAnimating) {
    style.zIndex = 15; // Make sure it's above other elements if needed
    style.position = 'relative'; // Ensure transforms are relative to its normal position
  }


  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-full h-full chess-piece-icon ${animationClasses.join(' ')}`}
      style={style}
      aria-hidden="true" // Decorative, label provided by parent button
    >
      <path d={path} fill={actualFillColor} stroke={actualStrokeColor} strokeWidth={actualStrokeWidth} />
    </svg>
  );
};

export default ChessPieceIcon;