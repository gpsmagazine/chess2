// utils/audioUtils.ts

// Cooldown period in milliseconds to prevent sounds from playing too frequently
const SOUND_COOLDOWN_MS = 50;
let lastSoundPlayTime: Record<string, number> = {};

/**
 * Plays a sound from a data URL.
 * Includes a cooldown mechanism to prevent rapid re-triggering of the same sound.
 * @param soundDataUrl The base64 encoded data URL of the sound to play.
 */
export const playSound = (soundDataUrl: string) => {
  const now = Date.now();
  if (lastSoundPlayTime[soundDataUrl] && now - lastSoundPlayTime[soundDataUrl] < SOUND_COOLDOWN_MS) {
    return; // Sound is on cooldown
  }
  lastSoundPlayTime[soundDataUrl] = now;

  try {
    const audio = new Audio(soundDataUrl);
    audio.play().catch(error => {
      // Autoplay policy might block it if user hasn't interacted yet,
      // or other errors. Gracefully fail.
      console.warn("Failed to play sound:", error);
    });
  } catch (error) {
    console.error("Error creating audio element for sound:", error);
  }
};
