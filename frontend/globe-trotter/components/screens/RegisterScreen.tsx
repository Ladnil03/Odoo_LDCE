"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { useApp } from "@/context/AppContext";
import { Button, Eyebrow } from "@/components/UiBits";
import { Compass, Mail, Lock, User, ArrowRight } from "lucide-react";

export const RegisterScreen: React.FC = () => {
  const { signup, navigateTo, showToast } = useApp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !password) {
      showToast("Missing details", "All fields are required.", "warning");
      return;
    }
    if (password.length < 8) {
      showToast("Password too short", "Use at least 8 characters.", "warning");
      return;
    }
    setSubmitting(true);
    const ok = await signup(email.trim(), password, name.trim());
    setSubmitting(false);
    if (ok) navigateTo("home");
  }

  return (
    <div className="min-h-[calc(100vh-64px)] grid grid-cols-1 lg:grid-cols-2 paper">
      <div className="hidden lg:flex flex-col justify-between p-12 hairline-r">
        <div>
          <Eyebrow className="block">Join GlobeTrotter</Eyebrow>
          <h1 className="display text-[64px] mt-4 leading-[0.95]">
            Start with<br />
            one trip.<br />
            <em className="font-serif italic font-normal">See where it goes.</em>
          </h1>
          <p className="text-[15px] text-[var(--ink-secondary)] mt-6 max-w-md leading-relaxed">
            Create an account to plan, share, and revisit your trips. No ads, no infinite scroll — just a quiet workspace for the journeys you're planning.
          </p>
        </div>
        <ul className="text-[13px] text-[var(--ink-secondary)] space-y-2 max-w-sm">
          <li className="flex gap-2">
            <span className="text-[var(--accent-pop)]">·</span>
            Multi-city itineraries with budget tracking
          </li>
          <li className="flex gap-2">
            <span className="text-[var(--accent-pop)]">·</span>
            Publish to a small community of real travellers
          </li>
          <li className="flex gap-2">
            <span className="text-[var(--accent-pop)]">·</span>
            Admin tools for moderators and platform leads
          </li>
        </ul>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <motion.form
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          onSubmit={submit}
          className="w-full max-w-sm"
        >
          <div className="flex items-center gap-2 mb-6 lg:hidden">
            <span className="w-8 h-8 rounded-lg bg-[var(--ink-primary)] flex items-center justify-center">
              <Compass className="w-4 h-4 text-[var(--surface-page)]" />
            </span>
            <span className="font-semibold text-[15px]">GlobeTrotter</span>
          </div>

          <Eyebrow className="block mb-2">Create account</Eyebrow>
          <h2 className="display text-[32px] mb-8">A small first step.</h2>

          <label className="block mb-4">
            <span className="text-[12px] font-medium text-[var(--ink-secondary)] block mb-1.5">
              Full name
            </span>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ink-tertiary)]" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Aarav Shah"
                className="w-full pl-10"
              />
            </div>
          </label>

          <label className="block mb-4">
            <span className="text-[12px] font-medium text-[var(--ink-secondary)] block mb-1.5">
              Email
            </span>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ink-tertiary)]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full pl-10"
              />
            </div>
          </label>

          <label className="block mb-6">
            <span className="text-[12px] font-medium text-[var(--ink-secondary)] block mb-1.5">
              Password (8+ chars)
            </span>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ink-tertiary)]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full pl-10"
              />
            </div>
          </label>

          <Button type="submit" loading={submitting} className="w-full" size="lg">
            Create account <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.4} />
          </Button>

          <p className="text-[13px] text-[var(--ink-tertiary)] text-center mt-6">
            Already a member?{" "}
            <button
              type="button"
              onClick={() => navigateTo("login")}
              className="text-[var(--ink-primary)] font-medium underline underline-offset-2"
            >
              Sign in
            </button>
          </p>
        </motion.form>
      </div>
    </div>
  );
};
