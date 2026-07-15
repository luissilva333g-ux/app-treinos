import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Dumbbell, ShieldCheck, ArrowRight, Lock, User, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('Admin');
  const [password, setPassword] = useState('Admin');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Por favor, introduza o utilizador e a palavra-passe.');
      return;
    }

    setLoading(true);
    setError(null);

    const res = await login(username, password);
    if (!res.success) {
      setError(res.error || 'Falha na autenticação.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col justify-center px-6 py-12 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-10 w-60 h-60 bg-emerald-600/15 rounded-full blur-[80px] pointer-events-none" />

      <div className="max-w-sm w-full mx-auto relative z-10 animate-fade-in">
        {/* Header Branding */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-blue-500/30 mb-6 border border-white/20">
            <Dumbbell size={38} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Registo de Treinos
          </h1>
          <p className="text-zinc-400 text-sm mt-2 font-medium">
            Diário de treino de alta precisão • Apple 2026
          </p>
        </div>

        {/* Login Card */}
        <form onSubmit={handleSubmit} className="glass-card p-6 flex flex-col gap-5">
          {error && (
            <div className="bg-red-500/15 border border-red-500/30 rounded-xl p-3 text-red-400 text-xs font-medium flex items-start gap-2 animate-fade-in">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2 block">
              Utilizador ou Email
            </label>
            <div className="relative">
              <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Ex: Admin ou sofia"
                className="apple-input pl-11"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2 block">
              Palavra-passe
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Ex: Admin"
                className="apple-input pl-11"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full mt-2 shadow-lg"
          >
            {loading ? 'A autenticar...' : 'Iniciar Sessão'}
            <ArrowRight size={18} />
          </button>
        </form>

        {/* Hint para testes */}
        <div className="mt-8 glass-card p-4 rounded-2xl border border-white/10 text-xs text-zinc-400 space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-amber-400 uppercase tracking-wide text-[11px]">
            <ShieldCheck size={14} /> Credenciais de Acesso (Especificação)
          </div>
          <div className="flex justify-between items-center bg-black/40 p-2 rounded-lg border border-white/5">
            <div>
              <span className="text-white font-semibold">Administrador:</span>{' '}
              <code className="text-blue-400 font-mono">Admin</code> / <code className="text-blue-400 font-mono">Admin</code>
            </div>
            <button
              type="button"
              onClick={() => { setUsername('Admin'); setPassword('Admin'); }}
              className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-1 rounded font-bold hover:bg-blue-500/30 transition"
            >
              Preencher
            </button>
          </div>
          <div className="flex justify-between items-center bg-black/40 p-2 rounded-lg border border-white/5">
            <div>
              <span className="text-white font-semibold">2ª Utilizadora:</span>{' '}
              <code className="text-emerald-400 font-mono">sofia</code> / <code className="text-emerald-400 font-mono">sofia123</code>
            </div>
            <button
              type="button"
              onClick={() => { setUsername('sofia'); setPassword('sofia123'); }}
              className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded font-bold hover:bg-emerald-500/30 transition"
            >
              Preencher
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
