'use client';

import React, { useState, useEffect, useRef } from 'react';
import Header from '../../components/header';
import { io } from 'socket.io-client';
import { useDarkMode } from '../../contexts/DarkModeContext';

const socket = io('http://localhost:3000');

interface Usuario {
  id: number;
  nome: string;
  curso?: {
    nome: string;
  };
}

interface Mensagem {
  id: number;
  conteudo: string;
  createdAt: string;
  lida: boolean;
  remetente: {
    id: number;
    nome: string;
  };
}

interface Conversa {
  id: number;
  usuario1: Usuario;
  usuario2: Usuario;
  mensagens: Mensagem[];
  updatedAt: string;
  _count: {
    mensagens: number;
  };
}

export default function ConversasPage() {
  const [conversas, setConversas] = useState<Conversa[]>([]);
  const [conversaSelecionada, setConversaSelecionada] = useState<Conversa | null>(null);
  const [mensagensConversa, setMensagensConversa] = useState<Mensagem[]>([]);
  const [novaMensagem, setNovaMensagem] = useState('');
  const [usuarioLogado, setUsuarioLogado] = useState<Usuario | null>(null);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [mostrarUsuarios, setMostrarUsuarios] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isDarkMode } = useDarkMode();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [mensagensConversa]);

  useEffect(() => {
    // Buscar usuário logado
    const dadosUsuario = localStorage.getItem('usuarioLogado');
    if (dadosUsuario) {
      const usuario = JSON.parse(dadosUsuario);
      setUsuarioLogado(usuario);
      buscarConversas(usuario.id);
      buscarUsuarios();
    }
    setLoading(false);
  }, []);

  const buscarConversas = async (userId: number) => {
    try {
      const response = await fetch(`http://localhost:3000/conversas/${userId}`);
      if (response.ok) {
        const dados = await response.json();
        setConversas(dados);
      }
    } catch (error) {
      console.error('Erro ao buscar conversas:', error);
    }
  };

  const buscarUsuarios = async () => {
    try {
      const response = await fetch('http://localhost:3000/usuarios');
      if (response.ok) {
        const dados = await response.json();
        setUsuarios(dados);
      }
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    }
  };

  const buscarMensagensConversa = async (conversaId: number) => {
    try {
      const response = await fetch(`http://localhost:3000/conversa/${conversaId}/mensagens`);
      if (response.ok) {
        const dados = await response.json();
        setMensagensConversa(dados);
      }
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
    }
  };

  const iniciarConversa = async (outroUsuario: Usuario) => {
    if (!usuarioLogado) return;

    try {
      const response = await fetch('http://localhost:3000/conversa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usuario1Id: usuarioLogado.id,
          usuario2Id: outroUsuario.id
        }),
      });

      if (response.ok) {
        const conversa = await response.json();
        setConversaSelecionada(conversa);
        setMensagensConversa([]);
        setMostrarUsuarios(false);
        buscarConversas(usuarioLogado.id);
      }
    } catch (error) {
      console.error('Erro ao iniciar conversa:', error);
    }
  };

  const selecionarConversa = (conversa: Conversa) => {
    setConversaSelecionada(conversa);
    buscarMensagensConversa(conversa.id);
    
    // Configurar Socket.IO para esta conversa
    socket.on(`conversa-${conversa.id}`, (mensagem: Mensagem) => {
      setMensagensConversa(prev => [...prev, mensagem]);
    });
  };

  const enviarMensagem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!novaMensagem.trim() || !usuarioLogado || !conversaSelecionada) return;

    try {
      const response = await fetch('http://localhost:3000/mensagem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conteudo: novaMensagem,
          remetenteId: usuarioLogado.id,
          conversaId: conversaSelecionada.id
        }),
      });

      if (response.ok) {
        setNovaMensagem('');
        buscarConversas(usuarioLogado.id);
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  };

  const formatarHora = (data: string) => {
    return new Date(data).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getOutroUsuario = (conversa: Conversa) => {
    return conversa.usuario1.id === usuarioLogado?.id ? conversa.usuario2 : conversa.usuario1;
  };

  if (loading) {
    return (
      <div className={`flex flex-col h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        </div>
      </div>
    );
  }

  if (!usuarioLogado) {
    return (
      <div className={`flex flex-col h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-600 text-6xl mb-4">🔒</div>
            <h2 className={`text-xl font-semibold mb-2 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Login necessário</h2>
            <p className={`mb-4 transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Faça login para acessar suas conversas</p>
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
    <div className={`flex flex-col h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <Header />
      
      <main className="flex-1 p-4">
        <div className="max-w-6xl mx-auto h-full">
          {/* Título */}
          <h1 className={`text-3xl font-bold text-center mb-6 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Conversas</h1>
          
          <div className={`rounded-lg shadow-xl flex transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`} style={{ height: 'calc(100vh - 200px)' }}>
            {/* Lista de Conversas (lado esquerdo) */}
            <div className={`w-1/3 border-r flex flex-col transition-colors duration-300 ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
              {/* Header da lista */}
              <div className={`p-4 border-b flex justify-between items-center transition-colors duration-300 ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                <h2 className={`font-semibold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Conversas</h2>
                <button
                  onClick={() => setMostrarUsuarios(!mostrarUsuarios)}
                  className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors"
                  title="Nova conversa"
                >
                  ➕
                </button>
              </div>

              {/* Lista de usuários para nova conversa */}
              {mostrarUsuarios && (
                <div className={`border-b max-h-40 overflow-y-scroll transition-colors duration-300 ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                  {usuarios.filter(u => u.id !== usuarioLogado.id).map((usuario) => (
                    <div 
                      key={usuario.id}
                      onClick={() => iniciarConversa(usuario)}
                      className={`p-3 cursor-pointer border-b transition-colors duration-300 ${
                        isDarkMode 
                          ? 'hover:bg-gray-700 border-gray-600' 
                          : 'hover:bg-gray-50 border-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-semibold">
                            {usuario.nome.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className={`font-medium text-sm transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{usuario.nome}</div>
                          <div className={`text-xs transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{usuario.curso?.nome}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Lista de conversas existentes */}
              <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {conversas.length === 0 ? (
                  <div className={`text-center p-8 transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <div className="text-4xl mb-2">💬</div>
                    <p className="text-sm">Nenhuma conversa ainda</p>
                    <p className="text-xs">Clique em ➕ para começar</p>
                  </div>
                ) : (
                  <div className={`divide-y transition-colors duration-300 ${isDarkMode ? 'divide-gray-600' : 'divide-gray-100'}`}>
                    {conversas.map((conversa) => {
                    const outroUsuario = getOutroUsuario(conversa);
                    const ultimaMensagem = conversa.mensagens[0];
                    
                    return (
                      <div 
                        key={conversa.id}
                        onClick={() => selecionarConversa(conversa)}
                        className={`p-4 cursor-pointer border-b transition-colors duration-300 ${
                          conversaSelecionada?.id === conversa.id 
                            ? (isDarkMode ? 'bg-gray-700' : 'bg-red-50')
                            : (isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50')
                        } ${isDarkMode ? 'border-gray-600' : 'border-gray-100'}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-semibold text-sm">
                              {outroUsuario.nome.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-red-600 truncate">{outroUsuario.nome}</h3>
                              {conversa._count.mensagens > 0 && (
                                <div className="w-2 h-2 bg-red-600 rounded-full flex-shrink-0"></div>
                              )}
                            </div>
                            {ultimaMensagem && (
                              <p className={`text-sm truncate transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                {ultimaMensagem.conteudo}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  </div>
                )}
              </div>
            </div>
            
            {/* Área de Chat (lado direito) */}
            <div className="flex-1 flex flex-col">
              {conversaSelecionada ? (
                <>
                  {/* Header do chat */}
                  <div className={`p-4 border-b transition-colors duration-300 ${
                    isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-red-50'
                  }`}>
                    <h3 className="font-semibold text-red-600">
                      {getOutroUsuario(conversaSelecionada).nome}
                    </h3>
                  </div>
                  
                  {/* Mensagens */}
                  <div className="flex-1 overflow-hidden flex flex-col">
                    <div className="flex-1 overflow-y-auto p-4 scroll-smooth">
                      {mensagensConversa.length === 0 ? (
                        <div className={`text-center mt-20 transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          <div className="text-4xl mb-4">👋</div>
                          <p>Comece uma conversa!</p>
                        </div>
                      ) : (
                        <div className="space-y-4 min-h-full flex flex-col justify-end">
                          {mensagensConversa.map((mensagem) => (
                            <div 
                              key={mensagem.id} 
                              className={`flex ${mensagem.remetente.id === usuarioLogado.id ? 'justify-end' : 'justify-start'}`}
                            >
                              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                mensagem.remetente.id === usuarioLogado.id 
                                  ? 'bg-red-600 text-white' 
                                  : (isDarkMode ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-800')
                              }`}>
                                <p className="text-sm break-words">{mensagem.conteudo}</p>
                                <p className={`text-xs mt-1 ${
                                  mensagem.remetente.id === usuarioLogado.id 
                                    ? 'text-red-200' 
                                    : (isDarkMode ? 'text-gray-300' : 'text-gray-500')
                                }`}>
                                  {formatarHora(mensagem.createdAt)}
                                </p>
                              </div>
                            </div>
                          ))}
                          <div ref={messagesEndRef} />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Campo de envio */}
                  <div className={`border-t p-4 transition-colors duration-300 ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                    <form onSubmit={enviarMensagem} className="flex gap-2">
                      <input
                        type="text"
                        value={novaMensagem}
                        onChange={(e) => setNovaMensagem(e.target.value)}
                        placeholder="Digite sua mensagem..."
                        className={`flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-300 ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                            : 'bg-white border-gray-300 text-black placeholder-gray-500'
                        }`}
                      />
                      <button
                        type="submit"
                        disabled={!novaMensagem.trim()}
                        className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        ➤
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className={`text-center transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <div className="text-6xl mb-4">💬</div>
                    <h3 className="text-xl font-semibold mb-2">Selecione uma conversa</h3>
                    <p>Escolha uma conversa da lista ou inicie uma nova</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
