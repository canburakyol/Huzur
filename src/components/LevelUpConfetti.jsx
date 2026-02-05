import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useGamification } from '../context/GamificationContext';
import './LevelUpConfetti.css';

const LevelUpConfetti = () => {
  const { level, showLevelUp, setShowLevelUp } = useGamification();

  useEffect(() => {
    if (showLevelUp) {
      // Fire confetti
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

      const randomInRange = (min, max) => Math.random() * (max - min) + min;

      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        // since particles fall down, start a bit higher than random
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
      }, 250);
      
      // Auto close after duration + delay
      const timer = setTimeout(() => {
          setShowLevelUp(false);
      }, 5000);
      
      return () => {
          clearInterval(interval);
          clearTimeout(timer);
      };
    }
  }, [showLevelUp, setShowLevelUp]);

  if (!showLevelUp) return null;

  return (
    <div className="level-up-overlay" onClick={() => setShowLevelUp(false)}>
      <div className="level-up-content animate-bounce-in">
        <div className="level-up-shine"></div>
        <div className="level-up-header">
            TEBRİKLER!
        </div>
        <div className="level-up-badge">
            <span className="level-number">{level.id}</span>
        </div>
        <div className="level-up-title">
            {level.title}
        </div>
        <div className="level-up-subtitle">
            Yeni Seviyeye Ulaştınız!
        </div>
      </div>
    </div>
  );
};

export default LevelUpConfetti;
