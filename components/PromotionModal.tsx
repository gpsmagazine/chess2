
import React from 'react';
import { PieceColor, PieceType } from '../types';
import ChessPieceIcon from './ChessPieceIcon';

interface PromotionModalProps {
  color: PieceColor;
  onPromote: (type: PieceType) => void;
}

const PROMOTION_PIECES: PieceType[] = [
  PieceType.QUEEN,
  PieceType.ROOK,
  PieceType.BISHOP,
  PieceType.KNIGHT,
];

const PromotionModal: React.FC<PromotionModalProps> = ({ color, onPromote }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-slate-800 p-8 rounded-lg shadow-xl">
        <h3 className="text-2xl font-semibold text-slate-100 mb-6 text-center">Promote Pawn</h3>
        <div className="flex space-x-4 justify-center">
          {PROMOTION_PIECES.map((type) => (
            <button
              key={type}
              onClick={() => onPromote(type)}
              className="p-3 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label={`Promote to ${type.toLowerCase()}`}
            >
              <div className="w-16 h-16"> {/* Fixed size for icons */}
                <ChessPieceIcon piece={{ id: `promo-${type}`, type, color, hasMoved: true }} />
              </div>
              <span className="block text-center mt-2 text-sm text-slate-300">{type.charAt(0) + type.slice(1).toLowerCase()}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PromotionModal;
    