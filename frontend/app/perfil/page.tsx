'use client';

import React, { useState, useEffect } from 'react';
import DynamicHeader from '../components/DynamicHeader';
import { useDarkMode } from '../contexts/DarkModeContext';
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
        <div className={`flex flex-col min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-100'}`}>
          <DynamicHeader />
          
          <main className="lg:ml-80 flex-1 p-4 sm:p-6 lg:p-8 animate-fade-in">
            <div className="max-w-4xl mx-auto">
              {/* Título */}
              <h1 className={`text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Meu Perfil
              </h1>
          
              {/* Card Principal */}
              <div className={`rounded-xl shadow-lg p-6 sm:p-8 mb-6 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  
                  {/* Foto de Perfil */}
                  <div className="flex-shrink-0 w-full sm:w-auto flex justify-center sm:justify-start">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-14 h-14 sm:w-20 sm:h-20 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                    </div>
                  </div>
                  
                  {/* Informações do Usuário */}
                  <div className="flex-1 w-full">
                    <div className="space-y-4">
                      {/* Nome */}
                      <div className={`p-4 rounded-lg transition-colors duration-300 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <p className={`text-xs sm:text-sm font-medium mb-1 transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Nome
                        </p>
                        <p className={`text-base sm:text-lg font-semibold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {usuario?.nome}
                        </p>
                      </div>

                      {/* Curso */}
                      <div className={`p-4 rounded-lg transition-colors duration-300 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <p className={`text-xs sm:text-sm font-medium mb-1 transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Curso
                        </p>
                        <p className={`text-base sm:text-lg font-semibold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {usuario?.curso?.nome || 'Não informado'}
                        </p>
                      </div>

                      {/* Turma */}
                      <div className={`p-4 rounded-lg transition-colors duration-300 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <p className={`text-xs sm:text-sm font-medium mb-1 transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Turma
                        </p>
                        <p className={`text-base sm:text-lg font-semibold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          B
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botões de Ações */}
                <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t transition-colors duration-300 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <button 
                    onClick={() => window.open('https://docs.google.com/spreadsheets/d/1w-pSrGjvFTxZJDJDvYruBM1dTcorfh6zw1Bl2VdNX74/edit', '_blank')}
                    className="flex items-center justify-center gap-2 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 active:scale-95 transition-all font-semibold shadow-md"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Frequência
                  </button>
                  
                  <button 
                    onClick={() => alert('Funcionalidade de notas em breve!')}
                    className="flex items-center justify-center gap-2 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 active:scale-95 transition-all font-semibold shadow-md"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    Notas
                  </button>
                </div>
              </div>
          
              {/* Seção de Configurações */}
              <div className={`rounded-xl shadow-lg p-6 sm:p-8 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <h2 className={`text-xl font-bold mb-6 flex items-center transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  <svg className="w-6 h-6 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Configurações
                </h2>

                <div className="space-y-3">
                  {/* Alterar Senha */}
                  <button className={`w-full text-left p-4 rounded-lg border transition-all duration-300 hover:shadow-md ${isDarkMode ? 'hover:bg-gray-700 border-gray-600 bg-gray-750' : 'hover:bg-gray-50 border-gray-200 bg-white'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span className={`font-medium transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                          Alterar senha
                        </span>
                      </div>
                      <svg className={`w-5 h-5 transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>

                  {/* Modo Escuro */}
                  <div className={`flex items-center justify-between p-4 border rounded-lg transition-colors duration-300 ${isDarkMode ? 'border-gray-600 bg-gray-750' : 'border-gray-200 bg-white'}`}>
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                      <span className={`font-medium transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                        Modo Escuro
                      </span>
                    </div>
                    <button 
                      onClick={toggleDarkMode}
                      className={`relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${isDarkMode ? 'bg-red-600' : 'bg-gray-300'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-md ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>
                
                {/* Botão Sair */}
                <div className={`mt-6 pt-6 border-t transition-colors duration-300 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <button 
                    onClick={handleLogout}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 active:scale-95 transition-all font-semibold shadow-md"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
