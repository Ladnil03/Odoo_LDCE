"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { useApp } from "@/context/AppContext";
import { Button, Eyebrow } from "@/components/UiBits";
import { Compass, Mail, Lock, ArrowRight } from "lucide-react";

export const LoginScreen: React.FC = () => {
  const { login, navigateTo, showToast, bootstrapMessage } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      showToast("Missing details", "Please enter both email and password.", "warning");
      return;
    }
    setSubmitting(true);
    const ok = await login(email.trim(), password);
    setSubmitting(false);
    if (ok) navigateTo("home");
  }

  function fillDemo(role: "user" | "admin") {
    if (role === "admin") {
      setEmail("admin@globetrotter.io");
      setPassword("admin12345");
    } else {
      setEmail("demo@globetrotter.io");
      setPassword("demo12345");
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] grid grid-cols-1 lg:grid-cols-2 paper">
      {/* Editorial left panel */}
      <div className="hidden lg:flex flex-col justify-between p-12 hairline-r">
        <div>
          <Eyebrow className="block">Welcome back</Eyebrow>
          <h1 className="display text-[64px] mt-4 leading-[0.95]">
            Plan trips<br />
            you actually<br />
            <em className="font-serif italic font-normal">take.</em>
          </h1>
          <p className="text-[15px] text-[var(--ink-secondary)] mt-6 max-w-md leading-relaxed">
            GlobeTrotter is a quieter planning tool for multi-city travel — real budgets, real itineraries, and a small community of travellers who share what worked.
          </p>
        </div>

        <div className="space-y-3 max-w-sm">
          <div className="rounded-xl hairline bg-[var(--surface-elevated)] p-4">
            <p className="text-[13px] font-medium">Demo traveller</p>
            <p className="text-[12px] text-[var(--ink-tertiary)] mt-0.5">demo@globetrotter.io · demo12345</p>
          </div>
          <div className="rounded-xl hairline bg-[var(--surface-elevated)] p-4">
            <p className="text-[13px] font-medium">Demo admin</p>
            <p className="text-[12px] text-[var(--ink-tertiary)] mt-0.5">admin@globetrotter.io · admin12345</p>
          </div>
          {bootstrapMessage && (
            <p className="text-[11px] text-[var(--ink-tertiary)] mt-2">{bootstrapMessage}</p>
          )}
        </div>
      </div>

      {/* Form */}
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

          <Eyebrow className="block mb-2">Sign in</Eyebrow>
          <h2 className="display text-[32px] mb-8">Hello again.</h2>

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
              Password
            </span>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ink-tertiary)]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10"
              />
            </div>
          </label>

          <Button type="submit" loading={submitting} className="w-full" size="lg">
            Sign in <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.4} />
          </Button>

          <div className="flex items-center gap-2 my-5">
            <div className="flex-1 h-px bg-[var(--border-default)]" />
            <span className="text-[11px] text-[var(--ink-tertiary)] uppercase tracking-widest">
              or try a demo
            </span>
            <div className="flex-1 h-px bg-[var(--border-default)]" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button type="button" variant="outline" onClick={() => fillDemo("user")}>
              Demo traveller
            </Button>
            <Button type="button" variant="outline" onClick={() => fillDemo("admin")}>
              Demo admin
            </Button>
          </div>

          <p className="text-[13px] text-[var(--ink-tertiary)] text-center mt-6">
            New here?{" "}
            <button
              type="button"
              onClick={() => navigateTo("register")}
              className="text-[var(--ink-primary)] font-medium underline underline-offset-2"
            >
              Create an account
            </button>
          </p>
        </motion.form>
      </div>
    </div>
  );
};
