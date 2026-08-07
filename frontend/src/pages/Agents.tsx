import React, { useEffect, useState } from 'react';
import { AgentService } from '../services/api';
import { Agent } from '../types';
import { Bot, Cpu, Sparkles, CheckCircle2, Shield, Wrench } from 'lucide-react';

export const AgentsPage: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const data = await AgentService.listAgents();
        setAgents(data);
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
          <h1 className="text-xl font-extrabold text-white">Agent Registry & Capability Manifest</h1>
          <p className="text-xs text-slate-400 mt-1">7 Autonomous AI Agents with Specialized System Prompts and Tool Associations</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
          <Bot className="w-5 h-5" />
        </div>
      </div>

      {/* Agents Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {agents.map((ag) => (
          <div key={ag.id} className="p-6 rounded-2xl bg-darkbg-800 border border-slate-800 hover:border-blue-500/30 transition flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold shadow-md">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">{ag.name}</h3>
                    <span className="text-[10px] font-mono text-blue-400 uppercase tracking-wider">{ag.agent_type}</span>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-blue-400 text-xs font-mono font-semibold">
                  {ag.default_model}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mb-4">{ag.description}</p>

              {/* System Prompt snippet */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400">
                <span className="text-slate-500 block mb-1 font-semibold uppercase text-[9px]">System Directive:</span>
                "{ag.system_prompt}"
              </div>
            </div>

            {/* Capabilities badges */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-mono text-[10px]">Capabilities:</span>
              <div className="flex flex-wrap gap-1.5">
                {Object.keys(ag.capabilities_json || {}).map((cap) => (
                  <span key={cap} className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] font-mono border border-blue-500/20">
                    {cap}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
