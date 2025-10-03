'use client';

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import Header from '../../components/header';
import { useDarkMode } from '../../contexts/DarkModeContext';

const socket = io('http://localhost:3000');

interface Message {
  id: number;
  conteudo: string;
  createdAt: string;
}

export default function MuralDeAvisos() {
  const [messages, setMessages] = useState<Message[]>([]);
  const { isDarkMode } = useDarkMode();

  useEffect(() => {
    fetchMessages();

    socket.on('novaMensagem', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    return () => {
      socket.off('novaMensagem');
    };
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await fetch('http://localhost:3000/mural');
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
    }
  };

  return (
    // Container principal com flexbox para ocupar a altura da tela
    <div className={`flex flex-col h-screen font-sans transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <Header />
      {/* Main agora usa 'overflow-auto' para gerenciar o scroll de todo o conteúdo */}
      <main className="flex-1 p-8 flex flex-col items-center overflow-auto">
        {/* Bem-vindo section */}
        <div className="text-center mb-6">
          <p className={`text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Bem-vindo Aluno(a)</p>
          <h2 className={`text-3xl font-bold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Avisos recentes</h2>
        </div>
        {/* Aviso Card com altura máxima controlada */}
        <div className={`w-full max-w-2xl rounded-lg shadow-xl p-6 flex flex-col h-full transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          {/* A div interna é o painel de scroll */}
          <div className="flex-1 overflow-y-auto space-y-6">
            {messages.length === 0 ? (
              <div className={`text-center transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Nenhum aviso no momento.</div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className={`border-b pb-4 last:border-b-0 last:pb-0 transition-colors duration-300 ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                  <div className="flex items-center mb-2">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white">
                      <i className="bi bi-person-circle text-4xl text-red-600"></i> 
                    </div>
                    <div className="ml-3">
                      <h3 className={`font-bold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Docente</h3>
                    </div>
                  </div>
                  <p className={`whitespace-pre-line transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{message.conteudo}</p>
                  <span className={`block text-xs mt-2 transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {new Date(message.createdAt).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}