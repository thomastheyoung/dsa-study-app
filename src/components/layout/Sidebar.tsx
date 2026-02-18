import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronDown, Home, Menu, TrendingUp, Zap, X } from 'lucide-react';
import { topicsByCategory } from '../../content';

const categoryColors = {
  'data-structures': {
    text: 'text-ds',
    bg: 'bg-ds-dim',
    border: 'border-ds/30',
    dot: 'bg-ds',
  },
  algorithms: {
    text: 'text-algo',
    bg: 'bg-algo-dim',
    border: 'border-algo/30',
    dot: 'bg-algo',
  },
  techniques: {
    text: 'text-tech',
    bg: 'bg-tech-dim',
    border: 'border-tech/30',
    dot: 'bg-tech',
  },
} as const;

export function Sidebar() {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleCategory = (cat: string) => {
    setCollapsed((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-slate-200">
        <NavLink
          to="/"
          className="flex items-center gap-2 text-lg font-semibold text-slate-800 hover:text-slate-900 transition-colors"
          onClick={() => setMobileOpen(false)}
        >
          <Home size={20} />
          DSA Study Guide
        </NavLink>
      </div>

      <nav aria-label="Main navigation" className="flex-1 overflow-y-auto p-3 space-y-1">
        <ul role="list" className="space-y-1">
          <li>
            <NavLink
              to="/big-o"
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-bigo-dim text-bigo'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                }`
              }
            >
              <TrendingUp size={16} />
              Big O Notation
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/flash-cards"
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-quiz-dim text-quiz'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                }`
              }
            >
              <Zap size={16} />
              Flash Cards
            </NavLink>
          </li>
        </ul>

        <hr className="border-slate-200 my-2" />

        {topicsByCategory.map((group) => {
          const colors = categoryColors[group.category];
          const isCollapsed = collapsed[group.category];

          return (
            <div key={group.category}>
              <button
                onClick={() => toggleCategory(group.category)}
                aria-expanded={!isCollapsed}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium ${colors.text} hover:${colors.bg} transition-colors`}
              >
                {group.label}
                <ChevronDown
                  size={16}
                  className={`transition-transform ${isCollapsed ? '-rotate-90' : ''}`}
                />
              </button>

              {!isCollapsed && (
                <ul role="list" className="ml-2 mt-0.5 space-y-0.5">
                  {group.topics.map((topic) => (
                    <li key={topic.id}>
                      <NavLink
                        to={`/topic/${topic.id}`}
                        onClick={() => setMobileOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                            isActive
                              ? `${colors.bg} ${colors.text} font-medium`
                              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                          }`
                        }
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${colors.dot} shrink-0`}
                        />
                        {topic.title}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-expanded={mobileOpen}
        aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-white/80 backdrop-blur text-slate-600 hover:text-slate-900 shadow-sm"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 bg-white/80 backdrop-blur-xl border-r border-slate-200 transition-transform lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
