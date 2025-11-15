'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';

// Tipagem para a notificação
type Toast = {
  message: string;
  type: 'success' | 'error';
  visible: boolean;
};

export default function AuthForm() {
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<Toast>({ message: '', type: 'error', visible: false });
  // Variável 'router' removida, usando window.location.href para navegação.
  
  // Duração do Toast ajustada para 3 segundos para coincidir com o redirecionamento
  const TOAST_DURATION = 3000; 

  // Carregar CPF salvo ao montar o componente
  React.useEffect(() => {
    const savedCpf = localStorage.getItem('rememberedCpf');
    if (savedCpf) {
      setCpf(savedCpf);
      setRememberMe(true);
    }
  }, []);

  // Função para exibir a notificação
  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type, visible: true });

    // Apenas mensagens de erro desaparecem sozinhas. Sucesso é coberto pelo redirecionamento.
    if (type === 'error') {
        const timer = setTimeout(() => {
            setToast(prev => ({ ...prev, visible: false }));
        }, TOAST_DURATION);

        return () => clearTimeout(timer); 
    }
  }, []);

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);

    // Formatação de máscara para CPF
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');

    setCpf(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setToast({ message: '', type: 'error', visible: false });
    setIsLoading(true);

    const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/login`;
    const cleanedCpf = cpf.replace(/\D/g, '');
    
    // DEBUG 1: Imprime o URL e os dados enviados (CPF sem formatação)
    console.log("Tentando login na URL:", url);
    console.log("Dados enviados (sem pontos/traços):", { cpf: cleanedCpf, password: '***' });


    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpf: cleanedCpf, password }),
      });

      // DEBUG 2: Imprime o status da resposta HTTP
      console.log("Status da Resposta:", response.status);

      // Tenta ler o JSON, mas verifica primeiro se a resposta não está vazia
      interface LoginResponse {
        user?: {
          role?: string;
          [key: string]: unknown;
        };
        error?: string;
      }
      
      let data: LoginResponse = {};
      try {
        // Clonar a resposta antes de tentar ler o JSON, caso o backend não retorne corpo
        const responseClone = response.clone();
        data = await responseClone.json();
      } catch (error) {
        console.warn("Aviso: O servidor retornou um erro HTTP, mas sem corpo JSON. Status:", response.status, error);
        data = { error: 'O servidor retornou um erro desconhecido.' };
      }

      if (response.ok) {
        showToast('Login realizado com sucesso! Redirecionando...', 'success'); 
        localStorage.setItem('usuarioLogado', JSON.stringify(data.user));

        // Salvar ou remover CPF baseado na opção "Lembrar de mim"
        if (rememberMe) {
          localStorage.setItem('rememberedCpf', cpf);
        } else {
          localStorage.removeItem('rememberedCpf');
        }

        // REDIRECIONAMENTO APÓS 3 SEGUNDOS (usando navegação nativa)
        setTimeout(() => {
          const userRole = data.user?.role || 'USER'; // Garante um fallback
          if (userRole === 'ADMIN') window.location.href = '/administrador/mural_adm';
          else window.location.href = '/mural';
        }, TOAST_DURATION);
        
      } else {
        // DEBUG 3: Imprime o erro que veio do backend (Status 4xx ou 5xx)
        console.error("Erro do Backend (resposta não OK):", data);
        showToast(data.error || 'CPF ou senha inválidos.', 'error');
        setIsLoading(false); 
      }
    } catch (error) {
      console.error('Erro de conexão (o fetch falhou completamente):', error);
      showToast('Erro na conexão com o servidor.', 'error');
      setIsLoading(false); 
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-black bg-cover bg-center font-sans relative p-4"
      style={{ backgroundImage: "url('/4d-ultra-hd-red-gradient-blobs-lq4203zqlhouj1ix 1.png')" }}
    >
      {/* Texto de Boas-vindas à esquerda */}
      <div className="hidden lg:flex flex-col justify-center text-white px-12 max-w-xl">
        <h1 className="text-6xl font-bold mb-4 leading-tight">
          Olá, seja<br />bem-vindo à<br /><span className="font-extrabold text-white">Nexus Senai!</span>
        </h1>
        <p className="text-lg text-gray-300 mt-6">
          Por favor, preencha o formulário ao lado para acessar o sistema.
        </p>
      </div>

      {/* Container do Formulário de Login */}
      <div className="w-full max-w-lg lg:max-w-xl bg-black/50 backdrop-blur-md border border-white/20 shadow-2xl rounded-3xl p-8 sm:p-10 lg:p-12">
        {/* Título e Logo no Mobile */}
        <div className="text-center mb-8 lg:hidden">
          <h1 className="text-3xl font-bold text-white mb-2">
            Nexus <span className="text-red-500">Senai</span>
          </h1>
          <p className="text-sm text-gray-300">Bem-vindo de volta!</p>
        </div>

        <h2 className="text-4xl lg:text-5xl font-bold text-white mb-8 lg:mb-10">Login</h2>

        <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-8">
          {/* Campo CPF */}
          <div>
            <label className="block text-base lg:text-lg font-medium text-white mb-3">CPF</label>
            <input
              type="text"
              placeholder="000.000.000-00"
              value={cpf}
              onChange={handleCpfChange}
              required
              inputMode="numeric"
              maxLength={14}
              className="w-full rounded-xl border-2 border-white/30 bg-white/5 px-5 py-4 text-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition duration-200"
            />
          </div>

          {/* Campo Senha */}
          <div>
            <label className="block text-base lg:text-lg font-medium text-white mb-3">Senha</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl border-2 border-white/30 bg-white/5 px-5 py-4 text-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition duration-200"
            />
            <div className="mt-4 flex items-center justify-between">
              {/* Checkbox Lembrar de mim */}
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-5 h-5 rounded border-2 border-white/30 bg-white/5 text-red-600 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-black cursor-pointer transition"
                />
                <span className="ml-2 text-sm lg:text-base text-white/80 group-hover:text-white transition">
                  Lembrar de mim
                </span>
              </label>

              <Link
                href="/recuperar-senha"
                className="text-sm lg:text-base font-medium text-red-400 hover:text-red-300 hover:underline transition italic"
              >
                Esqueci a senha
              </Link>
            </div>
          </div>

          {/* Botão Entrar */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-6 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold py-4 lg:py-5 text-lg lg:text-xl rounded-xl shadow-lg transition duration-200 ease-in-out hover:from-red-700 hover:to-red-800 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-black focus:ring-red-600 disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed active:scale-95"
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>

      {/* COMPONENTE: TOAST NOTIFICATION (Modal) */}
      {toast.visible && (
        <div
          className={`fixed bottom-4 right-4 z-50 w-80 p-4 rounded-lg shadow-2xl transition-all duration-300 ease-in-out transform ${
            toast.type === 'success'
              ? 'bg-green-700/80 border border-green-500/50'
              : 'bg-red-700/80 border border-red-500/50'
          } backdrop-blur-sm`}
        >
          <div className="flex items-center space-x-3">
            {/* Ícone de Feedback */}
            <svg
              className={`w-6 h-6 ${
                toast.type === 'success' ? 'text-green-300' : 'text-red-300'
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              {toast.type === 'success' ? (
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              ) : (
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              )}
            </svg>

            {/* Mensagem */}
            <p className="text-white text-sm font-medium flex-1">{toast.message}</p>
          </div>

          {/* Barra de Progresso (Tempo para sumir) */}
          <div className="mt-3 h-1 w-full bg-white/20 rounded-full overflow-hidden">
            <div
              className={`h-full ${
                toast.type === 'success' ? 'bg-green-300' : 'bg-red-300'
              } rounded-full`}
              style={{
                animation: `progress-bar ${TOAST_DURATION}ms linear forwards`,
              }}
            ></div>
          </div>
        </div>
      )}
      {/* Adicionar Keyframes para a animação da barra de progresso (Precisa ser no CSS global) */}
      <style jsx global>{`
        @keyframes progress-bar {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}
