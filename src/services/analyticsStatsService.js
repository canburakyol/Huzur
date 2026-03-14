import { httpsCallable } from 'firebase/functions';
import { getFunctionsInstance } from './firebase';
import { logger } from '../utils/logger';

/**
 * Analytics Stats Service
 * Fetches DAU/MAU data from Cloud Function
 */
class AnalyticsStatsService {
  constructor() {
    this.cache = null;
    this.cacheTimestamp = null;
    this.cacheTimeoutMs = 5 * 60 * 1000; // 5 minutes cache
  }

  /**
   * Get Firebase Functions instance
   */
  async getFunctions() {
    return getFunctionsInstance();
  }

  /**
   * Get cached stats or fetch fresh data
   */
  async getStats(forceRefresh = false) {
    const now = Date.now();

    // Return cached data if valid
    if (!forceRefresh && this.cache && this.cacheTimestamp) {
      if (now - this.cacheTimestamp < this.cacheTimeoutMs) {
        logger.log('[AnalyticsStats] Returning cached data');
        return this.cache;
      }
    }

    // Fetch fresh data
    return this.fetchStats();
  }

  /**
   * Fetch DAU/MAU from Cloud Function
   */
  async fetchStats() {
    try {
      const functions = await this.getFunctions();
      const getAnalyticsStats = httpsCallable(functions, 'getAnalyticsStats');
      
      const result = await getAnalyticsStats();
      
      const data = result.data;
      
      // Update cache
      this.cache = data;
      this.cacheTimestamp = Date.now();
      
      logger.log('[AnalyticsStats] Fetched fresh data:', data);
      
      return data;
    } catch (error) {
      logger.error('[AnalyticsStats] Error fetching stats:', error);
      
      // Return cached data if available
      if (this.cache) {
        logger.log('[AnalyticsStats] Returning stale cache due to error');
        return this.cache;
      }
      
      throw error;
    }
  }

  /**
   * Get DAU (Daily Active Users)
   */
  async getDAU() {
    const stats = await this.getStats();
    return stats?.dau || 0;
  }

  /**
   * Get MAU (Monthly Active Users)
   */
  async getMAU() {
    const stats = await this.getStats();
    return stats?.mau || 0;
  }

  /**
   * Get DAU change percentage
   */
  async getDAUChange() {
    const stats = await this.getStats();
    return stats?.dauChange || 0;
  }

  /**
   * Get MAU change percentage
   */
  async getMAUChange() {
    const stats = await this.getStats();
    return stats?.mauChange || 0;
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache = null;
    this.cacheTimestamp = null;
    logger.log('[AnalyticsStats] Cache cleared');
  }
}

// Export singleton instance
export const analyticsStatsService = new AnalyticsStatsService();

// Export convenience methods
export const getAnalyticsStats = () => analyticsStatsService.getStats();
export const getDAU = () => analyticsStatsService.getDAU();
export const getMAU = () => analyticsStatsService.getMAU();
export const getDAUChange = () => analyticsStatsService.getDAUChange();
export const getMAUChange = () => analyticsStatsService.getMAUChange();
export const refreshAnalyticsStats = () => analyticsStatsService.getStats(true);
export const clearAnalyticsStatsCache = () => analyticsStatsService.clearCache();
