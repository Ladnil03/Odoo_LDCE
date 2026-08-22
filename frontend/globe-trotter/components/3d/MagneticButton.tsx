"use client";

import React, { useRef, useState } from "react";
import { motion } from "motion/react";

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "amber" | "secondary" | "glass" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
  className?: string;
  glow?: boolean;
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  glow = false,
  onClick,
  disabled,
  ...props
}) => {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!btnRef.current || disabled) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = btnRef.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    const distanceX = (clientX - centerX) * 0.25;
    const distanceY = (clientY - centerY) * 0.25;
    setPosition({ x: distanceX, y: distanceY });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return "bg-[#2C5E3B] hover:bg-[#1E4329] text-white font-semibold shadow-md shadow-[#2C5E3B]/20 border border-[#2C5E3B]";
      case "amber":
        return "bg-[#DD9F2A] hover:bg-[#C58B1E] text-[#222222] font-bold shadow-md shadow-[#DD9F2A]/30 border border-[#DD9F2A]";
      case "secondary":
        return "bg-[#F0EFEA] hover:bg-[#E5E2D8] text-[#222222] font-medium border border-[#E6E4DC] shadow-sm";
      case "glass":
        return "bg-white hover:bg-[#FAF9F6] text-[#222222] border border-[#E6E4DC] shadow-sm";
      case "outline":
        return "bg-transparent hover:bg-[#2C5E3B]/10 text-[#2C5E3B] border border-[#2C5E3B] font-semibold";
      case "danger":
        return "bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200";
      default:
        return "bg-[#2C5E3B] text-white";
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case "sm":
        return "px-3.5 py-1.5 text-xs rounded-xl gap-1.5";
      case "lg":
        return "px-6 py-3 text-base rounded-2xl gap-2.5";
      default:
        return "px-4.5 py-2 text-sm rounded-xl gap-2";
    }
  };

  return (
    <motion.button
      ref={btnRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      whileTap={{ scale: 0.96 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 350, damping: 15 }}
      disabled={disabled}
      onClick={onClick}
      className={`relative inline-flex items-center justify-center font-medium transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${getVariantStyles()} ${getSizeStyles()} ${
        glow ? "relative after:absolute after:-inset-0.5 after:rounded-xl after:bg-[#DD9F2A] after:opacity-30 after:blur-sm after:-z-10 hover:after:opacity-60" : ""
      } ${className}`}
      {...(props as any)}
    >
      {children}
    </motion.button>
  );
};
