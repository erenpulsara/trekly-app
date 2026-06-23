"use client";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  delay?: number;
}

export default function StatCard({
  label,
  value,
  icon,
  trend,
  trendUp,
  delay = 0,
}: StatCardProps) {
  return (
    <div
      className="bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 animate-slide-up"
      style={{ animationDelay: `${delay}ms`, animationFillMode: "both" }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-text-secondary font-body uppercase tracking-wider">
            {label}
          </p>
          <p className="mt-2 text-4xl font-display font-bold text-text-primary tracking-tight">
            {value}
          </p>
          {trend && (
            <p
              className={`mt-2 text-xs font-semibold font-body ${trendUp ? "text-emerald-600" : "text-red-500"}`}
            >
              {trendUp ? "↑" : "↓"} {trend}
            </p>
          )}
        </div>
        <div className="w-12 h-12 rounded-2xl bg-brand-orange/10 flex items-center justify-center text-brand-orange flex-shrink-0">
          {icon}
        </div>
      </div>
    </div>
  );
}
