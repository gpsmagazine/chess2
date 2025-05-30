
import { useState, useCallback, useEffect } from 'react';
import {
  BoardState,
  Piece,
  PieceColor,
  PieceType,
  SquareState,
  GameSettings,
  Move,
  GameStatus,
} from '../types';
import {
  INITIAL_BOARD_SETUP,
  BOARD_SIZE,
  MOVE_SOUND_DATA_URL,
  CAPTURE_SOUND_DATA_URL,
  CHECK_SOUND_DATA_URL,
  GAME_END_SOUND_DATA_URL,
  EASTER_EGG_SEQUENCE,
  EASTER_EGG_SOUND_DATA_URL,
  // PLAYER_MOVE_TIME_LIMIT_SECONDS, // No longer the primary source of truth
} from '../constants';
import { produce } from 'immer';
import { playSound } from '../utils/audioUtils';

const createInitialBoard = (): BoardState => {
  return INITIAL_BOARD_SETUP.map(row => 
    row.map(square => ({
      ...square,
      coords: { ...square.coords }, 
      piece: square.piece ? { ...square.piece } : null,
    }))
  );
};

const CAPTURE_ANIMATION_DURATION_MS = 700;

export const useChessGame = (settings: GameSettings) => {
  const [boardState, setBoardState] = useState<BoardState>(createInitialBoard());
  const [currentPlayerColor, setCurrentPlayerColor] = useState<PieceColor>(
    settings.player1Starts ? settings.player1.color : settings.player2.color
  );
  const [selectedPieceSquare, setSelectedPieceSquare] = useState<SquareState | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<Array<{ row: number; col: number }>>([]);
  
  const initialGameStatus: GameStatus = {
    message: `${settings.player1Starts ? settings.player1.name : settings.player2.name}'s Turn`,
    isCheck: false,
    isCheckmate: false,
    isStalemate: false,
    winner: null,
  };
  const [gameStatus, setGameStatus] = useState<GameStatus>(initialGameStatus);
  const [promotingPawn, setPromotingPawn] = useState<{ piece: Piece; to: {row: number, col: number}} | null>(null);
  const [isKingInCheckSquare, setKingInCheckSquare] = useState<{row: number, col: number} | null>(null);

  const [easterEggSequence, setEasterEggSequence] = useState<PieceType[]>([]);
  const [easterEggFading, setEasterEggFading] = useState<boolean>(false);

  const [whiteTimeLeft, setWhiteTimeLeft] = useState<number | null>(settings.timerDurationSeconds);
  const [blackTimeLeft, setBlackTimeLeft] = useState<number | null>(settings.timerDurationSeconds);
  
  const [activeTimerColor, setActiveTimerColor] = useState<PieceColor | null>(
    settings.timerDurationSeconds !== null ? (settings.player1Starts ? settings.player1.color : settings.player2.color) : null
  );

  const [whiteCapturedPieces, setWhiteCapturedPieces] = useState<Piece[]>([]);
  const [blackCapturedPieces, setBlackCapturedPieces] = useState<Piece[]>([]);
  const [pieceAnimatingCapture, setPieceAnimatingCapture] = useState<{ piece: Piece; coords: { row: number; col: number } } | null>(null);
  const [kingAnimatingCheckmateCoords, setKingAnimatingCheckmateCoords] = useState<{ row: number; col: number } | null>(null);

  const findKingPosition = (kingColor: PieceColor, currentBoard: BoardState): { row: number, col: number } | null => {
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const piece = currentBoard[r][c].piece;
        if (piece && piece.type === PieceType.KING && piece.color === kingColor) {
          return { row: r, col: c };
        }
      }
    }
    return null;
  };
  
  const getPiecePossibleMoves = (
    piece: Piece,
    from: { row: number; col: number },
    currentBoard: BoardState,
    isAttackCheck: boolean = false 
  ): Array<{ row: number; col: number }> => {
    const moves: Array<{ row: number; col: number }> = [];
    const { row, col } = from;
    const color = piece.color;
    const opponentColor = color === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;

    const isKingInCheckInner = (kingColor: PieceColor, boardForCheck: BoardState): boolean => {
      const kingPos = findKingPosition(kingColor, boardForCheck);
      if (!kingPos) return false; 
      const attackerColorInner = kingColor === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;
      
      for (let r_check = 0; r_check < BOARD_SIZE; r_check++) {
        for (let c_check = 0; c_check < BOARD_SIZE; c_check++) {
          const attackingPiece = boardForCheck[r_check][c_check].piece;
          if (attackingPiece && attackingPiece.color === attackerColorInner) {
            const attackMoves = getPiecePossibleMoves(attackingPiece, { row: r_check, col: c_check }, boardForCheck, true);
            if (attackMoves.some(move => move.row === kingPos.row && move.col === kingPos.col)) {
              return true;
            }
          }
        }
      }
      return false;
    };

    const addMoveIfValid = (toRow: number, toCol: number, isCaptureOnly: boolean = false, isMoveOnly: boolean = false) => {
      if (toRow < 0 || toRow >= BOARD_SIZE || toCol < 0 || toCol >= BOARD_SIZE) return;
      
      const targetSquare = currentBoard[toRow][toCol];
      
      if (isMoveOnly && targetSquare.piece) return; 
      if (isCaptureOnly && (!targetSquare.piece || targetSquare.piece.color === color)) return; 

      if (!targetSquare.piece || targetSquare.piece.color === opponentColor || isCaptureOnly) {
        if (!isAttackCheck) { 
          const tempBoard = produce(currentBoard, draft => {
            draft[toRow][toCol].piece = {...piece, hasMoved: true}; 
            draft[from.row][from.col].piece = null;
          });
          if (!isKingInCheckInner(color, tempBoard)) {
            moves.push({ row: toRow, col: toCol });
          }
        } else {
          moves.push({ row: toRow, col: toCol });
        }
      }
    };

    const addLineMoves = (rowStep: number, colStep: number) => {
      for (let i = 1; i < BOARD_SIZE; i++) {
        const toRow = row + i * rowStep;
        const toCol = col + i * colStep;
        if (toRow < 0 || toRow >= BOARD_SIZE || toCol < 0 || toCol >= BOARD_SIZE) break;
        const targetSquare = currentBoard[toRow][toCol];
        if (targetSquare.piece) {
          if (targetSquare.piece.color === opponentColor) addMoveIfValid(toRow, toCol);
          break;
        }
        addMoveIfValid(toRow, toCol);
      }
    };

    switch (piece.type) {
      case PieceType.PAWN:
        {
          const direction = color === PieceColor.WHITE ? -1 : 1;
          addMoveIfValid(row + direction, col, false, true);
          if (!piece.hasMoved && !currentBoard[row + direction][col].piece && !currentBoard[row + 2 * direction]?.[col].piece) {
            addMoveIfValid(row + 2 * direction, col, false, true);
          }
          addMoveIfValid(row + direction, col - 1, true);
          addMoveIfValid(row + direction, col + 1, true);
        }
        break;
      case PieceType.ROOK:
        addLineMoves(1, 0); 
        addLineMoves(-1, 0); 
        addLineMoves(0, 1); 
        addLineMoves(0, -1);
        break;
      case PieceType.KNIGHT:
        {
          const knightMoves = [
            [1, 2], [1, -2], [-1, 2], [-1, -2],
            [2, 1], [2, -1], [-2, 1], [-2, -1]
          ];
          knightMoves.forEach(([dr, dc]) => addMoveIfValid(row + dr, col + dc));
        }
        break;
      case PieceType.BISHOP:
        addLineMoves(1, 1); 
        addLineMoves(1, -1); 
        addLineMoves(-1, 1); 
        addLineMoves(-1, -1);
        break;
      case PieceType.QUEEN:
        addLineMoves(1, 0); 
        addLineMoves(-1, 0); 
        addLineMoves(0, 1); 
        addLineMoves(0, -1);
        addLineMoves(1, 1); 
        addLineMoves(1, -1); 
        addLineMoves(-1, 1); 
        addLineMoves(-1, -1);
        break;
      case PieceType.KING:
        {
          const kingStandardMoves = [
            [1,0],[-1,0],[0,1],[0,-1],
            [1,1],[1,-1],[-1,1],[-1,-1]
          ];
          kingStandardMoves.forEach(([dr, dc]) => addMoveIfValid(row + dr, col + dc));

          const isSquareAttackedByKingHelper = (checkRow: number, checkCol: number, attackerColor: PieceColor, checkBoard: BoardState): boolean => {
            for (let r_king_helper = 0; r_king_helper < BOARD_SIZE; r_king_helper++) {
              for (let c_king_helper = 0; c_king_helper < BOARD_SIZE; c_king_helper++) {
                const pieceAttacker = checkBoard[r_king_helper][c_king_helper].piece;
                if (pieceAttacker && pieceAttacker.color === attackerColor) {
                  const movesAttacker = getPiecePossibleMoves(pieceAttacker, { row: r_king_helper, col: c_king_helper }, checkBoard, true);
                  if (movesAttacker.some(move => move.row === checkRow && move.col === checkCol)) {
                    return true;
                  }
                }
              }
            }
            return false;
          };

          const isKingInCheckExternal = (checkColor: PieceColor, boardCheck: BoardState): boolean => {
            const kPos = findKingPosition(checkColor, boardCheck);
            if (!kPos) return false;
            const attackerColorOuter = checkColor === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;
            return isSquareAttackedByKingHelper(kPos.row, kPos.col, attackerColorOuter, boardCheck);
          };

          const kingStartRow = color === PieceColor.WHITE ? 7 : 0; 
          const kingStartCol = 4; 

          if (!isAttackCheck && !piece.hasMoved && !isKingInCheckExternal(color, currentBoard)) {
            if (row === kingStartRow && col === kingStartCol) { 
              const kingSideRookCol = 7;
              const kingSideRookSquare = currentBoard[row][kingSideRookCol];
              if (kingSideRookSquare.piece && kingSideRookSquare.piece.type === PieceType.ROOK && !kingSideRookSquare.piece.hasMoved) {
                if (!currentBoard[row][col + 1].piece && !currentBoard[row][col + 2].piece) {
                  if (
                    !isSquareAttackedByKingHelper(row, col + 1, opponentColor, currentBoard) &&
                    !isSquareAttackedByKingHelper(row, col + 2, opponentColor, currentBoard)
                  ) {
                    moves.push({ row, col: col + 2 });
                  }
                }
              }

              const queenSideRookCol = 0;
              const queenSideRookSquare = currentBoard[row][queenSideRookCol];
              if (queenSideRookSquare.piece && queenSideRookSquare.piece.type === PieceType.ROOK && !queenSideRookSquare.piece.hasMoved) {
                if (!currentBoard[row][col - 1].piece && !currentBoard[row][col - 2].piece && !currentBoard[row][col - 3].piece) {
                  if (
                    !isSquareAttackedByKingHelper(row, col - 1, opponentColor, currentBoard) &&
                    !isSquareAttackedByKingHelper(row, col - 2, opponentColor, currentBoard)
                  ) {
                    moves.push({ row, col: col - 2 });
                  }
                }
              }
            }
          }
        }
        break;
    }
    return moves;
  };
        
  const isSquareAttackedBy = (checkRow: number, checkCol: number, attackerColor: PieceColor, currentBoard: BoardState): boolean => {
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const piece = currentBoard[r][c].piece;
        if (piece && piece.color === attackerColor) {
          const moves = getPiecePossibleMoves(piece, { row: r, col: c }, currentBoard, true);
          if (moves.some(move => move.row === checkRow && move.col === checkCol)) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const isKingInCheckExternal = (kingColor: PieceColor, currentBoard: BoardState): boolean => {
    const kingPos = findKingPosition(kingColor, currentBoard);
    if (!kingPos) return false;
    const attackerColor = kingColor === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;
    return isSquareAttackedBy(kingPos.row, kingPos.col, attackerColor, currentBoard);
  };

  const generateAllPossibleMovesForPlayer = (playerColor: PieceColor, currentBoard: BoardState): Move[] => {
    const allMoves: Move[] = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const piece = currentBoard[r][c].piece;
        if (piece && piece.color === playerColor) {
          const pieceMoves = getPiecePossibleMoves(piece, { row: r, col: c }, currentBoard, false);
          pieceMoves.forEach(moveTo => allMoves.push({ from: { row: r, col: c }, to: moveTo }));
        }
      }
    }
    return allMoves;
  };

  const updateGameStatus = useCallback((currentBoard: BoardState, forPlayerColor: PieceColor) => {
    const kingIsCurrentlyInCheckValue = isKingInCheckExternal(forPlayerColor, currentBoard);
    const allNextPlayerMoves = generateAllPossibleMovesForPlayer(forPlayerColor, currentBoard);
    const kingPos = findKingPosition(forPlayerColor, currentBoard);
    
    setKingInCheckSquare(kingIsCurrentlyInCheckValue ? kingPos : null);
    setKingAnimatingCheckmateCoords(null);

    const player = forPlayerColor === settings.player1.color ? settings.player1 : settings.player2;
    const opponent = forPlayerColor === settings.player1.color ? settings.player2 : settings.player1;

    if (allNextPlayerMoves.length === 0) {
      if (kingIsCurrentlyInCheckValue) {
        setGameStatus({
          message: `Checkmate! ${opponent.name} (${opponent.color}) wins!`,
          isCheck: true,
          isCheckmate: true,
          isStalemate: false,
          winner: opponent.color,
        });
        playSound(GAME_END_SOUND_DATA_URL);
        setActiveTimerColor(null);
        if (kingPos) {
          setKingAnimatingCheckmateCoords(kingPos);
        }
      } else {
        setGameStatus({
          message: "Stalemate! It's a draw.",
          isCheck: false,
          isCheckmate: false,
          isStalemate: true,
          winner: null,
        });
        playSound(GAME_END_SOUND_DATA_URL);
        setActiveTimerColor(null);
      }
    } else {
      setGameStatus({
        message: `${player.name}'s Turn (${player.color})`,
        isCheck: kingIsCurrentlyInCheckValue,
        isCheckmate: false,
        isStalemate: false,
        winner: null,
      });
      if (kingIsCurrentlyInCheckValue) {
        playSound(CHECK_SOUND_DATA_URL);
      }
    }
  }, [settings.player1, settings.player2]);

  const makeMove = useCallback((from: { row: number; col: number }, to: { row: number; col: number }) => {
    const pieceToMove = boardState[from.row][from.col].piece;
    if (!pieceToMove) return;

    const capturedPieceOriginalSquare = boardState[to.row][to.col];
    const capturedPiece = capturedPieceOriginalSquare.piece;
    let isCapture = !!capturedPiece && capturedPiece.color !== pieceToMove.color;
    let isCastlingMove = false;

    if (isCapture && capturedPiece) {
      if (pieceToMove.color === PieceColor.WHITE) {
        setWhiteCapturedPieces(prev => [...prev, capturedPiece]);
      } else {
        setBlackCapturedPieces(prev => [...prev, capturedPiece]);
      }
      if (capturedPiece.type !== PieceType.KING) {
        setPieceAnimatingCapture({ 
          piece: { ...capturedPiece }, 
          coords: { ...capturedPieceOriginalSquare.coords } 
        });
        setTimeout(() => {
          setPieceAnimatingCapture(null);
        }, CAPTURE_ANIMATION_DURATION_MS);
      }
    }

    const nextBoardState = produce(boardState, draft => {
      const movingPieceRef = draft[from.row][from.col].piece; 
      
      if (movingPieceRef) {
        movingPieceRef.hasMoved = true; 
        draft[to.row][to.col].piece = movingPieceRef;
        draft[from.row][from.col].piece = null;
        
        const kingStartRow = movingPieceRef.color === PieceColor.WHITE ? 7 : 0; 
        const kingStartCol = 4;
        
        if (
          movingPieceRef.type === PieceType.KING &&
          Math.abs(to.col - from.col) === 2 &&
          from.row === kingStartRow && 
          from.col === kingStartCol   
        ) {
          isCastlingMove = true;
          if (isCapture && capturedPiece) {
            isCapture = false;
            if (pieceToMove.color === PieceColor.WHITE) {
              setWhiteCapturedPieces(prev => prev.filter(p => p.id !== capturedPiece.id));
            } else {
              setBlackCapturedPieces(prev => prev.filter(p => p.id !== capturedPiece.id));
            }
            if (pieceAnimatingCapture && pieceAnimatingCapture.piece.id === capturedPiece.id) {
              setPieceAnimatingCapture(null);
            }
          }

          const isKingside = to.col > from.col; 
          const rookStartCol = isKingside ? 7 : 0;
          const rookEndCol = isKingside ? to.col - 1 : to.col + 1; 
          const rookSquare = draft[from.row][rookStartCol]; 

          if (rookSquare.piece && rookSquare.piece.type === PieceType.ROOK) { 
            const newRookPiece = { ...rookSquare.piece, hasMoved: true };
            draft[from.row][rookEndCol].piece = newRookPiece;
            draft[from.row][rookStartCol].piece = null;
          }
        }
      }
    });
    
    if (isCapture) {
      playSound(CAPTURE_SOUND_DATA_URL);
    } else {
      playSound(MOVE_SOUND_DATA_URL);
    }

    if (pieceToMove.type === PieceType.PAWN && !isCastlingMove) {
      if (
        (pieceToMove.color === PieceColor.WHITE && to.row === 0) ||
        (pieceToMove.color === PieceColor.BLACK && to.row === BOARD_SIZE - 1)
      ) {
        setPromotingPawn({ piece: pieceToMove, to });
        setBoardState(nextBoardState);
        setSelectedPieceSquare(null);
        setPossibleMoves([]);
        setActiveTimerColor(null); // Pause timer during promotion
        return;
      }
    }
    
    setBoardState(nextBoardState);
    setSelectedPieceSquare(null);
    setPossibleMoves([]);
    const nextPlayer = currentPlayerColor === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;
    setCurrentPlayerColor(nextPlayer);
    if (settings.timerDurationSeconds !== null) {
      setActiveTimerColor(nextPlayer);
    }
    updateGameStatus(nextBoardState, nextPlayer);

  }, [boardState, currentPlayerColor, updateGameStatus, pieceAnimatingCapture, settings.timerDurationSeconds]);

  const promotePawn = useCallback((promotionType: PieceType) => {
    if (!promotingPawn) return;
    const { piece: originalPawn, to } = promotingPawn;

    const nextBoardState = produce(boardState, draft => {
      if (draft[to.row][to.col].piece) {
        draft[to.row][to.col].piece!.type = promotionType;
      }
    });
    
    playSound(MOVE_SOUND_DATA_URL);

    setBoardState(nextBoardState);
    setPromotingPawn(null);
    setSelectedPieceSquare(null);
    setPossibleMoves([]);
    
    const nextPlayer = originalPawn.color === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;
    setCurrentPlayerColor(nextPlayer);
    if (settings.timerDurationSeconds !== null) {
      setActiveTimerColor(nextPlayer);
    }
    updateGameStatus(nextBoardState, nextPlayer);

  }, [promotingPawn, boardState, updateGameStatus, settings.timerDurationSeconds]);

  const triggerEasterEgg = useCallback(() => {
    playSound(EASTER_EGG_SOUND_DATA_URL);
    setEasterEggFading(true);
    setActiveTimerColor(null); // Pause timer during easter egg
  
    setTimeout(() => {
      const nextBoard = produce(boardState, draft => {
        for (let r = 0; r < BOARD_SIZE; r++) {
          for (let c = 0; c < BOARD_SIZE; c++) {
            const p = draft[r][c].piece;
            if (p && p.type !== PieceType.KING) {
              draft[r][c].piece = null;
            }
          }
        }
      });
      setBoardState(nextBoard);
      setGameStatus({
        message: "✨ Kings' Court! Only royalty remains. ✨",
        isCheck: false,
        isCheckmate: false,
        isStalemate: true,
        winner: null,
      });
      setSelectedPieceSquare(null);
      setPossibleMoves([]);
      setKingInCheckSquare(null);
      setEasterEggFading(false);
      // Do not resume timer for easter egg state
    }, 500);
  }, [boardState]); 

  const handleSquareClick = useCallback((row: number, col: number) => {
    if (gameStatus.isCheckmate || gameStatus.isStalemate || gameStatus.winner || promotingPawn || easterEggFading) return;

    const clickedSquare = boardState[row][col];
    
    if (selectedPieceSquare) {
      if (selectedPieceSquare.coords.row === row && selectedPieceSquare.coords.col === col) {
        setSelectedPieceSquare(null);
        setPossibleMoves([]);
        setEasterEggSequence([]);
      } else if (possibleMoves.some(move => move.row === row && move.col === col)) {
        makeMove(selectedPieceSquare.coords, { row, col });
        setEasterEggSequence([]);
      } else if (clickedSquare.piece && clickedSquare.piece.color === currentPlayerColor) {
        const pieceType = clickedSquare.piece.type;
        const expectedNextType = EASTER_EGG_SEQUENCE[easterEggSequence.length];

        if (pieceType === expectedNextType) {
          const newSequence = [...easterEggSequence, pieceType];
          if (newSequence.length === EASTER_EGG_SEQUENCE.length) {
            triggerEasterEgg();
            setEasterEggSequence([]);
            return;
          } else {
            setEasterEggSequence(newSequence);
          }
        } else if (pieceType === EASTER_EGG_SEQUENCE[0]) {
          setEasterEggSequence([pieceType]);
        } else {
          setEasterEggSequence([]);
        }
        
        const newPossibleMoves = getPiecePossibleMoves(clickedSquare.piece, { row, col }, boardState, false);
        setSelectedPieceSquare(clickedSquare);
        setPossibleMoves(newPossibleMoves);

      } else {
        setSelectedPieceSquare(null);
        setPossibleMoves([]);
        setEasterEggSequence([]);
      }
    } else if (clickedSquare.piece && clickedSquare.piece.color === currentPlayerColor) {
      const pieceType = clickedSquare.piece.type;
      const expectedNextType = EASTER_EGG_SEQUENCE[easterEggSequence.length];

      if (pieceType === expectedNextType) {
        const newSequence = [...easterEggSequence, pieceType];
        if (newSequence.length === EASTER_EGG_SEQUENCE.length) {
          triggerEasterEgg();
          setEasterEggSequence([]);
          return;
        } else {
          setEasterEggSequence(newSequence);
        }
      } else if (pieceType === EASTER_EGG_SEQUENCE[0]) {
        setEasterEggSequence([pieceType]);
      } else {
        setEasterEggSequence([]);
      }
      
      const newPossibleMoves = getPiecePossibleMoves(clickedSquare.piece, { row, col }, boardState, false);
      setSelectedPieceSquare(clickedSquare);
      setPossibleMoves(newPossibleMoves);

    } else {
      setEasterEggSequence([]);
    }
  }, [
    boardState, 
    selectedPieceSquare, 
    possibleMoves, 
    currentPlayerColor, 
    gameStatus, 
    promotingPawn, 
    easterEggFading, 
    easterEggSequence, 
    makeMove, 
    triggerEasterEgg
  ]);
  
  const resetGame = useCallback(() => {
    const newInitialBoard = createInitialBoard();
    setBoardState(newInitialBoard);
    const firstPlayerColor = settings.player1Starts ? settings.player1.color : settings.player2.color;
    setCurrentPlayerColor(firstPlayerColor);
    setSelectedPieceSquare(null);
    setPossibleMoves([]);
    setPromotingPawn(null);
    setKingInCheckSquare(null);
    setEasterEggSequence([]);
    setEasterEggFading(false);
    
    setWhiteTimeLeft(settings.timerDurationSeconds);
    setBlackTimeLeft(settings.timerDurationSeconds);
    if (settings.timerDurationSeconds !== null) {
        setActiveTimerColor(firstPlayerColor);
    } else {
        setActiveTimerColor(null);
    }
    
    updateGameStatus(newInitialBoard, firstPlayerColor); // updateGameStatus will set its own initial message

    setWhiteCapturedPieces([]);
    setBlackCapturedPieces([]);
    setPieceAnimatingCapture(null);
    setKingAnimatingCheckmateCoords(null);
  }, [settings, updateGameStatus]);

  useEffect(() => {
    // This effect ensures activeTimerColor is correctly set if it becomes null during gameplay
    // (e.g. after promotion) but the game is still ongoing and has a timer.
    if (
      settings.timerDurationSeconds !== null &&
      !activeTimerColor &&
      currentPlayerColor && 
      !gameStatus.winner &&
      !gameStatus.isCheckmate &&
      !gameStatus.isStalemate &&
      !promotingPawn && 
      !easterEggFading
    ) {
      setActiveTimerColor(currentPlayerColor);
    }
  }, [
    settings.timerDurationSeconds,
    currentPlayerColor,
    activeTimerColor,
    gameStatus.winner,
    gameStatus.isCheckmate,
    gameStatus.isStalemate,
    promotingPawn,
    easterEggFading
  ]);

  useEffect(() => {
    let intervalId: number | undefined = undefined;

    if (
      settings.timerDurationSeconds !== null && // Only run if timer is enabled for the game
      activeTimerColor &&
      !gameStatus.isCheckmate &&
      !gameStatus.isStalemate &&
      !gameStatus.winner &&
      !promotingPawn &&
      !easterEggFading
    ) {
      intervalId = window.setInterval(() => {
        if (activeTimerColor === PieceColor.WHITE) {
          setWhiteTimeLeft(prevTime => {
            if (prevTime === null) return null; // Should not happen if checks are correct
            if (prevTime <= 1) {
              clearInterval(intervalId);
              const winnerColor = PieceColor.BLACK;
              const winnerPlayer = settings.player1.color === winnerColor ? settings.player1 : settings.player2;
              setGameStatus({
                message: `${winnerPlayer.name} (${winnerColor}) wins by TIMEOUT!`,
                isCheck: false,
                isCheckmate: true, 
                isStalemate: false,
                winner: winnerColor,
              });
              playSound(GAME_END_SOUND_DATA_URL);
              setActiveTimerColor(null);
              const kingPos = findKingPosition(PieceColor.WHITE, boardState);
              if(kingPos) setKingAnimatingCheckmateCoords(kingPos);
              return 0;
            }
            return prevTime - 1;
          });
        } else if (activeTimerColor === PieceColor.BLACK) {
          setBlackTimeLeft(prevTime => {
            if (prevTime === null) return null; // Should not happen
            if (prevTime <= 1) {
              clearInterval(intervalId);
              const winnerColor = PieceColor.WHITE;
              const winnerPlayer = settings.player1.color === winnerColor ? settings.player1 : settings.player2;
              setGameStatus({
                message: `${winnerPlayer.name} (${winnerColor}) wins by timeout!`,
                isCheck: false,
                isCheckmate: true, 
                isStalemate: false,
                winner: winnerColor,
              });
              playSound(GAME_END_SOUND_DATA_URL);
              setActiveTimerColor(null);
              const kingPos = findKingPosition(PieceColor.BLACK, boardState);
              if(kingPos) setKingAnimatingCheckmateCoords(kingPos);
              return 0;
            }
            return prevTime - 1;
          });
        }
      }, 1000);
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [
    settings.timerDurationSeconds,
    activeTimerColor,
    gameStatus.isCheckmate,
    gameStatus.isStalemate,
    gameStatus.winner,
    promotingPawn,
    easterEggFading,
    settings, // settings.player1 and settings.player2 used in timeout
    boardState, // findKingPosition depends on boardState
    // updateGameStatus // Not needed here, game status is set directly
  ]);

  return {
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
  };
};