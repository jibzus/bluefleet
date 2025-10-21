const stats = [
  { label: "Active Vessels", value: "500+", icon: "🚢" },
  { label: "Search Speed", value: "<1s", icon: "⚡" },
  { label: "Platform Uptime", value: "99.9%", icon: "✅" },
  { label: "Verified Operators", value: "200+", icon: "👥" },
];

export function StatsBar() {
  return (
    <div className="mt-16 grid grid-cols-2 gap-6 sm:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="slide-up text-center transition-transform duration-300 hover:translate-y-[-4px]"
        >
          <div className="mb-2 text-3xl" aria-hidden>
            {stat.icon}
          </div>
          <div className="text-3xl font-bold">{stat.value}</div>
          <div className="text-sm text-muted-foreground">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
