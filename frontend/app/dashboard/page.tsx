"use client";

/**
 * Main dashboard overview page.
 * Shows: personalised greeting, stats cards, activity chart,
 * detection ratio donut, and recent prediction table.
 */

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Image as ImageIcon, Upload, TrendingUp } from "lucide-react";

import StatsCards from "@/components/charts/StatsCards";
import ActivityChart from "@/components/charts/ActivityChart";
import DonutChart from "@/components/charts/DonutChart";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import { imagesApi, adminApi } from "@/lib/api";
import { formatConfidence, formatDate } from "@/lib/utils";

// ── Fade-up animation helper ──────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay, ease: "easeOut" },
  }),
};

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();

  const [history, setHistory] = useState<any[]>([]);
  const [chartData, setChartData] = useState<{ date: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await imagesApi.getHistory(1, 5);
      const rows: any[] = res.data.data || [];
      setHistory(rows);

      // Build chart data from history dates
      const counts: Record<string, number> = {};
      rows.forEach((r) => {
        const d = new Date(r.created_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
        counts[d] = (counts[d] || 0) + 1;
      });
      setChartData(Object.entries(counts).map(([date, count]) => ({ date, count })));

      // If admin, fetch system-wide analytics for richer chart
      if (isAdmin) {
        try {
          const analytics = await adminApi.getAnalytics();
          if (analytics.data.predictions_by_day?.length > 0) {
            setChartData(analytics.data.predictions_by_day);
          }
        } catch {
          /* non-fatal */
        }
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const total = history.length;
  const authentic = history.filter((h) => h.result === "authentic").length;
  const forged = history.filter((h) => h.result === "forged").length;

  return (
    <div className="flex flex-col gap-6">
      {/* ── Greeting ───────────────────────────────────────────────────── */}
      <motion.div
        initial="hidden"
        animate="show"
        custom={0}
        variants={fadeUp}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold font-outfit tracking-tight">
            Welcome back,{" "}
            <span className="gradient-text">{user?.username ?? "User"}</span> 👋
          </h1>
          <p className="text-dark-400 mt-1">
            Here's an overview of your recent image forgery detections.
          </p>
        </div>
        <Button
          id="quick-upload-btn"
          onClick={() => router.push("/dashboard/upload")}
          className="hidden sm:flex shadow-[0_0_20px_rgba(6,182,212,0.3)] items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Quick Upload
        </Button>
      </motion.div>

      {/* ── Stats ──────────────────────────────────────────────────────── */}
      <motion.div initial="hidden" animate="show" custom={0.1} variants={fadeUp}>
        <StatsCards total={total} authentic={authentic} forged={forged} />
      </motion.div>

      {/* ── Charts ─────────────────────────────────────────────────────── */}
      <motion.div
        initial="hidden"
        animate="show"
        custom={0.2}
        variants={fadeUp}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <Card
          title="Detection Activity"
          subtitle="Predictions over time"
          className="lg:col-span-2 border-white/5"
        >
          {loading ? (
            <div className="flex justify-center py-10">
              <Spinner size="lg" className="text-primary-500" />
            </div>
          ) : chartData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-dark-500">
              <TrendingUp className="w-10 h-10 mb-2" />
              <p className="text-sm">No activity yet. Upload an image to start!</p>
            </div>
          ) : (
            <ActivityChart data={chartData} />
          )}
        </Card>

        <Card title="Result Ratio" subtitle="Authentic vs Forged" className="border-white/5">
          <DonutChart authentic={authentic} forged={forged} />
        </Card>
      </motion.div>

      {/* ── Recent Predictions ─────────────────────────────────────────── */}
      <motion.div initial="hidden" animate="show" custom={0.3} variants={fadeUp}>
        <Card
          title="Recent Predictions"
          className="border-white/5"
          actions={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard/history")}
              className="text-primary-400 flex items-center gap-1"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Button>
          }
        >
          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner size="lg" className="text-primary-500" />
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12 flex flex-col items-center text-dark-400">
              <ImageIcon className="w-14 h-14 mb-4 text-dark-700" />
              <p className="font-medium">No predictions yet</p>
              <p className="text-sm mt-1">
                Upload your first image to start detecting forgeries.
              </p>
              <Button
                className="mt-4"
                size="sm"
                onClick={() => router.push("/dashboard/upload")}
              >
                <Upload className="w-4 h-4 mr-2" /> Upload Image
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-6 -mb-6">
              <table className="w-full text-left text-sm text-dark-300">
                <thead className="text-xs uppercase bg-dark-900/70 text-dark-400">
                  <tr>
                    <th className="px-6 py-3">Filename</th>
                    <th className="px-6 py-3">Result</th>
                    <th className="px-6 py-3">Confidence</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item) => (
                    <tr
                      key={item.id}
                      className="border-t border-white/[0.04] hover:bg-white/[0.03] transition-colors"
                    >
                      <td className="px-6 py-3 font-medium text-white truncate max-w-[200px]">
                        {item.original_filename}
                      </td>
                      <td className="px-6 py-3">
                        <Badge
                          variant={item.result === "authentic" ? "success" : "danger"}
                        >
                          {item.result.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-6 py-3 text-white font-mono">
                        {formatConfidence(item.confidence)}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap">
                        {formatDate(item.created_at)}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push("/dashboard/history")}
                        >
                          Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
