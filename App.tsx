
import React, { useState, useCallback } from 'react';
import HomeScreen from './components/HomeScreen';
import GameScreen from './components/GameScreen';
import { Player, PieceColor, GameSettings } from './types';

enum Screen {
  Home,
  Game,
}

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.Home);
  const [gameSettings, setGameSettings] = useState<GameSettings | null>(null);

  const handleStartGame = useCallback((settings: GameSettings) => {
    setGameSettings(settings);
    setCurrentScreen(Screen.Game);
  }, []);

  const handleGoHome = useCallback(() => {
    setCurrentScreen(Screen.Home);
    setGameSettings(null);
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4">
      {/* Header removed for a cleaner look */}
      {currentScreen === Screen.Home && gameSettings === null && (
        <HomeScreen onStartGame={handleStartGame} />
      )}
      {currentScreen === Screen.Game && gameSettings && (
        <GameScreen settings={gameSettings} onGoHome={handleGoHome} />
      )}
    </div>
  );
};

export default App;