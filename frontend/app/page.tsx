"use client";

/**
 * Forgery.ai — Landing Page
 *
 * Stunning hero with animated floating orbs, feature cards,
 * stats, how-it-works section, and a sticky footer.
 */

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Shield,
  Zap,
  Eye,
  BarChart3,
  Upload,
  Brain,
  ArrowRight,
  CheckCircle,
  Lock,
  Layers,
} from "lucide-react";

// ── Reusable fade-up variant ───────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay, ease: "easeOut" },
  }),
};

// ── Feature card data ─────────────────────────────────────────────────────
const features = [
  {
    icon: Upload,
    title: "Upload & Detect",
    desc: "Drag-and-drop any JPEG or PNG image. Our pipeline handles everything from preprocessing to result display in seconds.",
    color: "text-cyan-400",
    bg: "from-cyan-500/10 to-cyan-500/5",
    border: "border-cyan-500/20",
  },
  {
    icon: Brain,
    title: "AI Fusion Model",
    desc: "Three lightweight CNNs — MobileNetV3Small, EfficientNetB0, and EfficientNetB3 — fused together for superior accuracy.",
    color: "text-violet-400",
    bg: "from-violet-500/10 to-violet-500/5",
    border: "border-violet-500/20",
  },
  {
    icon: Eye,
    title: "Explainable AI",
    desc: "GradCAM heatmaps visually highlight exactly which regions of the image triggered the forgery detection.",
    color: "text-emerald-400",
    bg: "from-emerald-500/10 to-emerald-500/5",
    border: "border-emerald-500/20",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    desc: "Track your detection history, view accuracy trends, and export detailed PDF reports for each analysis.",
    color: "text-amber-400",
    bg: "from-amber-500/10 to-amber-500/5",
    border: "border-amber-500/20",
  },
  {
    icon: Lock,
    title: "Secure Auth",
    desc: "JWT-secured accounts with role-based access. Admin panel gives full oversight of all users and predictions.",
    color: "text-rose-400",
    bg: "from-rose-500/10 to-rose-500/5",
    border: "border-rose-500/20",
  },
  {
    icon: Layers,
    title: "Production Ready",
    desc: "Fully Dockerized stack with FastAPI backend, Next.js frontend, SQLite/PostgreSQL, and one-click setup.",
    color: "text-sky-400",
    bg: "from-sky-500/10 to-sky-500/5",
    border: "border-sky-500/20",
  },
];

// ── Stats ─────────────────────────────────────────────────────────────────
const stats = [
  { value: "3", label: "AI Models Fused" },
  { value: "~94%", label: "Demo Accuracy" },
  { value: "<2s", label: "Detection Time" },
  { value: "GradCAM", label: "Explainability" },
];

// ── Steps ─────────────────────────────────────────────────────────────────
const steps = [
  { n: "01", title: "Create Account", desc: "Sign up for free in 30 seconds. No credit card required." },
  { n: "02", title: "Upload Image", desc: "Drag-and-drop or click to select any JPEG or PNG up to 10 MB." },
  { n: "03", title: "Get Results", desc: "Receive a confidence score, GradCAM heatmap, and downloadable PDF report instantly." },
];

// ── Component ─────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("forgery_token"));
  }, []);

  return (
    <div className="min-h-screen bg-dark-950 text-white overflow-x-hidden">
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary-500/15 rounded-full blur-[120px] animate-float-orb" />
          <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-secondary-500/15 rounded-full blur-[100px] animate-float-orb-slow" />
          <div className="absolute top-1/2 right-1/3 w-[300px] h-[300px] bg-cyan-400/10 rounded-full blur-[80px] animate-float-orb-med" />
          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          {/* Badge */}
          <motion.div
            initial="hidden"
            animate="show"
            custom={0}
            variants={fadeUp}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/30 text-primary-300 text-sm font-medium mb-8"
          >
            <Zap className="w-4 h-4" />
            AI-Powered Forgery Detection · Demo Mode Available
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial="hidden"
            animate="show"
            custom={0.1}
            variants={fadeUp}
            className="text-5xl md:text-7xl font-bold font-outfit leading-tight mb-6"
          >
            Detect Image Forgery
            <br />
            <span className="gradient-text">with AI Precision</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial="hidden"
            animate="show"
            custom={0.2}
            variants={fadeUp}
            className="text-lg md:text-xl text-dark-300 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            A fusion of three lightweight deep learning models — MobileNetV3, EfficientNetB0, and EfficientNetB3 — working together to identify tampered images with explainable GradCAM heatmaps.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial="hidden"
            animate="show"
            custom={0.3}
            variants={fadeUp}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="group inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-cyan-400 text-white font-semibold text-lg shadow-xl shadow-primary-500/30 hover:shadow-primary-500/50 transition-all duration-300 glow-primary"
              >
                Go to Dashboard
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/signup"
                  className="group inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-cyan-400 text-white font-semibold text-lg shadow-xl shadow-primary-500/30 hover:shadow-primary-500/50 transition-all duration-300"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-semibold text-lg transition-all duration-300"
                >
                  <Shield className="w-5 h-5 text-primary-400" />
                  Live Demo Login
                </Link>
              </>
            )}
          </motion.div>

          {/* Demo hint */}
          <motion.p
            initial="hidden"
            animate="show"
            custom={0.4}
            variants={fadeUp}
            className="mt-5 text-sm text-dark-500"
          >
            Demo credentials: <span className="text-dark-300 font-mono">admin@forgery.ai</span> / <span className="text-dark-300 font-mono">Admin@123</span>
          </motion.p>
        </div>

        {/* Scroll chevron */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-dark-500"
        >
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <div className="w-px h-10 bg-gradient-to-b from-dark-500 to-transparent animate-pulse" />
        </motion.div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <section className="py-16 border-y border-white/5 bg-white/[0.015]">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              custom={i * 0.1}
              variants={fadeUp}
              className="text-center"
            >
              <p className="text-4xl md:text-5xl font-bold font-outfit gradient-text mb-2">{s.value}</p>
              <p className="text-sm text-dark-400 uppercase tracking-wider">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <section className="py-24 max-w-6xl mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold font-outfit mb-4">
            Everything you need to{" "}
            <span className="gradient-text">fight forgery</span>
          </h2>
          <p className="text-dark-400 text-lg max-w-xl mx-auto">
            A complete platform for image authenticity verification — from upload to explainable AI report.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                custom={i * 0.08}
                variants={fadeUp}
                className={`glass-card p-6 border ${f.border} hover:scale-[1.02] transition-transform duration-300 group`}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.bg} flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 ${f.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2 font-outfit">{f.title}</h3>
                <p className="text-dark-400 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────────────── */}
      <section className="py-24 bg-white/[0.015] border-y border-white/5">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold font-outfit mb-4">
              How it <span className="gradient-text">works</span>
            </h2>
            <p className="text-dark-400 text-lg">Three simple steps to detect image manipulation.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.n}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                custom={i * 0.15}
                variants={fadeUp}
                className="relative"
              >
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[calc(100%+1px)] w-full h-px bg-gradient-to-r from-white/10 to-transparent" />
                )}
                <div className="glass-card p-8 text-center h-full">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500/20 to-secondary-500/20 border border-primary-500/20 flex items-center justify-center mx-auto mb-6">
                    <span className="text-2xl font-bold font-outfit gradient-text">{step.n}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3 font-outfit">{step.title}</h3>
                  <p className="text-dark-400 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────────────────── */}
      <section className="py-24 max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
          className="glass-card p-12 border border-primary-500/20 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-secondary-500/5 pointer-events-none" />
          <div className="relative z-10">
            <CheckCircle className="w-12 h-12 text-primary-400 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold font-outfit mb-4">
              Start detecting forgeries <span className="gradient-text">today</span>
            </h2>
            <p className="text-dark-400 mb-8 max-w-lg mx-auto">
              Free to use in demo mode. Train with your own dataset to unlock full accuracy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-cyan-400 text-white font-semibold transition-all duration-300 shadow-lg shadow-primary-500/30"
              >
                Create Free Account <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold transition-all duration-300"
              >
                Demo Login
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-outfit font-bold text-white">Forgery.ai</span>
          </div>
          <p className="text-dark-500 text-sm">
            Built with MobileNetV3 · EfficientNetB0 · EfficientNetB3 · FastAPI · Next.js
          </p>
          <p className="text-dark-600 text-xs">
            &copy; {new Date().getFullYear()} Forgery.ai · Demo Mode
          </p>
        </div>
      </footer>
    </div>
  );
}
