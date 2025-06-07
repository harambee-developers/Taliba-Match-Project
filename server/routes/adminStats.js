const express = require("express");
const router = express.Router();

const Report = require("../model/Report");
const Match = require("../model/Match");
const Payment = require("../model/Payment");
const Subscription = require("../model/Subscription");
const Feedback = require("../model/Feedback");

router.get("/stats", async (req, res) => {
  try {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const [
      totalReports,
      recentReports,
      totalMatches,
      successfulMatches,
      blockedMatches,
      totalRevenueAgg,
      monthlyRevenueAgg,
      activeSubscriptions,
      canceledSubscriptions,
      freeUsers,
    ] = await Promise.all([
      Report.countDocuments(),
      Report.countDocuments({ created_at: { $gte: oneMonthAgo } }),
      Match.countDocuments(),
      Match.countDocuments({ match_status: "Interested" }),
      Match.countDocuments({ match_status: "Blocked" }),
      Payment.aggregate([
        { $match: { status: "Completed" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Payment.aggregate([
        {
          $match: {
            status: "Completed",
            payment_date: { $gte: oneMonthAgo },
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Subscription.countDocuments({ status_type: "active" }),
      Subscription.countDocuments({ status_type: "canceled" }),
      Subscription.countDocuments({ subscription_type: "free" }),
    ]);

    const revenueByMonth = await Payment.aggregate([
        {
          $match: {
            status: "Completed",
            payment_date: {
              $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)),
            },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$payment_date" },
              month: { $month: "$payment_date" },
            },
            total: { $sum: "$amount" },
          },
        },
        {
          $sort: {
            "_id.year": 1,
            "_id.month": 1,
          },
        },
      ]);
      
      // Format for frontend
      const formattedRevenueTimeline = revenueByMonth.map((entry) => {
        const date = new Date(entry._id.year, entry._id.month - 1);
        const label = date.toLocaleString("default", { month: "short", year: "numeric" });
        return { month: label, revenue: entry.total };
      });
    
      const subscriptionBreakdown = await Subscription.aggregate([
        {
          $group: {
            _id: "$subscription_type",
            count: { $sum: 1 },
          },
        },
      ]);
      
      // Format data for frontend
      const formattedSubscriptions = ["free", "gold", "platinum"].map((type) => {
        const found = subscriptionBreakdown.find((entry) => entry._id === type);
        return {
          type,
          count: found ? found.count : 0,
        };
      });

    res.json({
      totalReports,
      recentReports,
      totalMatches,
      successfulMatches,
      blockedMatches,
      totalRevenue: totalRevenueAgg[0]?.total || 0,
      monthlyRevenue: monthlyRevenueAgg[0]?.total || 0,
      activeSubscriptions,
      canceledSubscriptions,
      freeUsers,
      revenueTimeline: formattedRevenueTimeline,
      subscriptionBreakdown: formattedSubscriptions,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch admin stats" });
  }
});

router.get("/reports", async (req, res) => {
  try {
    const reports = await Report.find()
      .sort({ created_at: -1 })
      .limit(50)
      .populate("reporter_id", "userName")
      .populate("reported_id", "userName");

    const formatted = reports.map((r) => ({
      _id: r._id,
      reporter: r.reporter_id,
      reported: r.reported_id,
      reason: r.reason,
      created_at: r.created_at,
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

router.get("/feedback", async (req, res) => {
    try {
      const feedbacks = await Feedback.find()
        .sort({ submitted_at: -1 })
        .populate("user_id", "userName email");
  
      res.json(
        feedbacks.map((fb) => ({
          _id: fb._id,
          user: fb.user_id,
          message: fb.message,
          submitted_at: fb.submitted_at,
        }))
      );
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch feedback" });
    }
  });

module.exports = router;
