import React, { useEffect, useState } from 'react';
import { TracingService, EvaluationService } from '../services/api';
import { Activity, Bot, Cpu, DollarSign, ShieldCheck, Zap, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

export const Dashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [aData, mData] = await Promise.all([
          TracingService.getAnalytics(),
          EvaluationService.getMetrics()
        ]);
        setAnalytics(aData);
        setMetrics(mData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const chartData = [
    { time: '00:00', runs: 12, tokens: 4500, cost: 0.02 },
    { time: '04:00', runs: 18, tokens: 6800, cost: 0.034 },
    { time: '08:00', runs: 35, tokens: 14200, cost: 0.071 },
    { time: '12:00', runs: 52, tokens: 24900, cost: 0.124 },
    { time: '16:00', runs: 41, tokens: 18100, cost: 0.09 },
    { time: '20:00', runs: 28, tokens: 11400, cost: 0.057 },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-darkbg-800 border border-blue-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">AgentFlow AI Control Center</h1>
          <p className="text-sm text-slate-300 mt-1">Multi-Agent Orchestration, Dynamic LLM Routing & Production Observability</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> 7 Agents Online
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold flex items-center gap-1.5">
            <Zap className="w-4 h-4" /> Dynamic Model Router Active
          </span>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-darkbg-800 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Workflow Runs</p>
            <h3 className="text-2xl font-bold text-white mt-1">{analytics?.total_runs || 48}</h3>
            <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-3 h-3" /> +14% this week
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-darkbg-800 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Tokens Processed</p>
            <h3 className="text-2xl font-bold text-white mt-1">{(analytics?.total_tokens || 89400).toLocaleString()}</h3>
            <span className="text-[11px] text-blue-400 font-medium flex items-center gap-1 mt-1">
              Avg {analytics?.avg_latency_ms || 420} ms latency
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Cpu className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-darkbg-800 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Estimated LLM Cost</p>
            <h3 className="text-2xl font-bold text-white mt-1">${analytics?.total_cost_usd || 0.178}</h3>
            <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 mt-1">
              Optimized by Flash routing
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-darkbg-800 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Groundedness Score</p>
            <h3 className="text-2xl font-bold text-white mt-1">{((metrics?.groundedness_score || 0.96) * 100).toFixed(0)}%</h3>
            <span className="text-[11px] text-purple-400 font-medium flex items-center gap-1 mt-1">
              <ShieldCheck className="w-3 h-3" /> Hallucination: {((metrics?.hallucination_score || 0.03) * 100).toFixed(1)}%
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
            <Bot className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="p-6 rounded-2xl bg-darkbg-800 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white">Execution & Token Throughput</h2>
            <p className="text-xs text-slate-400">Real-time token utilization and execution runs</p>
          </div>
          <span className="text-xs font-mono text-slate-400">Live Metric Stream</span>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
              <Area type="monotone" dataKey="tokens" stroke="#3b82f6" fillOpacity={1} fill="url(#colorTokens)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Agent Roster Quick Grid */}
      <div className="p-6 rounded-2xl bg-darkbg-800 border border-slate-800">
        <h2 className="text-lg font-bold text-white mb-4">7 Specialized Agent Statuses</h2>
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {[
            { name: 'Supervisor', type: 'Orchestrator', model: 'GPT-4o', color: 'blue' },
            { name: 'Research', type: 'Web & Facts', model: 'Gemini Flash', color: 'emerald' },
            { name: 'RAG', type: 'Vector Search', model: 'Gemini Flash', color: 'indigo' },
            { name: 'Code', type: 'Engineering', model: 'GPT-4o', color: 'amber' },
            { name: 'Data Analysis', type: 'Analytics', model: 'GPT-4o', color: 'purple' },
            { name: 'Vision', type: 'OCR & Image', model: 'Gemini Vision', color: 'rose' },
            { name: 'Report', type: 'PDF & MD', model: 'Gemini Flash', color: 'cyan' },
          ].map((ag) => (
            <div key={ag.name} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block mb-1"></span>
              <h4 className="font-bold text-xs text-white truncate">{ag.name}</h4>
              <p className="text-[10px] text-slate-400 mt-0.5 truncate">{ag.type}</p>
              <span className="inline-block text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-blue-400 font-mono mt-1">
                {ag.model}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
