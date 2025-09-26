'use client';

import React, { useState, useEffect } from 'react';
import Header from '../../components/header';

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
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [error, setError] = useState<string>('');

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
    window.location.href = '/Users/login';
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-gray-100">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Carregando perfil...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !usuario) {
    return (
      <div className="flex flex-col h-screen bg-gray-100">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-600 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Erro ao carregar perfil</h2>
            <p className="text-gray-600 mb-4">{error || 'Usuário não encontrado'}</p>
            <button 
              onClick={() => window.location.href = '/Users/login'}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Fazer Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-100 ">
      <Header />
      
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Título */}
          <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">Perfil</h1>
          
          {/* Card Principal */}
          <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
            <div className="flex flex-col md:flex-row items-start gap-8">
              
              {/* Foto de Perfil */}
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 bg-red-600 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-20 h-20 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
              </div>
              
              {/* Informações do Usuário */}
              <div className="flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-700 mb-2">
                      <span className="text-red-600">Nome:</span> {usuario?.nome}
                    </h2>
                    <h2 className="text-lg font-semibold text-gray-700 mb-2">
                      <span className="text-red-600">Curso:</span> {usuario?.curso?.nome || 'Não informado'}
                    </h2>
                    <h2 className="text-lg font-semibold text-gray-700 mb-2">
                      <span className="text-red-600">Turma:</span> B
                    </h2>
                  </div>
                  
                  {/* Botões Laterais */}
                  <div className="space-y-4">
                    <button 
                      onClick={() => alert('Funcionalidade de frequência em breve!')}
                      className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors font-semibold shadow-md"
                    >
                      📊 Frequência
                    </button>
                    
                    <button 
                      onClick={() => alert('Funcionalidade de notas em breve!')}
                      className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors font-semibold shadow-md"
                    >
                      📝 Notas
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Seção de Configurações */}
          <div className="bg-white rounded-lg shadow-xl p-6">
            <h2 className="text-xl font-semibold text-red-600 mb-6 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              Configurações
            </h2>

            <div className="space-y-4">
              <button className="w-full text-left p-3 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors">
                <span className="text-red-600 font-medium hover:cursor-pointer">Alterar senha</span>
              </button>
              
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <span className="text-red-600 font-medium hover:cursor-pointer">Modo:</span>
                <button 
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
            
            {/* Botão Sair */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button 
                onClick={handleLogout}
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
