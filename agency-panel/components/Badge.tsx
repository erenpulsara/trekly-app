"use client";

import type { BookingStatus, Difficulty, TourStatus } from "@/lib/types";

type BadgeVariant =
  | Difficulty
  | BookingStatus
  | TourStatus
  | "neutral"
  | "info";

const variantClasses: Record<BadgeVariant, string> = {
  // Difficulty
  easy: "bg-difficulty-easy-bg text-difficulty-easy-text",
  medium: "bg-difficulty-medium-bg text-difficulty-medium-text",
  hard: "bg-difficulty-hard-bg text-difficulty-hard-text",
  extreme: "bg-difficulty-extreme-bg text-difficulty-extreme-text",
  // Booking status
  pending: "bg-status-pending-bg text-status-pending-text",
  confirmed: "bg-status-confirmed-bg text-status-confirmed-text",
  completed: "bg-status-completed-bg text-status-completed-text",
  cancelled: "bg-status-cancelled-bg text-status-cancelled-text",
  // Tour status
  draft: "bg-status-draft-bg text-status-draft-text",
  published: "bg-status-published-bg text-status-published-text",
  // Generic
  neutral: "bg-gray-100 text-gray-600",
  info: "bg-blue-50 text-blue-700",
};

const variantDots: Record<BadgeVariant, string> = {
  easy: "bg-emerald-500",
  medium: "bg-amber-500",
  hard: "bg-orange-500",
  extreme: "bg-red-500",
  pending: "bg-amber-500",
  confirmed: "bg-blue-500",
  completed: "bg-emerald-500",
  cancelled: "bg-red-500",
  draft: "bg-gray-400",
  published: "bg-emerald-500",
  neutral: "bg-gray-400",
  info: "bg-blue-500",
};

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  showDot?: boolean;
  className?: string;
}

export default function Badge({
  variant,
  children,
  showDot = false,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold font-body tracking-wide uppercase ${variantClasses[variant]} ${className}`}
    >
      {showDot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${variantDots[variant]} flex-shrink-0`}
        />
      )}
      {children}
    </span>
  );
}
