const express = require('express');
const { google } = require('googleapis');

const router = express.Router();

// Endpoint: GET /api/analytics-data
router.get('/data', async (req, res) => {
  try {
    // Configure a GoogleAuth client using your service account credentials.
    const auth = new google.auth.GoogleAuth({
      keyFile: 'path/to/your-service-account-file.json', // Update with your key file path
      scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
    });

    const authClient = await auth.getClient();
    google.options({ auth: authClient });

    // Replace with your Google Analytics View ID.
    const VIEW_ID = 'YOUR_VIEW_ID';

    // Call the Analytics Reporting API
    const analyticsreporting = google.analyticsreporting('v4');
    const response = await analyticsreporting.reports.batchGet({
      requestBody: {
        reportRequests: [
          {
            viewId: VIEW_ID,
            dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
            metrics: [{ expression: 'ga:sessions' }],
            dimensions: [{ name: 'ga:date' }],
          },
        ],
      },
    });

    // Process the API response to match the chart format: [ ['Date', 'Sessions'], ... ]
    const report = response.data.reports[0];
    const rows = report.data.rows || [];
    const formattedData = [['Date', 'Sessions']];

    rows.forEach((row) => {
      const dateStr = row.dimensions[0]; // Format is YYYYMMDD
      // Convert date string to a more readable format (YYYY-MM-DD)
      const formattedDate = `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
      const sessions = parseInt(row.metrics[0].values[0], 10);
      formattedData.push([formattedDate, sessions]);
    });

    res.json(formattedData);
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

module.exports = router;
