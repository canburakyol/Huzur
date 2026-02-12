import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Trophy, 
  Target, 
  Flame, 
  Clock, 
  CheckCircle2,
  Plus,
  Minus,
  ChevronLeft
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { challengesService } from '../services/challengesService';
import { useGamification } from '../hooks/useGamification';
import './WeeklyChallenges.css';

// Challenge categories with icons and colors
const CHALLENGE_CATEGORIES = {
  prayer: { icon: '🕌', color: '#22c55e' },
  dhikr: { icon: '📿', color: '#d4af37' },
  quran: { icon: '📖', color: '#3b82f6' },
  fasting: { icon: '🌙', color: '#8b5cf6' },
  charity: { icon: '🤲', color: '#f97316' },
  community: { icon: '👥', color: '#ec4899' }
};

const UNIT_KEY_MAP = {
  'cüz': 'juz',
  rekat: 'rakat',
  tesbih: 'tasbih',
  gün: 'day',
  hatim: 'khatm'
};

// Format time remaining
const formatTimeRemaining = (targetDate, t) => {
  const now = new Date();
  const diff = targetDate - now;
  
  if (diff <= 0) return t('weeklyChallenges.timer.zero', '00:00:00');
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) {
    return t('weeklyChallenges.timer.daysHours', {
      days,
      hours,
      defaultValue: '{{days}}d {{hours}}h'
    });
  }
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
};

export function WeeklyChallenges({ onBack }) {
  const { t } = useTranslation();
  const [challenges, setChallenges] = useState([]);
  const [stats, setStats] = useState({ completed: 0, total: 0, streak: 0 });
  const [timeRemaining, setTimeRemaining] = useState('');
  const [completedChallenge, setCompletedChallenge] = useState(null);
  const { addXP } = useGamification();

  // Load challenges
  useEffect(() => {
    let mounted = true;
    
    const loadChallenges = async () => {
      const data = await challengesService.getWeeklyChallenges();
      const statsData = await challengesService.getStats();
      
      if (mounted) {
        setChallenges(data);
        setStats(statsData);
      }
    };
    
    loadChallenges();
    
    return () => { mounted = false; };
  }, []);

  // Update countdown timer
  useEffect(() => {
    const updateTimer = () => {
      const nextMonday = challengesService.getNextMonday();
      setTimeRemaining(formatTimeRemaining(nextMonday, t));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [t]);

  // Handle progress update
  const handleProgress = useCallback(async (challengeId, increment) => {
    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge || challenge.completed) return;

    const newProgress = Math.max(0, Math.min(challenge.target, challenge.progress + increment));
    
    const updatedChallenges = challenges.map(c => 
      c.id === challengeId ? { ...c, progress: newProgress } : c
    );
    setChallenges(updatedChallenges);

    // Save to service
    await challengesService.updateProgress(challengeId, newProgress);

    // Check if completed
    if (newProgress >= challenge.target && challenge.progress < challenge.target) {
      setCompletedChallenge(challenge);
      addXP(challenge.reward.xp);
      
      // Update stats
      setStats(prev => ({
        ...prev,
        completed: prev.completed + 1
      }));

      // Hide modal after 3 seconds
      setTimeout(() => {
        setCompletedChallenge(null);
      }, 3000);
    }
  }, [challenges, addXP]);

  // Complete challenge in one click
  const handleComplete = useCallback(async (challengeId) => {
    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge || challenge.completed) return;

    const updatedChallenges = challenges.map(c => 
      c.id === challengeId ? { ...c, progress: c.target, completed: true } : c
    );
    setChallenges(updatedChallenges);

    await challengesService.completeChallenge(challengeId);
    
    setCompletedChallenge(challenge);
    addXP(challenge.reward.xp);

    setStats(prev => ({
      ...prev,
      completed: prev.completed + 1
    }));

    setTimeout(() => {
      setCompletedChallenge(null);
    }, 3000);
  }, [challenges, addXP]);

  // Calculate progress percentage
  const getProgressPercentage = useCallback((challenge) => {
    return Math.min(100, (challenge.progress / challenge.target) * 100);
  }, []);

  // Memoized sorted challenges
  const sortedChallenges = useMemo(() => {
    return [...challenges].sort((a, b) => {
      // Completed challenges at the bottom
      if (a.completed && !b.completed) return 1;
      if (!a.completed && b.completed) return -1;
      // Then by category
      return a.category.localeCompare(b.category);
    });
  }, [challenges]);

  const mapChallenge = useCallback((challenge) => {
    const title = t(`weeklyChallenges.challengeTitles.${challenge.id}`, challenge.title);
    const description = t(`weeklyChallenges.challengeDescriptions.${challenge.id}`, challenge.description);
    const unitKey = UNIT_KEY_MAP[challenge.unit] || challenge.unit;
    const unit = t(`weeklyChallenges.units.${unitKey}`, challenge.unit);
    return {
      ...challenge,
      title,
      description,
      unit
    };
  }, [t]);

  const localizedChallenges = useMemo(
    () => sortedChallenges.map(mapChallenge),
    [sortedChallenges, mapChallenge]
  );

  return (
    <div className="weekly-challenges-container">
      {/* Header */}
      <div className="challenges-header">
        <button className="back-btn" onClick={onBack}>
          <ChevronLeft size={24} />
        </button>
        <div className="header-content">
          <h1>{t('weeklyChallenges.title', 'Haftalık Meydan Okumalar')}</h1>
          <p>{t('weeklyChallenges.subtitle', 'Bu haftaki hedeflerini tamamla, ödülleri topla!')}</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="challenges-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <Target size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.completed}/{stats.total}</span>
            <span className="stat-label">{t('weeklyChallenges.stats.completed', 'Tamamlanan')}</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <Trophy size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{Math.round((stats.completed / Math.max(1, stats.total)) * 100)}%</span>
            <span className="stat-label">{t('weeklyChallenges.stats.success', 'Başarı')}</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <Flame size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.streak}</span>
            <span className="stat-label">{t('weeklyChallenges.stats.weekStreak', 'Hafta Serisi')}</span>
          </div>
        </div>
      </div>

      {/* Countdown Timer */}
      <div className="challenges-countdown">
        <Clock size={20} />
        <div className="countdown-info">
          <span className="countdown-label">{t('weeklyChallenges.newChallenges', 'Yeni Meydan Okumalar')}</span>
          <span className="countdown-value">{timeRemaining}</span>
        </div>
      </div>

      {/* Challenges List */}
      <div className="challenges-list">
        {localizedChallenges.map((challenge) => (
          <div 
            key={challenge.id}
            className={`challenge-card ${challenge.completed ? 'completed' : ''}`}
          >
            <div className="challenge-header">
              <div 
                className="challenge-icon"
                style={{ 
                  backgroundColor: `${CHALLENGE_CATEGORIES[challenge.category]?.color}20`,
                  color: CHALLENGE_CATEGORIES[challenge.category]?.color
                }}
              >
                {CHALLENGE_CATEGORIES[challenge.category]?.icon}
              </div>
              
              <div className="challenge-info">
                <h3>{challenge.title}</h3>
                <p>{challenge.description}</p>
              </div>

              <div className="challenge-reward">
                <Trophy size={14} />
                {t('weeklyChallenges.rewardXp', { xp: challenge.reward.xp, defaultValue: '+{{xp}} XP' })}
              </div>
            </div>

            {/* Progress Section */}
            <div className="challenge-progress">
              <div className="progress-header">
                <span className="progress-text">
                  {challenge.completed
                    ? t('weeklyChallenges.completedLabel', 'Tamamlandı!')
                    : t('weeklyChallenges.progressText', {
                        progress: challenge.progress,
                        target: challenge.target,
                        unit: challenge.unit,
                        defaultValue: '{{progress}} / {{target}} {{unit}}'
                      })}
                </span>
                <span className="progress-percentage">
                  {Math.round(getProgressPercentage(challenge))}%
                </span>
              </div>

              <div className="progress-bar-container">
                <div 
                  className="progress-bar"
                  style={{ 
                    width: `${getProgressPercentage(challenge)}%`,
                    backgroundColor: challenge.completed ? '#22c55e' : CHALLENGE_CATEGORIES[challenge.category]?.color
                  }}
                />
              </div>

              {/* Progress Actions */}
              {!challenge.completed ? (
                <div className="progress-actions">
                  <button 
                    className="progress-btn"
                    onClick={() => handleProgress(challenge.id, -1)}
                    disabled={challenge.progress <= 0}
                  >
                    <Minus size={16} />
                  </button>
                  
                  <button 
                    className="progress-btn"
                    onClick={() => handleProgress(challenge.id, 1)}
                    disabled={challenge.progress >= challenge.target}
                  >
                    <Plus size={16} />
                  </button>

                  <button 
                    className="progress-btn complete"
                    onClick={() => handleComplete(challenge.id)}
                  >
                    <CheckCircle2 size={16} />
                    {t('weeklyChallenges.completeAction', 'Tamamla')}
                  </button>
                </div>
              ) : (
                <div className="completed-badge">
                  <CheckCircle2 size={16} />
                  {t('weeklyChallenges.congratsShort', 'Tebrikler!')}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Completion Modal */}
      {completedChallenge && (
        <div className="challenge-completed-modal">
          <div className="modal-content">
            <div className="modal-icon">🎉</div>
            <h2>{t('weeklyChallenges.modal.title', 'Meydan Okuma Tamamlandı!')}</h2>
            <p>{t(`weeklyChallenges.challengeTitles.${completedChallenge.id}`, completedChallenge.title)}</p>
            
            <div className="reward-display">
              <Trophy size={24} />
              <span>{t('weeklyChallenges.modal.reward', { xp: completedChallenge.reward.xp, defaultValue: '+{{xp}} XP Kazandın!' })}</span>
            </div>

            <button 
              className="modal-close-btn"
              onClick={() => setCompletedChallenge(null)}
            >
              {t('weeklyChallenges.modal.cta', 'Harika!')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default WeeklyChallenges;
