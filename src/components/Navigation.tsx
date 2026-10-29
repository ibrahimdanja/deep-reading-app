import React from 'react';
import { Home, Compass, BookOpen, Sparkles, BarChart2 } from 'lucide-react';

export type NavTab = 'home' | 'read' | 'library' | 'reviews' | 'stats';

interface NavigationProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  dueCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  dueCount
}) => {
  const tabs = [
    { id: 'home' as NavTab, label: 'Home', icon: Home },
    { id: 'read' as NavTab, label: 'Read', icon: Compass },
    { id: 'library' as NavTab, label: 'Library', icon: BookOpen },
    { id: 'reviews' as NavTab, label: 'Reviews', icon: Sparkles, badge: dueCount },
    { id: 'stats' as NavTab, label: 'Stats', icon: BarChart2 }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-[var(--panel)]/95 backdrop-blur-lg border-t border-[var(--hairline)] pb-safe transition-colors">
      <div className="max-w-2xl mx-auto flex items-center justify-around px-2 py-1.5">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex-1 flex flex-col items-center justify-center py-1 px-1 relative transition-all duration-200 group cursor-pointer"
            >
              {/* M3 Active pill background indicator */}
              <div
                className={`relative px-4 py-1 rounded-full transition-all duration-200 ${
                  isActive
                    ? 'bg-[var(--amber-dim)] text-[var(--amber)]'
                    : 'text-[var(--muted)] group-hover:text-[var(--text-soft)]'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />

                {/* Badge for due reviews */}
                {tab.badge && tab.badge > 0 ? (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.2 bg-[var(--amber)] text-black text-[10px] font-bold rounded-full min-w-[16px] text-center shadow-sm">
                    {tab.badge}
                  </span>
                ) : null}
              </div>

              {/* Label */}
              <span
                className={`text-[11px] mt-0.5 tracking-tight font-medium transition-colors ${
                  isActive
                    ? 'text-[var(--amber)] font-bold'
                    : 'text-[var(--muted)]'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
