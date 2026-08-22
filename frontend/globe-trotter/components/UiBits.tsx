"use client";

import React from "react";
import { motion } from "motion/react";

// ── Generic UI bits used across screens ──

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  loading,
  children,
  className = "",
  disabled,
  ...rest
}) => {
  const base =
    "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const sizes = {
    sm: "px-3 py-1.5 text-[12px]",
    md: "px-4 py-2.5 text-[13px]",
    lg: "px-5 py-3 text-[14px]",
  };
  const variants = {
    primary: "bg-[var(--ink-primary)] text-[var(--surface-page)] hover:bg-[var(--ink-secondary)]",
    ghost: "text-[var(--ink-secondary)] hover:bg-[var(--surface-sunken)]",
    outline:
      "bg-[var(--surface-page)] text-[var(--ink-primary)] hairline hover:bg-[var(--surface-sunken)]",
    danger: "bg-[var(--accent-pop)] text-white hover:bg-[var(--accent-pop)]/90",
  };
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {loading ? (
        <span className="inline-block w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
      ) : null}
      {children}
    </button>
  );
};

export const Card: React.FC<
  React.HTMLAttributes<HTMLDivElement> & { elevated?: boolean }
> = ({ elevated, className = "", children, ...rest }) => (
  <div
    {...rest}
    className={`rounded-2xl bg-[var(--surface-elevated)] hairline ${
      elevated ? "shadow-sm shadow-[var(--ink-primary)]/3" : ""
    } ${className}`}
  >
    {children}
  </div>
);

export const Eyebrow: React.FC<React.HTMLAttributes<HTMLSpanElement>> = ({
  className = "",
  children,
  ...rest
}) => (
  <span
    {...rest}
    className={`eyebrow ${className}`}
  >
    {children}
  </span>
);

export const SectionHeading: React.FC<{
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  action?: React.ReactNode;
}> = ({ eyebrow, title, description, align = "left", action }) => (
  <div
    className={`flex flex-col sm:flex-row sm:items-end justify-between gap-4 ${
      align === "center" ? "sm:flex-col sm:items-center sm:text-center" : ""
    }`}
  >
    <div>
      {eyebrow && <Eyebrow className="block mb-2">{eyebrow}</Eyebrow>}
      <h2 className="display text-[28px] sm:text-[34px] text-[var(--ink-primary)]">{title}</h2>
      {description && (
        <p className="text-[14px] text-[var(--ink-tertiary)] mt-2 max-w-prose">{description}</p>
      )}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

export const Skeleton: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`animate-pulse rounded-lg bg-[var(--surface-sunken)] ${className}`} />
);

export const EmptyState: React.FC<{
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}> = ({ icon, title, description, action }) => (
  <div className="text-center py-16 px-6 rounded-2xl border-2 border-dashed border-[var(--border-default)]">
    {icon && <div className="mx-auto w-12 h-12 rounded-full bg-[var(--surface-sunken)] flex items-center justify-center mb-4 text-[var(--ink-tertiary)]">{icon}</div>}
    <h3 className="text-[16px] font-semibold text-[var(--ink-primary)]">{title}</h3>
    {description && <p className="text-[13px] text-[var(--ink-tertiary)] mt-2 max-w-sm mx-auto">{description}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export const Tag: React.FC<{ children: React.ReactNode; tone?: "default" | "accent" }> = ({
  children,
  tone = "default",
}) => (
  <span
    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
      tone === "accent"
        ? "bg-[var(--accent-pop-soft)] text-[var(--accent-pop)]"
        : "bg-[var(--surface-sunken)] text-[var(--ink-secondary)] hairline"
    }`}
  >
    {children}
  </span>
);

export const Avatar: React.FC<{
  src?: string | null;
  name?: string;
  size?: number;
}> = ({ src, name, size = 32 }) => {
  const text = name ?? "";
  return (
    <div
      className="rounded-full overflow-hidden bg-[var(--surface-sunken)] hairline flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={text} className="w-full h-full object-cover" />
      ) : (
        <span
          className="font-semibold text-[var(--ink-secondary)]"
          style={{ fontSize: size * 0.35 }}
        >
          {(text.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase()).join("")) || "?"}
        </span>
      )}
    </div>
  );
};

export const Reveal: React.FC<{ children: React.ReactNode; delay?: number }> = ({
  children,
  delay = 0,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay, ease: [0.2, 0.7, 0.2, 1] }}
  >
    {children}
  </motion.div>
);

export const StatPill: React.FC<{
  label: string;
  value: string | number;
  tone?: "default" | "positive" | "warning";
}> = ({ label, value, tone = "default" }) => {
  const colors = {
    default: "text-[var(--ink-primary)]",
    positive: "text-[var(--accent-positive)]",
    warning: "text-[var(--accent-warning)]",
  };
  return (
    <div className="flex flex-col">
      <span className="eyebrow mb-1">{label}</span>
      <span className={`text-[22px] font-semibold tracking-tight ${colors[tone]}`}>{value}</span>
    </div>
  );
};
