import React, { useEffect, useState } from 'react';
import { TracingService } from '../services/api';
import { RunTrace } from '../types';
import { Activity, Clock, Cpu, DollarSign, Terminal, ChevronDown, ChevronRight, CheckCircle, AlertTriangle } from 'lucide-react';

export const TracingPage: React.FC = () => {
  const [runs, setRuns] = useState<RunTrace[]>([]);
  const [expandedRunId, setExpandedRunId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await TracingService.getRuns();
        setRuns(data);
        if (data.length > 0) setExpandedRunId(data[0].id);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-6 rounded-2xl bg-darkbg-800 border border-slate-800 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white">Observability & Step Execution Tracer</h1>
          <p className="text-xs text-slate-400 mt-1">Granular insight into agent paths, tool calls, token usage, latency (ms), and cost ($USD)</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
          <Activity className="w-5 h-5" />
        </div>
      </div>

      {/* Traces List */}
      <div className="space-y-4 font-mono">
        {runs.map((run) => {
          const isExpanded = expandedRunId === run.id;
          const agentPath = run.agent_path_json?.path || ['supervisor'];

          return (
            <div key={run.id} className="rounded-2xl bg-darkbg-800 border border-slate-800 overflow-hidden">
              {/* Header summary row */}
              <div
                onClick={() => setExpandedRunId(isExpanded ? null : run.id)}
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/50 transition"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-blue-400" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                  <span className={`w-2.5 h-2.5 rounded-full ${run.status === 'completed' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                  <div>
                    <h4 className="font-bold text-xs text-white truncate max-w-md">{run.task_description}</h4>
                    <span className="text-[10px] text-slate-400">Run ID: {run.id.slice(0, 8)}...</span>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-xs">
                  <div className="text-right">
                    <span className="text-slate-400 block text-[10px]">Agent Path</span>
                    <span className="text-emerald-400 font-semibold text-[11px]">{agentPath.join(' → ')}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-slate-400 block text-[10px]">Tokens / Cost</span>
                    <span className="text-blue-400 font-semibold">{run.total_tokens} tokens (${run.total_cost.toFixed(5)})</span>
                  </div>

                  <div className="text-right">
                    <span className="text-slate-400 block text-[10px]">Duration</span>
                    <span className="text-indigo-400 font-semibold">{run.duration_ms} ms</span>
                  </div>
                </div>
              </div>

              {/* Tool Calls Drawer */}
              {isExpanded && (
                <div className="p-4 border-t border-slate-800 bg-slate-900/80 space-y-3">
                  <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tool Execution Call Log ({run.tool_calls.length} calls)</h5>
                  {run.tool_calls.map((tc) => (
                    <div key={tc.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-2">
                      <div className="flex items-center justify-between text-blue-400">
                        <span className="font-bold flex items-center gap-1.5">
                          <Terminal className="w-3.5 h-3.5" /> Tool: {tc.tool_name}
                        </span>
                        <span className="text-slate-400 text-[11px]">{tc.latency_ms} ms latency</span>
                      </div>

                      <div className="text-[11px] font-mono text-slate-300 bg-slate-950 p-2 rounded border border-slate-800/80 whitespace-pre-wrap">
                        {tc.output_result}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
