'use client';

import React, { useState, useEffect } from 'react';
import DynamicHeader from '../components/DynamicHeader';
import { useDarkMode } from '../contexts/DarkModeContext';
import { useSidebar } from '../contexts/SidebarContext';
import ProtectedRoute from '../components/ProtectedRoute';

interface Usuario {
  id: number;
  nome: string;
  cpf: string;
  curso: {
    id: number;
    nome: string;
  } | null;
  createdAt: string;
}

export default function PerfilPage() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { isSidebarOpen } = useSidebar();

  useEffect(() => {
    const buscarPerfilUsuario = async () => {
      try {
        // Buscar CPF do usuário logado no localStorage
        const usuarioLogado = localStorage.getItem('usuarioLogado');
        
        if (!usuarioLogado) {
          setError('Usuário não encontrado. Faça login novamente.');
          setLoading(false);
          return;
        }

        const dadosUsuario = JSON.parse(usuarioLogado);
        
        // Buscar dados completos do perfil
        const response = await fetch(`http://localhost:3000/perfil/${dadosUsuario.cpf}`);
        
        if (!response.ok) {
          throw new Error('Erro ao buscar dados do usuário');
        }
        
        const perfil = await response.json();
        setUsuario(perfil);
        
      } catch (error) {
        console.error('Erro ao buscar perfil:', error);
        setError('Erro ao carregar perfil do usuário');
      } finally {
        setLoading(false);
      }
    };

    buscarPerfilUsuario();
  }, []);

  const handleLogout = () => {
    // Implementar logout
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <ProtectedRoute allowedRoles={['ESTUDANTE', 'PROFESSOR', 'ADMIN']}>
      {loading ? (
        <div className={`flex flex-col min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
          <DynamicHeader />
          <div className="lg:ml-80 flex-1 flex items-center justify-center p-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
              <p className={`mt-2 text-sm sm:text-base transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Carregando perfil...</p>
            </div>
          </div>
        </div>
      ) : error || !usuario ? (
        <div className={`flex flex-col min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
          <DynamicHeader />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-red-600 text-6xl mb-4">!</div>
              <h2 className={`text-xl font-semibold mb-2 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Erro ao carregar perfil</h2>
              <p className={`mb-4 transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{error || 'Usuário não encontrado'}</p>
              <button 
                onClick={() => window.location.href = '/login'}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Fazer Login
              </button>
            </div>
          </div>
        </div>
      ) : (
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
          
          <main className={`transition-all duration-300 flex-1 p-3 sm:p-6 lg:p-8 animate-fade-in pt-16 sm:pt-20 ${
            isSidebarOpen ? 'lg:ml-80' : 'lg:ml-0'
          }`}>
            <div className="max-w-5xl mx-auto">
              
              {/* Header com título */}
              <div className="text-center mb-4 sm:mb-6 lg:mb-8">
                <h1 className={`text-2xl sm:text-4xl lg:text-5xl font-bold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Meu Perfil
                </h1>
                <p className={`mt-1 sm:mt-2 text-xs sm:text-base transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Gerencie suas informações e configurações
                </p>
              </div>
          
              {/* Card Principal */}
              <div className="rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 bg-white/10 backdrop-blur-lg border border-white/20">
                <div className="flex flex-col lg:flex-row items-center lg:items-start gap-4 sm:gap-6 lg:gap-8">
                  
                  {/* Foto de Perfil */}
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center shadow-xl sm:shadow-2xl ring-2 sm:ring-4 ring-red-500/30">
                      <svg className="w-14 h-14 sm:w-20 sm:h-20 lg:w-24 lg:h-24 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                    </div>
                  </div>
                  
                  {/* Informações do Usuário */}
                  <div className="flex-1 w-full space-y-3 sm:space-y-4">
                    {/* Nome */}
                    <div className="p-3 sm:p-4 lg:p-5 rounded-lg sm:rounded-xl bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm border border-white/20 shadow-md sm:shadow-lg">
                      <p className={`text-xs sm:text-sm font-medium mb-1 sm:mb-2 transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Nome Completo
                      </p>
                      <p className={`text-base sm:text-xl lg:text-2xl font-bold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {usuario?.nome}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {/* Curso */}
                      <div className="p-3 sm:p-4 lg:p-5 rounded-lg sm:rounded-xl bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm border border-white/20 shadow-md sm:shadow-lg">
                        <p className={`text-xs sm:text-sm font-medium mb-1 sm:mb-2 transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          Curso
                        </p>
                        <p className={`text-sm sm:text-lg lg:text-xl font-bold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {usuario?.curso?.nome || 'Não informado'}
                        </p>
                      </div>

                      {/* Turma */}
                      <div className="p-3 sm:p-4 lg:p-5 rounded-lg sm:rounded-xl bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm border border-white/20 shadow-md sm:shadow-lg">
                        <p className={`text-xs sm:text-sm font-medium mb-1 sm:mb-2 transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          Turma
                        </p>
                        <p className={`text-sm sm:text-lg lg:text-xl font-bold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          B
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botões de Ações */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-4 sm:mt-6 lg:mt-8 pt-4 sm:pt-6 lg:pt-8 border-t border-white/20">
                  <button 
                    onClick={() => window.open('https://docs.google.com/spreadsheets/d/1w-pSrGjvFTxZJDJDvYruBM1dTcorfh6zw1Bl2VdNX74/edit', '_blank')}
                    className="flex items-center justify-center gap-2 sm:gap-3 bg-gradient-to-r from-red-600 to-red-700 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl hover:from-red-700 hover:to-red-800 active:scale-95 transition-all font-bold shadow-lg sm:shadow-xl text-base sm:text-lg hover:shadow-2xl"
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Frequência
                  </button>
                  
                  <button 
                    onClick={() => alert('Funcionalidade de notas em breve!')}
                    className="flex items-center justify-center gap-2 sm:gap-3 bg-gradient-to-r from-red-600 to-red-700 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl hover:from-red-700 hover:to-red-800 active:scale-95 transition-all font-bold shadow-lg sm:shadow-xl text-base sm:text-lg hover:shadow-2xl"
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    Notas
                  </button>
                </div>
              </div>
          
              {/* Seção de Configurações */}
              <div className="rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl p-4 sm:p-6 lg:p-8 bg-white/10 backdrop-blur-lg border border-white/20">
                <h2 className={`text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6 flex items-center transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 mr-2 sm:mr-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Configurações
                </h2>

                <div className="space-y-3 sm:space-y-4">
                  {/* Alterar Senha */}
                  <button className="w-full text-left p-3 sm:p-4 lg:p-5 rounded-lg sm:rounded-xl border border-white/20 transition-all duration-300 hover:shadow-xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm hover:from-white/20 hover:to-white/10 hover:scale-[1.02]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span className={`font-bold text-base sm:text-lg transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                          Alterar senha
                        </span>
                      </div>
                      <svg className={`w-6 h-6 transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                </div>
                
                {/* Botão Sair */}
                <div className="mt-4 sm:mt-6 lg:mt-8 pt-4 sm:pt-6 lg:pt-8 border-t border-white/20">
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 sm:gap-3 bg-gradient-to-r from-red-600 to-red-700 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-lg sm:rounded-xl hover:from-red-700 hover:to-red-800 active:scale-95 transition-all font-bold shadow-lg sm:shadow-xl text-base sm:text-lg hover:shadow-2xl"
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sair da Conta
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      )}
    </ProtectedRoute>
  );
}
