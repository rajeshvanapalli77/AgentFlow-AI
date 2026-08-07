import React, { useEffect, useState } from 'react';
import { SettingsService } from '../services/api';
import { Settings, Cpu, Key, Shield, Zap, Check } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<any>({});
  const [strategy, setStrategy] = useState('dynamic');
  const [geminiKey, setGeminiKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await SettingsService.getSettings();
        setSettings(data);
        if (data.default_strategy) setStrategy(data.default_strategy);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await SettingsService.updateSetting('default_strategy', strategy);
      if (geminiKey) await SettingsService.updateSetting('gemini_api_key', geminiKey);
      if (openaiKey) await SettingsService.updateSetting('openai_api_key', openaiKey);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Banner */}
      <div className="p-6 rounded-2xl bg-darkbg-800 border border-slate-800 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white">System Settings & LLM Provider API Keys</h1>
          <p className="text-xs text-slate-400 mt-1">Configure Model Router strategies, LLM provider secrets, and security defaults</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
          <Settings className="w-5 h-5" />
        </div>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4" /> Settings saved successfully!
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Model Router Strategy */}
        <div className="p-6 rounded-2xl bg-darkbg-800 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-400" /> Dynamic Model Router Strategy
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { id: 'dynamic', title: 'Dynamic Heuristic', desc: 'Routes Flash for speed, GPT-4o for complex reasoning, Vision for images.' },
              { id: 'speed', title: 'Speed & Cost Optimized', desc: 'Prioritizes Gemini Flash & local Ollama for low cost & fast latency.' },
              { id: 'quality', title: 'Quality Optimized', desc: 'Prioritizes GPT-4o for maximum reasoning accuracy.' }
            ].map((opt) => (
              <label
                key={opt.id}
                onClick={() => setStrategy(opt.id)}
                className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                  strategy === opt.id
                    ? 'bg-blue-600/15 border-blue-500 text-white'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div>
                  <h4 className="font-bold text-xs mb-1 text-white">{opt.title}</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{opt.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Provider API Keys */}
        <div className="p-6 rounded-2xl bg-darkbg-800 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Key className="w-4 h-4 text-blue-400" /> Provider API Keys & Endpoint Secrets
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Google Gemini API Key</label>
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">OpenAI API Key</label>
              <input
                type="password"
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder="sk-proj-..."
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition"
        >
          Save Configuration
        </button>
      </form>
    </div>
  );
};
