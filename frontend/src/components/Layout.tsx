import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  Search,
  FileText,
  Users,
  Brain,
  Activity,
  Award,
  Settings,
  LogOut,
  Bot,
  ShieldAlert
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  user: any;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Agent Chat', path: '/chat', icon: MessageSquare },
    { label: 'Deep Research', path: '/research', icon: Search },
    { label: 'RAG Documents', path: '/documents', icon: FileText },
    { label: 'AI Agents', path: '/agents', icon: Users },
    { label: 'Memory Store', path: '/memory', icon: Brain },
    { label: 'Observability & Tracing', path: '/tracing', icon: Activity },
    { label: 'Evaluation Metrics', path: '/evaluation', icon: Award },
    { label: 'System Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-darkbg-900 text-slate-100 overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-darkbg-800 border-r border-slate-800 flex flex-col justify-between">
        <div>
          {/* Logo Brand */}
          <div className="p-6 border-b border-slate-800/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-none tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                AgentFlow AI
              </h1>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-blue-400">Enterprise Platform</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Footer Profile */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center font-bold text-sm text-blue-400 border border-slate-600">
                {user?.full_name?.charAt(0) || 'U'}
              </div>
              <div className="truncate">
                <p className="text-sm font-semibold text-slate-200 truncate">{user?.full_name || 'User'}</p>
                <span className="inline-block text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono font-medium capitalize">
                  {user?.role || 'user'}
                </span>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar header */}
        <header className="h-16 border-b border-slate-800 bg-darkbg-800/60 backdrop-blur-md px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-mono text-slate-400">System State: <strong className="text-emerald-400 font-semibold">NOMINAL & OPERATIONAL</strong></span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
            <div className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 flex items-center gap-2">
              <span className="text-slate-500">Router:</span>
              <span className="text-blue-400 font-semibold">Dynamic LLM Engine</span>
            </div>
            <div className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 flex items-center gap-2">
              <span className="text-slate-500">Orchestrator:</span>
              <span className="text-indigo-400 font-semibold">LangGraph Active</span>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
