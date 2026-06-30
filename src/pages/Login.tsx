import React, { useState } from 'react';
import { Lock, Mail, Loader2 } from 'lucide-react';
import { useApp } from '../AppContext';

const Login: React.FC = () => {
  const { companyData, login, signUp } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (email && password) {
        if (isSignUp) {
          await signUp(email, password);
          setSuccessMsg('Cadastro realizado com sucesso! Você está logado.');
        } else {
          await login(email, password);
        }
      } else {
        throw new Error('Por favor, preencha todos os campos');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao realizar login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center">
          <div className="inline-flex items-center justify-center mb-4">
            {companyData.logoUrl ? (
              <img 
                src={companyData.logoUrl} 
                alt="Logo" 
                className="h-24 w-auto object-contain"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-16 h-16 bg-blue-50 rounded-2xl text-blue-600 flex items-center justify-center">
                <Lock size={32} />
              </div>
            )}
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">{companyData.name}</h2>
          <p className="mt-2 text-gray-500 font-medium">
            {isSignUp ? 'Crie sua conta para gerenciar suas obras' : 'Acesse sua conta para gerenciar suas obras'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg text-sm font-medium">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="bg-green-50 border border-green-100 text-green-600 px-4 py-3 rounded-lg text-sm font-medium">
            {successMsg}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                <Mail size={16} /> Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all"
                placeholder="seu@email.com"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                <Lock size={16} /> Senha
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 font-black uppercase tracking-widest transition-all disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              isSignUp ? 'Criar Nova Conta' : 'Entrar no Sistema'
            )}
          </button>
        </form>

        <div className="text-center mt-4">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
              setSuccessMsg(null);
            }}
            className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
          >
            {isSignUp ? 'Já possui uma conta? Entrar' : 'Não tem uma conta? Cadastre-se'}
          </button>
        </div>

        <div className="text-center text-xs text-gray-400 font-medium">
          &copy; {new Date().getFullYear()} OPUS ASSESSORIAS - Todos os direitos reservados
        </div>
      </div>
    </div>
  );
};

export default Login;
