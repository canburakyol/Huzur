const {
  onCall,
  HttpsError,
  secureCallableOptions,
} = require('../common/runtime');

/**
 * ============================================================
 * ANALYTICS STATS (DAU/MAU)
 * ============================================================
 */

// GA4 Property ID - Replace with your actual property ID
const GA4_PROPERTY_ID = '123456789';

/**
 * Get DAU/MAU statistics from Google Analytics Data API
 * Returns daily active users and monthly active users
 */
exports.getAnalyticsStats = onCall(
  secureCallableOptions({ maxInstances: 2 }),
  async (request) => {
    if (!request.auth?.token?.admin) {
      throw new HttpsError(
        'permission-denied',
        'Bu islem icin admin yetkisi gerekiyor.'
      );
    }

    // Import Google Analytics Data API client lazily
    const { BetaAnalyticsDataClient } = require('@google-analytics/data');
    
    // Initialize client with default credentials (from service account)
    const analyticsDataClient = new BetaAnalyticsDataClient();
    
    try {
      // Get DAU (Daily Active Users) - last 1 day
      const [dauResponse] = await analyticsDataClient.runReport({
        property: `properties/${GA4_PROPERTY_ID}`,
        dateRanges: [
          {
            startDate: 'today',
            endDate: 'today',
          },
        ],
        metrics: [
          {
            name: 'activeUsers',
          },
        ],
      });
      
      const dau = dauResponse.rows?.length > 0 
        ? parseInt(dauResponse.rows[0].metricValues[0].value, 10) 
        : 0;

      // Get previous day DAU for comparison
      const [prevDauResponse] = await analyticsDataClient.runReport({
        property: `properties/${GA4_PROPERTY_ID}`,
        dateRanges: [
          {
            startDate: '1dayAgo',
            endDate: '1dayAgo',
          },
        ],
        metrics: [
          {
            name: 'activeUsers',
          },
        ],
      });
      
      const prevDau = prevDauResponse.rows?.length > 0 
        ? parseInt(prevDauResponse.rows[0].metricValues[0].value, 10) 
        : 0;

      // Calculate DAU change percentage
      const dauChange = prevDau > 0 
        ? Math.round(((dau - prevDau) / prevDau) * 100 * 10) / 10
        : 0;

      // Get MAU (Monthly Active Users) - last 30 days
      const [mauResponse] = await analyticsDataClient.runReport({
        property: `properties/${GA4_PROPERTY_ID}`,
        dateRanges: [
          {
            startDate: '30daysAgo',
            endDate: 'today',
          },
        ],
        metrics: [
          {
            name: 'activeUsers',
          },
        ],
      });
      
      const mau = mauResponse.rows?.length > 0 
        ? parseInt(mauResponse.rows[0].metricValues[0].value, 10) 
        : 0;

      // Get previous month MAU for comparison (31-60 days ago)
      const [prevMauResponse] = await analyticsDataClient.runReport({
        property: `properties/${GA4_PROPERTY_ID}`,
        dateRanges: [
          {
            startDate: '60daysAgo',
            endDate: '31daysAgo',
          },
        ],
        metrics: [
          {
            name: 'activeUsers',
          },
        ],
      });
      
      const prevMau = prevMauResponse.rows?.length > 0 
        ? parseInt(prevMauResponse.rows[0].metricValues[0].value, 10) 
        : 0;

      // Calculate MAU change percentage
      const mauChange = prevMau > 0 
        ? Math.round(((mau - prevMau) / prevMau) * 100 * 10) / 10
        : 0;

      return {
        dau,
        mau,
        dauChange,
        mauChange,
        date: new Date().toISOString().split('T')[0],
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[getAnalyticsStats] Error:', error.message);
      throw new HttpsError(
        'internal',
        'Analytics verileri alinirken bir hata olustu.',
        { error: error.message }
      );
    }
  }
);
