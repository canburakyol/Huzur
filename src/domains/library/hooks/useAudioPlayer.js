import { useCallback, useEffect, useRef, useState } from 'react';

export function useAudioPlayer() {
  const [playingIndex, setPlayingIndex] = useState(null);
  const audioRef = useRef(null);
  const currentAudioUrlRef = useRef(null);

  const stopAudio = useCallback(() => {
    const currentAudio = audioRef.current;
    if (!currentAudio) {
      currentAudioUrlRef.current = null;
      return;
    }

    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio.onended = null;
    currentAudio.onerror = null;

    audioRef.current = null;
    currentAudioUrlRef.current = null;
  }, []);

  const stopSpeech = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const stopAll = useCallback(() => {
    stopAudio();
    stopSpeech();
    setPlayingIndex(null);
  }, [stopAudio, stopSpeech]);

  const toggleAudio = useCallback((url, index, event) => {
    event?.stopPropagation?.();

    if (!url) {
      return;
    }

    stopSpeech();

    const currentAudio = audioRef.current;
    const isSameTrack = currentAudioUrlRef.current === url;

    if (isSameTrack && currentAudio && !currentAudio.paused) {
      currentAudio.pause();
      setPlayingIndex(null);
      return;
    }

    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    const nextAudio = new Audio(url);

    nextAudio.onended = () => {
      if (audioRef.current === nextAudio) {
        audioRef.current = null;
        currentAudioUrlRef.current = null;
      }
      setPlayingIndex(null);
    };

    nextAudio.onerror = () => {
      if (audioRef.current === nextAudio) {
        audioRef.current = null;
        currentAudioUrlRef.current = null;
      }
      setPlayingIndex(null);
    };

    audioRef.current = nextAudio;
    currentAudioUrlRef.current = url;
    setPlayingIndex(index);

    nextAudio.play().catch((error) => {
      console.error('[Library] Audio play error:', error);
      if (audioRef.current === nextAudio) {
        audioRef.current = null;
        currentAudioUrlRef.current = null;
      }
      setPlayingIndex(null);
    });
  }, [stopSpeech]);

  const speakArabic = useCallback((text, index, event, { onNotSupported } = {}) => {
    event?.stopPropagation?.();

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      onNotSupported?.();
      return;
    }

    stopAudio();
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ar';
    utterance.rate = 0.5;
    utterance.volume = 1;

    utterance.onend = () => setPlayingIndex(null);
    utterance.onerror = () => setPlayingIndex(null);

    setPlayingIndex(index);

    window.setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 100);
  }, [stopAudio]);

  useEffect(() => {
    return () => {
      stopAll();
    };
  }, [stopAll]);

  return {
    playingIndex,
    toggleAudio,
    speakArabic,
    stopAll
  };
}

export default useAudioPlayer;
