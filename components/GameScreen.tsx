
import React from 'react';
import ChessBoard from './ChessBoard';
import PlayerInfo from './PlayerInfo';
import PromotionModal from './PromotionModal';
import BoardOverlay from './BoardOverlay';
import CapturedPiecesDisplay from './CapturedPiecesDisplay';
import { useChessGame } from '../hooks/useChessGame';
import { GameSettings, PieceColor, PieceType, Player, BoardDisplayMode } from '../types';

interface GameScreenProps {
  settings: GameSettings;
  onGoHome: () => void;
}

const GameScreen: React.FC<GameScreenProps> = ({ settings, onGoHome }) => {
  const {
    boardState,
    currentPlayerColor,
    selectedPieceSquare,
    possibleMoves,
    gameStatus,
    promotingPawn,
    handleSquareClick,
    promotePawn,
    resetGame,
    isKingInCheckSquare,
    easterEggFading,
    whiteTimeLeft,
    blackTimeLeft,
    whiteCapturedPieces, 
    blackCapturedPieces, 
    pieceAnimatingCapture,
    kingAnimatingCheckmateCoords,
  } = useChessGame(settings);

  const player1 = settings.player1;
  const player2 = settings.player2;

  const currentPlayer = currentPlayerColor === player1.color ? player1 : player2;
  
  const whitePlayer = player1.color === PieceColor.WHITE ? player1 : player2;
  const blackPlayer = player1.color === PieceColor.BLACK ? player1 : player2;

  const getCapturedPiecesForPlayer = (player: Player) => {
    // These are pieces *captured by* this player (i.e., opponent's lost pieces)
    if (player.color === PieceColor.WHITE) {
      return whiteCapturedPieces; // Black pieces captured by White
    }
    return blackCapturedPieces; // White pieces captured by Black
  };

  const gameControls = (
    <>
      <button
        onClick={onGoHome}
        disabled={easterEggFading}
        className="py-2 px-6 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg shadow-md transition duration-150 ease-in-out disabled:opacity-50"
      >
        End Game & Go Home
      </button>
      {(gameStatus.isCheckmate || gameStatus.isStalemate || gameStatus.winner) && (
         <button
          onClick={resetGame}
          disabled={easterEggFading}
          className="py-2 px-6 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg shadow-md transition duration-150 ease-in-out disabled:opacity-50"
        >
          Play Again
        </button>
       )}
    </>
  );

  const turnIndicator = (
    <div className="text-center">
        <p className="text-xl font-semibold text-slate-200">
        {gameStatus.isCheckmate || gameStatus.isStalemate || gameStatus.winner
            ? gameStatus.message
            : `${currentPlayer.name}'s Turn (${currentPlayer.color})`}
        </p>
        {gameStatus.isCheck && !gameStatus.isCheckmate && !gameStatus.winner && (
        <p className="text-lg font-bold text-red-400">Check!</p>
        )}
    </div>
  );


  if (settings.boardDisplayMode === BoardDisplayMode.DUAL_STATIC) {
    return (
      <div className="flex flex-col items-center w-full max-w-full px-1 sm:px-2">
        {/* Main layout container: flex-row allows side-by-side attempt, flex-wrap allows stacking on small screens. 
            lg:flex-nowrap forces 3-column on large.
            justify-center for wrapped items, lg:justify-between for 3-column.
        */}
        <div className="flex flex-row flex-wrap lg:flex-nowrap justify-center lg:justify-between w-full items-start gap-2">
          
          {/* White Player's View Area */}
          <div className="flex flex-col items-center order-1 lg:flex-1 space-y-2 p-1">
            <PlayerInfo 
              player={whitePlayer} 
              isCurrent={currentPlayerColor === whitePlayer.color && !gameStatus.winner}
              isOpponent={false}
              timeLeft={whitePlayer.color === PieceColor.WHITE ? whiteTimeLeft : blackTimeLeft} 
            />
            <CapturedPiecesDisplay 
              pieces={getCapturedPiecesForPlayer(whitePlayer)} 
              capturingPlayerColor={whitePlayer.color} 
              alignment="left" 
            />
            <div className="relative w-full max-w-[280px] sm:max-w-[320px] md:max-w-[360px] lg:max-w-[380px] xl:max-w-[420px] 2xl:max-w-[460px] aspect-square mx-auto mt-1">
              <ChessBoard
                boardState={boardState}
                onSquareClick={handleSquareClick}
                selectedSquare={selectedPieceSquare?.coords}
                possibleMoves={possibleMoves}
                playerPerspective={PieceColor.WHITE}
                kingInCheckCoords={isKingInCheckSquare}
                isEasterEggFading={easterEggFading}
                pieceAnimatingCapture={pieceAnimatingCapture}
                kingAnimatingCheckmateCoords={kingAnimatingCheckmateCoords}
                winner={gameStatus.winner}
              />
              {gameStatus.winner && (
                <BoardOverlay 
                  winner={gameStatus.winner} 
                  boardOrientation={PieceColor.WHITE} 
                  boardDisplayMode={settings.boardDisplayMode} 
                />
              )}
            </div>
          </div>

          {/* Center Column (Game Status, Controls) 
              order-last makes it appear below wrapped boards on small screens.
              lg:order-2 places it in the middle on large screens.
              lg:flex-initial ensures it doesn't grow/shrink undesirably on large screens.
          */}
          <div className="flex flex-col items-center w-full order-last lg:order-2 lg:w-auto lg:flex-initial py-4 lg:py-0 space-y-4 mt-4 lg:mt-16">
            {turnIndicator}
            <div className="flex flex-col space-y-3 items-center">
                {gameControls}
            </div>
          </div>

          {/* Black Player's View Area 
              order-2 ensures it tries to stay next to White's view on small screens.
              lg:order-3 places it on the right on large screens.
          */}
          <div className="flex flex-col items-center order-2 lg:order-3 lg:flex-1 space-y-2 p-1">
            <PlayerInfo 
              player={blackPlayer} 
              isCurrent={currentPlayerColor === blackPlayer.color && !gameStatus.winner}
              isOpponent={false} 
              timeLeft={blackPlayer.color === PieceColor.WHITE ? whiteTimeLeft : blackTimeLeft} 
            />
             <CapturedPiecesDisplay 
              pieces={getCapturedPiecesForPlayer(blackPlayer)} 
              capturingPlayerColor={blackPlayer.color} 
              alignment="right" 
            />
            <div className="relative w-full max-w-[280px] sm:max-w-[320px] md:max-w-[360px] lg:max-w-[380px] xl:max-w-[420px] 2xl:max-w-[460px] aspect-square mx-auto mt-1">
              <ChessBoard
                boardState={boardState}
                onSquareClick={handleSquareClick}
                selectedSquare={selectedPieceSquare?.coords}
                possibleMoves={possibleMoves}
                playerPerspective={PieceColor.BLACK}
                kingInCheckCoords={isKingInCheckSquare}
                isEasterEggFading={easterEggFading}
                pieceAnimatingCapture={pieceAnimatingCapture}
                kingAnimatingCheckmateCoords={kingAnimatingCheckmateCoords}
                winner={gameStatus.winner}
              />
              {gameStatus.winner && (
                <BoardOverlay 
                  winner={gameStatus.winner} 
                  boardOrientation={PieceColor.BLACK} 
                  boardDisplayMode={settings.boardDisplayMode} 
                />
              )}
            </div>
          </div>
        </div>
        {promotingPawn && (
          <PromotionModal color={promotingPawn.piece.color} onPromote={(type: PieceType) => promotePawn(type)} />
        )}
      </div>
    );
  }

  // Single Flipping Board Mode (Original Layout)
  return (
    <div className="flex flex-col items-center w-full max-w-5xl xl:max-w-6xl">
      <div className="w-full flex justify-between items-start mb-4 px-1 sm:px-2">
        <div className="flex flex-col items-center space-y-2 w-1/3">
          <PlayerInfo
            player={player1}
            isCurrent={currentPlayerColor === player1.color && !gameStatus.winner}
            isOpponent={false}
            timeLeft={player1.color === PieceColor.WHITE ? whiteTimeLeft : blackTimeLeft}
          />
          <CapturedPiecesDisplay
            pieces={getCapturedPiecesForPlayer(player1)}
            capturingPlayerColor={player1.color}
            alignment="left"
          />
        </div>

        <div className="text-center pt-2 flex-shrink-0 w-1/3">
          {turnIndicator}
        </div>

        <div className="flex flex-col items-center space-y-2 w-1/3">
          <PlayerInfo
            player={player2}
            isCurrent={currentPlayerColor === player2.color && !gameStatus.winner}
            isOpponent={false}
            timeLeft={player2.color === PieceColor.WHITE ? whiteTimeLeft : blackTimeLeft}
          />
           <CapturedPiecesDisplay
            pieces={getCapturedPiecesForPlayer(player2)}
            capturingPlayerColor={player2.color}
            alignment="right"
          />
        </div>
      </div>

      <div className="relative w-[calc(min(80vw,80vh))] max-w-[600px] max-h-[600px] mx-auto aspect-square">
        <ChessBoard
          boardState={boardState}
          onSquareClick={handleSquareClick}
          selectedSquare={selectedPieceSquare?.coords}
          possibleMoves={possibleMoves}
          playerPerspective={currentPlayerColor} // Rotates with current player
          kingInCheckCoords={isKingInCheckSquare}
          isEasterEggFading={easterEggFading}
          pieceAnimatingCapture={pieceAnimatingCapture}
          kingAnimatingCheckmateCoords={kingAnimatingCheckmateCoords}
          winner={gameStatus.winner}
        />
        {gameStatus.winner && (
          <BoardOverlay
            winner={gameStatus.winner}
            boardOrientation={currentPlayerColor} // Orientation matches current (or last) player perspective
            boardDisplayMode={settings.boardDisplayMode} // Pass mode for single board too
          />
        )}
      </div>

      {promotingPawn && (
        <PromotionModal color={promotingPawn.piece.color} onPromote={(type: PieceType) => promotePawn(type)} />
      )}

      <div className="mt-6 flex space-x-4 z-20">
        {gameControls}
      </div>
    </div>
  );
};

export default GameScreen;