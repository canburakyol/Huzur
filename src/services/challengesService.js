import { getWeeklyChallenges, updateChallengeProgress, completeChallenge } from '../data/gamificationData';

// Storage keys
const STORAGE_KEYS = {
  CHALLENGES: 'weekly_challenges',
  LAST_RESET: 'challenges_last_reset',
  WEEKLY_STREAK: 'weekly_challenge_streak',
  COMPLETED_WEEKS: 'completed_challenge_weeks'
};

/**
 * Weekly Challenges Service
 * Manages weekly challenges, progress tracking, and rewards
 */
class ChallengesService {
  constructor() {
    this.initialized = false;
  }

  /**
   * Initialize challenges for the current week
   */
  async initialize() {
    if (this.initialized) return;

    const lastReset = localStorage.getItem(STORAGE_KEYS.LAST_RESET);
    const currentWeekStart = this.getWeekStart();

    // Check if we need to reset for a new week
    if (!lastReset || new Date(lastReset) < currentWeekStart) {
      await this.resetWeeklyChallenges();
    }

    this.initialized = true;
  }

  /**
   * Get the start of the current week (Monday)
   */
  getWeekStart() {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  }

  /**
   * Get next Monday for countdown
   */
  getNextMonday() {
    const now = new Date();
    const day = now.getDay();
    const daysUntilMonday = day === 0 ? 1 : 8 - day;
    const nextMonday = new Date(now);
    nextMonday.setDate(now.getDate() + daysUntilMonday);
    nextMonday.setHours(0, 0, 0, 0);
    return nextMonday;
  }

  /**
   * Reset challenges for a new week
   */
  async resetWeeklyChallenges() {
    // Check if all challenges were completed last week
    const lastWeekChallenges = await this.getStoredChallenges();
    const allCompleted = lastWeekChallenges.length > 0 && 
      lastWeekChallenges.every(c => c.completed);

    // Update streak
    if (allCompleted) {
      const currentStreak = parseInt(localStorage.getItem(STORAGE_KEYS.WEEKLY_STREAK) || '0');
      localStorage.setItem(STORAGE_KEYS.WEEKLY_STREAK, (currentStreak + 1).toString());
      
      // Track completed weeks
      const completedWeeks = JSON.parse(localStorage.getItem(STORAGE_KEYS.COMPLETED_WEEKS) || '[]');
      completedWeeks.push(new Date().toISOString());
      localStorage.setItem(STORAGE_KEYS.COMPLETED_WEEKS, JSON.stringify(completedWeeks));
    } else if (lastWeekChallenges.length > 0) {
      // Reset streak if not all completed
      localStorage.setItem(STORAGE_KEYS.WEEKLY_STREAK, '0');
    }

    // Generate new challenges
    const newChallenges = getWeeklyChallenges();
    
    // Store with timestamps
    const challengesWithMeta = newChallenges.map(challenge => ({
      ...challenge,
      progress: 0,
      completed: false,
      createdAt: new Date().toISOString()
    }));

    localStorage.setItem(STORAGE_KEYS.CHALLENGES, JSON.stringify(challengesWithMeta));
    localStorage.setItem(STORAGE_KEYS.LAST_RESET, new Date().toISOString());

    return challengesWithMeta;
  }

  /**
   * Get stored challenges
   */
  async getStoredChallenges() {
    await this.initialize();
    const stored = localStorage.getItem(STORAGE_KEYS.CHALLENGES);
    return stored ? JSON.parse(stored) : [];
  }

  /**
   * Get current week's challenges
   */
  async getWeeklyChallenges() {
    return this.getStoredChallenges();
  }

  /**
   * Update challenge progress
   */
  async updateProgress(challengeId, progress) {
    const challenges = await this.getStoredChallenges();
    const challenge = challenges.find(c => c.id === challengeId);
    
    if (!challenge) return null;

    challenge.progress = Math.max(0, Math.min(challenge.target, progress));
    
    // Auto-complete if target reached
    if (challenge.progress >= challenge.target && !challenge.completed) {
      challenge.completed = true;
      challenge.completedAt = new Date().toISOString();
    }

    localStorage.setItem(STORAGE_KEYS.CHALLENGES, JSON.stringify(challenges));
    
    // Also update in gamification data
    updateChallengeProgress(challengeId, challenge.progress);

    return challenge;
  }

  /**
   * Mark challenge as complete
   */
  async completeChallenge(challengeId) {
    const challenges = await this.getStoredChallenges();
    const challenge = challenges.find(c => c.id === challengeId);
    
    if (!challenge || challenge.completed) return null;

    challenge.progress = challenge.target;
    challenge.completed = true;
    challenge.completedAt = new Date().toISOString();

    localStorage.setItem(STORAGE_KEYS.CHALLENGES, JSON.stringify(challenges));
    
    // Update in gamification data
    completeChallenge(challengeId);

    return challenge;
  }

  /**
   * Get challenge statistics
   */
  async getStats() {
    await this.initialize();
    const challenges = await this.getStoredChallenges();
    
    const completed = challenges.filter(c => c.completed).length;
    const total = challenges.length;
    const streak = parseInt(localStorage.getItem(STORAGE_KEYS.WEEKLY_STREAK) || '0');

    return {
      completed,
      total,
      streak,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }

  /**
   * Get challenge by ID
   */
  async getChallengeById(challengeId) {
    const challenges = await this.getStoredChallenges();
    return challenges.find(c => c.id === challengeId);
  }

  /**
   * Check if all challenges are completed
   */
  async areAllChallengesCompleted() {
    const challenges = await this.getStoredChallenges();
    return challenges.length > 0 && challenges.every(c => c.completed);
  }

  /**
   * Get total XP from completed challenges
   */
  async getTotalXPFromChallenges() {
    const challenges = await this.getStoredChallenges();
    return challenges
      .filter(c => c.completed)
      .reduce((total, c) => total + (c.reward?.xp || 0), 0);
  }

  /**
   * Force reset challenges (for testing)
   */
  async forceReset() {
    localStorage.removeItem(STORAGE_KEYS.LAST_RESET);
    localStorage.removeItem(STORAGE_KEYS.CHALLENGES);
    this.initialized = false;
    return this.resetWeeklyChallenges();
  }

  /**
   * Get challenge history
   */
  async getHistory() {
    const completedWeeks = JSON.parse(localStorage.getItem(STORAGE_KEYS.COMPLETED_WEEKS) || '[]');
    return completedWeeks.map(date => new Date(date));
  }
}

// Export singleton instance
export const challengesService = new ChallengesService();