import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Login, Register } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Chat } from './pages/Chat';
import { Research } from './pages/Research';
import { Documents } from './pages/Documents';
import { AgentsPage } from './pages/Agents';
import { MemoryPage } from './pages/Memory';
import { TracingPage } from './pages/Tracing';
import { EvaluationPage } from './pages/Evaluation';
import { SettingsPage } from './pages/Settings';
import { AuthService } from './services/api';

export const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      AuthService.getMe()
        .then((data) => setUser(data))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-darkbg-900 flex items-center justify-center text-blue-400 font-mono text-xs">
        Loading AgentFlow AI Platform...
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!user ? <Login onLoginSuccess={setUser} /> : <Navigate to="/" />} />
        <Route path="/register" element={!user ? <Register onLoginSuccess={setUser} /> : <Navigate to="/" />} />

        {user ? (
          <Route
            path="/*"
            element={
              <Layout user={user} onLogout={handleLogout}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/chat" element={<Chat />} />
                  <Route path="/research" element={<Research />} />
                  <Route path="/documents" element={<Documents />} />
                  <Route path="/agents" element={<AgentsPage />} />
                  <Route path="/memory" element={<MemoryPage />} />
                  <Route path="/tracing" element={<TracingPage />} />
                  <Route path="/evaluation" element={<EvaluationPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </Layout>
            }
          />
        ) : (
          <Route path="*" element={<Navigate to="/login" />} />
        )}
      </Routes>
    </Router>
  );
};

export default App;
