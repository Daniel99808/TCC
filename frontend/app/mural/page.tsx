'use client';

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import DynamicHeader from '../components/DynamicHeader';
import { useDarkMode } from '../contexts/DarkModeContext';
import ProtectedRoute from '../components/ProtectedRoute';

const socket = io('http://localhost:3000');

interface Curso {
  id: number;
  nome: string;
}

interface Message {
  id: number;
  conteudo: string;
  tipoPublico: string;
  cursoId?: number;
  turma?: string;
  createdAt: string;
  curso?: Curso;
}

interface User {
  id: number;
  nome: string;
  cpf: string;
  role: string;
  cursoId?: number;
  turma?: string;
}

export default function MuralDeAvisos() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [usuarioLogado, setUsuarioLogado] = useState<User | null>(null);
  const { isDarkMode } = useDarkMode();

  useEffect(() => {
    // Recuperar usuário logado
    const userStr = localStorage.getItem('usuarioLogado');
    if (userStr) {
      const user = JSON.parse(userStr);
      setUsuarioLogado(user);
      fetchMessages(user);
    }

    socket.on('novaMensagem', (message: Message) => {
      // Verificar se a mensagem é relevante para o usuário
      const userStr = localStorage.getItem('usuarioLogado');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (isMessageRelevant(message, user)) {
          setMessages(prev => [message, ...prev]);
        }
      }
    });

    return () => {
      socket.off('novaMensagem');
    };
  }, []);

  const isMessageRelevant = (msg: Message, user: User): boolean => {
    if (msg.tipoPublico === 'TODOS') return true;
    if (msg.tipoPublico === 'CURSO' && msg.cursoId === user.cursoId) return true;
    if (msg.tipoPublico === 'TURMA' && msg.cursoId === user.cursoId && msg.turma === user.turma) return true;
    return false;
  };

  const fetchMessages = async (user: User) => {
    try {
      const params = new URLSearchParams();
      if (user.cursoId) params.append('cursoId', user.cursoId.toString());
      if (user.turma) params.append('turma', user.turma);
      
      const response = await fetch(`http://localhost:3000/mural?${params.toString()}`);
      const data = await response.json();
      // Verificar se data é um array antes de setar
      if (Array.isArray(data)) {
        setMessages(data);
      } else {
        console.error('Dados recebidos não são um array:', data);
        setMessages([]);
      }
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
      setMessages([]);
    }
  };
  
  const getTipoPublicoLabel = (msg: Message) => {
    if (msg.tipoPublico === 'TODOS') return 'Geral';
    if (msg.tipoPublico === 'CURSO') return `${msg.curso?.nome || 'Curso'}`;
    if (msg.tipoPublico === 'TURMA') return `${msg.curso?.nome || 'Curso'} - Turma ${msg.turma}`;
    return '';
  };

  return (
    <ProtectedRoute allowedRoles={['ESTUDANTE', 'PROFESSOR', 'ADMIN']}>
      {/* Container principal com flexbox para ocupar a altura da tela */}
      <div className={`flex flex-col min-h-screen font-sans transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <DynamicHeader />
        
        {/* Título Mobile - Visível apenas no mobile */}
        <div className="lg:hidden pt-16 pb-3 px-4">
          <p className={`text-center text-sm mb-1 transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Bem-vindo {usuarioLogado?.nome}
          </p>
          <h2 className={`text-2xl font-bold text-center transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Avisos Recentes
          </h2>
        </div>
        
        {/* Main agora usa 'overflow-auto' para gerenciar o scroll de todo o conteúdo */}
        <main className="lg:ml-80 flex-1 p-2 sm:p-4 md:p-6 lg:p-8 flex flex-col items-center overflow-auto animate-fade-in">
        {/* Bem-vindo section - Oculto no mobile */}
        <div className="text-center mb-3 sm:mb-4 md:mb-6 px-2 hidden lg:block">
          <p className={`text-xs sm:text-sm md:text-base transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Bem-vindo {usuarioLogado?.nome}</p>
          <h2 className={`text-xl sm:text-2xl md:text-3xl font-bold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Avisos recentes</h2>
        </div>
        {/* Aviso Card com altura máxima controlada */}
        <div className={`w-full max-w-3xl rounded-lg shadow-xl p-4 sm:p-6 md:p-8 lg:p-10 flex flex-col h-full transition-colors duration-300 ${isDarkMode ? 'bg-gray-800/60 backdrop-blur-xl border border-gray-700/50' : 'bg-white/60 backdrop-blur-xl border border-gray-200/50'}`}>
          {/* A div interna é o painel de scroll */}
          <div className="flex-1 overflow-y-auto space-y-4 sm:space-y-6 md:space-y-8 px-1">
            {messages.length === 0 ? (
              <div className={`text-center py-12 text-base sm:text-lg lg:text-xl transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Nenhum aviso no momento.</div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className={`border-b pb-4 sm:pb-6 last:border-b-0 last:pb-0 transition-colors duration-300 ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                  <div className="flex items-center mb-3 gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full flex items-center justify-center text-white flex-shrink-0">
                      <i className="bi bi-person-circle text-4xl sm:text-5xl lg:text-6xl text-red-600"></i> 
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-bold text-base sm:text-lg lg:text-xl transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Administração</h3>
                      <span className="text-xs sm:text-sm lg:text-base bg-blue-100 text-blue-800 px-3 py-1 rounded-full inline-block mt-1">
                        {getTipoPublicoLabel(message)}
                      </span>
                    </div>
                  </div>
                  <p className={`whitespace-pre-line text-base sm:text-lg lg:text-xl leading-relaxed transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{message.conteudo}</p>
                  <span className={`block text-sm sm:text-base lg:text-lg mt-3 transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {new Date(message.createdAt).toLocaleString('pt-BR')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
    </ProtectedRoute>
  );
}
