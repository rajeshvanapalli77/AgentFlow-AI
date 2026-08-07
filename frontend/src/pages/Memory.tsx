import React, { useEffect, useState } from 'react';
import { MemoryService } from '../services/api';
import { MemoryItem } from '../types';
import { Brain, Database, User, ShieldCheck, Search, Plus } from 'lucide-react';

export const MemoryPage: React.FC = () => {
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [activeTab, setActiveTab] = useState('semantic');
  const [newKey, setNewKey] = useState('');
  const [newContent, setNewContent] = useState('');

  useEffect(() => {
    loadMemories();
  }, [activeTab]);

  const loadMemories = async () => {
    try {
      const data = await MemoryService.listMemories(activeTab);
      setMemories(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim() || !newContent.trim()) return;

    try {
      await MemoryService.createMemory(activeTab, newKey, newContent);
      setNewKey('');
      setNewContent('');
      await loadMemories();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-6 rounded-2xl bg-darkbg-800 border border-slate-800 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white">Multi-Tier Memory Architecture</h1>
          <p className="text-xs text-slate-400 mt-1">Hybrid state persistence spanning Postgres long-term facts and ChromaDB semantic vector embeddings</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
          <Brain className="w-5 h-5" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-4 text-xs font-semibold">
        {[
          { id: 'semantic', label: 'Semantic Memory (Vector DB)' },
          { id: 'long_term', label: 'Long-Term Memory (Postgres)' },
          { id: 'user_profile', label: 'User Persona Facts' },
          { id: 'workflow', label: 'Workflow Checkpoints' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 px-1 transition border-b-2 font-mono ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Add Memory Form */}
      <div className="p-6 rounded-2xl bg-darkbg-800 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Plus className="w-4 h-4 text-blue-400" /> Save New {activeTab.replace('_', ' ')} Record
        </h3>
        <form onSubmit={handleAddMemory} className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            placeholder="Memory Key (e.g. preferred_programming_language)"
            className="bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
          <input
            type="text"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Memory Content / Fact text..."
            className="bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow transition"
          >
            Save Memory Entry
          </button>
        </form>
      </div>

      {/* Memory List Table */}
      <div className="p-6 rounded-2xl bg-darkbg-800 border border-slate-800">
        <h3 className="text-sm font-bold text-white mb-4">Stored Memory Records</h3>
        <div className="space-y-3 font-mono">
          {memories.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">No memory records found under this tier.</p>
          ) : (
            memories.map((m) => (
              <div key={m.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center justify-between">
                <div>
                  <span className="text-blue-400 font-bold block mb-1">[{m.key}]</span>
                  <p className="text-slate-300 font-sans">{m.content}</p>
                </div>
                <span className="text-[10px] text-slate-500">{new Date(m.created_at).toLocaleDateString()}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
