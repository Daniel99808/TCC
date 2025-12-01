'use client';

import React, { useState } from 'react';
import DynamicHeader from '../components/DynamicHeader';
import { useDarkMode } from '../contexts/DarkModeContext';
import ProtectedRoute from '../components/ProtectedRoute';
import { apiUrl } from '@/lib/api';

type Toast = {
  message: string;
  type: 'success' | 'error';
  visible: boolean;
};

interface PasswordInputProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showPassword: boolean;
  setShowPassword: (val: boolean) => void;
}

const PasswordInput = ({ 
  label, 
  value, 
  onChange, 
  showPassword, 
  setShowPassword 
}: PasswordInputProps) => (
  <div>
    <label className="block text-sm lg:text-base font-medium text-white mb-2 lg:mb-3">
      {label}
    </label>
    <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        placeholder="••••••••"
        value={value}
        onChange={onChange}
        required
        className="w-full rounded-xl border-2 border-white/30 bg-white/5 px-4 lg:px-5 py-3 lg:py-4 pr-12 text-base lg:text-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition duration-200"
      />
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          setShowPassword(!showPassword);
        }}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
        aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
      >
        {showPassword ? (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
            <path d="M15.171 13.576l1.407 1.407A10.019 10.019 0 0020 10c-1.274-4.057-5.064-7-9.542-7a9.926 9.926 0 00-5.007 1.338l1.6 1.6a6 6 0 018.978 8.978z" />
          </svg>
        )}
      </button>
    </div>
  </div>
);

export default function AlterarSenhaPage() {
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<Toast>({ message: '', type: 'error', visible: false });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { isDarkMode } = useDarkMode();

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3000);
  };

  const validarSenha = (senha: string): string | null => {
    if (senha.length < 6) {
      return 'A senha deve ter pelo menos 6 caracteres';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      showToast('Por favor, preencha todos os campos', 'error');
      return;
    }

    if (novaSenha !== confirmarSenha) {
      showToast('As senhas não coincidem', 'error');
      return;
    }

    const erroValidacao = validarSenha(novaSenha);
    if (erroValidacao) {
      showToast(erroValidacao, 'error');
      return;
    }

    if (senhaAtual === novaSenha) {
      showToast('A nova senha não pode ser igual à senha atual', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const usuarioLogado = localStorage.getItem('usuarioLogado');
      if (!usuarioLogado) {
        showToast('Usuário não encontrado', 'error');
        return;
      }

      const usuario = JSON.parse(usuarioLogado);

      const response = await fetch(apiUrl('/alterar-senha'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: usuario.id,
          senhaAtual,
          novaSenha
        }),
      });

      if (response.ok) {
        showToast('Senha alterada com sucesso!', 'success');
        
        // Registrar atividade
        const atividade = {
          tipo: 'senha',
          titulo: 'Senha alterada',
          descricao: 'Você alterou sua senha com sucesso',
          tempo: 'Agora'
        };
        const atividadesExistentes = JSON.parse(localStorage.getItem('ultimasAtividades') || '[]');
        localStorage.setItem('ultimasAtividades', JSON.stringify([atividade, ...atividadesExistentes].slice(0, 5)));
        
        setSenhaAtual('');
        setNovaSenha('');
        setConfirmarSenha('');
        setTimeout(() => {
          window.location.href = '/perfil';
        }, 2000);
      } else {
        const data = await response.json();
        showToast(data.error || 'Erro ao alterar senha', 'error');
      }
    } catch (error) {
      console.error('Erro:', error);
      showToast('Erro na conexão com o servidor', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['ESTUDANTE', 'PROFESSOR', 'ADMIN']}>
      <div
        className="flex flex-col min-h-screen"
        style={{
          backgroundImage: 'url(/fundo.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
        }}
      >
        <DynamicHeader />

        <main className="transition-all duration-300 flex-1 p-4 sm:p-6 lg:p-8 animate-fade-in pt-16 sm:pt-20 lg:ml-[360px]">
          <div className="max-w-2xl mx-auto">
            {/* Header da Página */}
            <div className="text-center mb-8 lg:mb-10">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-2 lg:mb-3">
                Alterar Senha
              </h1>
              <p className="text-sm sm:text-base text-gray-400">
                Atualize sua senha para manter sua conta segura
              </p>
            </div>

            {/* Card Principal */}
            <div className="rounded-2xl shadow-2xl p-6 sm:p-8 lg:p-10 bg-white/10 backdrop-blur-lg border border-white/20">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Senha Atual */}
                <PasswordInput
                  label="Senha Atual"
                  value={senhaAtual}
                  onChange={(e) => setSenhaAtual(e.target.value)}
                  showPassword={showCurrentPassword}
                  setShowPassword={setShowCurrentPassword}
                />

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                {/* Nova Senha */}
                <PasswordInput
                  label="Nova Senha"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  showPassword={showNewPassword}
                  setShowPassword={setShowNewPassword}
                />

                {/* Confirmar Senha */}
                <PasswordInput
                  label="Confirmar Nova Senha"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  showPassword={showConfirmPassword}
                  setShowPassword={setShowConfirmPassword}
                />

                {/* Botões */}
                <div className="flex gap-4 pt-6">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold py-3 lg:py-4 text-base lg:text-lg rounded-xl shadow-lg transition duration-200 ease-in-out hover:from-red-700 hover:to-red-800 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-black focus:ring-red-600 disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed active:scale-95"
                  >
                    {isLoading ? 'Alterando...' : 'Alterar Senha'}
                  </button>
                  <button
                    type="button"
                    onClick={() => window.location.href = '/perfil'}
                    className="flex-1 bg-gradient-to-r from-gray-700 to-gray-800 text-white font-bold py-3 lg:py-4 text-base lg:text-lg rounded-xl shadow-lg transition duration-200 ease-in-out hover:from-gray-800 hover:to-gray-900 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-black focus:ring-gray-600 active:scale-95"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>

        {/* Toast Notification */}
        {toast.visible && (
          <div
            className={`fixed bottom-4 right-4 z-50 p-4 lg:p-5 rounded-xl shadow-2xl transition-all duration-300 ease-in-out transform flex items-center gap-3 ${
              toast.type === 'success'
                ? 'bg-green-700/80 border border-green-500/50'
                : 'bg-red-700/80 border border-red-500/50'
            } backdrop-blur-sm`}
          >
            {toast.type === 'success' ? (
              <svg className="w-5 h-5 lg:w-6 lg:h-6 text-green-300 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 lg:w-6 lg:h-6 text-red-300 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            <span className="text-sm lg:text-base font-medium text-white">{toast.message}</span>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
