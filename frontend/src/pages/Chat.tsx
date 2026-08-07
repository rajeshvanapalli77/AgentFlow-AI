import React, { useState, useEffect, useRef } from 'react';
import { ChatService } from '../services/api';
import { Bot, Send, User, Sparkles, AlertTriangle, ShieldCheck, ChevronDown, ChevronRight, Plus, Terminal } from 'lucide-react';

export const Chat: React.FC = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [requireApproval, setRequireApproval] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pendingApprovalRun, setPendingApprovalRun] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    if (activeSessionId) {
      loadMessages(activeSessionId);
    }
  }, [activeSessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadSessions = async () => {
    try {
      const data = await ChatService.getSessions();
      setSessions(data);
      if (data.length > 0 && !activeSessionId) {
        setActiveSessionId(data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadMessages = async (sessId: string) => {
    try {
      const msgs = await ChatService.getMessages(sessId);
      setMessages(msgs);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNewSession = async () => {
    try {
      const newSess = await ChatService.createSession('New Agent Task Worksession');
      setSessions([newSess, ...sessions]);
      setActiveSessionId(newSess.id);
      setMessages([]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    const userText = inputMessage;
    setInputMessage('');

    // Optimistic user message update
    const tempUserMsg = {
      id: Date.now().toString(),
      sender: 'user',
      content: userText,
      created_at: new Date().toISOString()
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setLoading(true);

    try {
      const res = await ChatService.executeChat(userText, activeSessionId || undefined, requireApproval);
      if (res.session_id && res.session_id !== activeSessionId) {
        setActiveSessionId(res.session_id);
        loadSessions();
      }

      if (res.status === 'pending_approval') {
        setPendingApprovalRun(res);
      } else {
        const agentMsg = {
          id: res.message_id || Date.now().toString(),
          sender: 'supervisor',
          agent_name: 'Supervisor Agent',
          content: res.response,
          metadata_json: {
            agent_path: res.agent_path,
            run_id: res.run_id,
            plan: res.plan,
            agent_outputs: res.agent_outputs
          },
          created_at: new Date().toISOString()
        };
        setMessages((prev) => [...prev, agentMsg]);
      }
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: 'system',
          content: `Workflow Execution Error: ${err.message || 'Server error occurred'}`,
          created_at: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-7rem)] flex rounded-2xl border border-slate-800 bg-darkbg-800 overflow-hidden">
      {/* Sessions Sidebar */}
      <div className="w-64 border-r border-slate-800 flex flex-col bg-slate-900/50">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">Agent Sessions</h3>
          <button
            onClick={handleNewSession}
            className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition flex items-center gap-1 text-xs font-semibold"
          >
            <Plus className="w-4 h-4" /> New
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {sessions.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSessionId(s.id)}
              className={`w-full text-left p-3 rounded-xl text-xs transition ${
                activeSessionId === s.id
                  ? 'bg-blue-600/15 border border-blue-500/30 text-blue-400 font-semibold'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <p className="truncate">{s.title}</p>
              <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                {new Date(s.created_at).toLocaleDateString()}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Stream */}
      <div className="flex-1 flex flex-col min-w-0 bg-darkbg-900">
        {/* Messages list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-xl shadow-blue-500/20 mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">AgentFlow Multi-Agent Workspace</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Submit complex multi-disciplinary tasks. The <strong>Supervisor Agent</strong> will decompose your request, route sub-tasks to <strong>Research, RAG, Code, Data Analysis, Vision</strong>, and compile executive reports.
              </p>
            </div>
          )}

          {messages.map((m) => {
            const isUser = m.sender === 'user';
            const metadata = m.metadata_json || {};
            const agentPath = metadata.agent_path || [];

            return (
              <div key={m.id} className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
                {!isUser && (
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shrink-0 shadow-md">
                    <Bot className="w-5 h-5" />
                  </div>
                )}

                <div className={`max-w-2xl rounded-2xl p-4 text-sm leading-relaxed ${
                  isUser
                    ? 'bg-blue-600 text-white rounded-br-none shadow-lg shadow-blue-600/10'
                    : 'bg-darkbg-800 border border-slate-800 text-slate-200 rounded-bl-none'
                }`}>
                  {!isUser && (
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-700/50">
                      <span className="text-xs font-bold text-blue-400 font-mono">
                        {m.agent_name || 'AgentFlow Orchestrator'}
                      </span>
                      {agentPath.length > 0 && (
                        <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          <span>Path:</span>
                          <span className="text-emerald-400">{agentPath.join(' → ')}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="whitespace-pre-wrap font-sans">{m.content}</div>
                </div>

                {isUser && (
                  <div className="w-9 h-9 rounded-xl bg-slate-700 border border-slate-600 flex items-center justify-center text-blue-400 shrink-0 font-bold text-xs">
                    U
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-darkbg-800 border border-slate-800 text-slate-400 text-xs font-mono animate-pulse w-fit">
              <Sparkles className="w-4 h-4 text-blue-400 animate-spin" />
              <span>Orchestrating agents & executing tools...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Human Approval Alert Checkpoint Modal */}
        {pendingApprovalRun && (
          <div className="p-4 bg-amber-500/10 border-t border-b border-amber-500/30 text-amber-300 flex items-center justify-between text-xs px-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <span>
                <strong>Human-in-the-Loop Approval Required:</strong> Workflow step involves sensitive execution.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPendingApprovalRun(null)}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
              >
                Approve Execution
              </button>
              <button
                onClick={() => setPendingApprovalRun(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
              >
                Reject
              </button>
            </div>
          </div>
        )}

        {/* Message Input Box */}
        <form onSubmit={handleSend} className="p-4 border-t border-slate-800 bg-darkbg-800 flex flex-col gap-3">
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 font-mono">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={requireApproval}
                onChange={(e) => setRequireApproval(e.target.checked)}
                className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
              />
              <span className="flex items-center gap-1 text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> Enable Human-in-the-Loop Approval Checkpoint
              </span>
            </label>
            <span>Press Enter to Submit</span>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask AgentFlow to research, write code, query database, analyze documents, or build reports..."
              className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition disabled:opacity-50 flex items-center gap-2"
            >
              <Send className="w-4 h-4" /> Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
