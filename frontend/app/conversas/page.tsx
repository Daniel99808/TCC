'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import DynamicHeader from '../components/DynamicHeader';
import { io } from 'socket.io-client';
import { useDarkMode } from '../contexts/DarkModeContext';
import Image from 'next/image';
import ProtectedRoute from '../components/ProtectedRoute';

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
  conversaId: number;
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

// Tipo de item na lista unificada
type ItemLista = (Usuario & { 
  conversaAtiva?: Conversa; 
}) | { 
  id: 'nexus'; 
  nome: string; 
  isNexus: true 
};


export default function ConversasPage() {
  const [conversas, setConversas] = useState<Conversa[]>([]);
  const [conversaSelecionada, setConversaSelecionada] = useState<Conversa | null>(null);
  const [mensagensConversa, setMensagensConversa] = useState<Mensagem[]>([]);
  const [novaMensagem, setNovaMensagem] = useState('');
  const [usuarioLogado, setUsuarioLogado] = useState<Usuario | null>(null);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNexusChat, setIsNexusChat] = useState(false);
  const [nexusMensagens, setNexusMensagens] = useState<any[]>([]);
  const [nexusTyping, setNexusTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [mostrarModalNovaConversa, setMostrarModalNovaConversa] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const { isDarkMode } = useDarkMode();

  const scrollToBottom = (smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: smooth ? "smooth" : "auto",
        block: "end"
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [mensagensConversa, nexusMensagens]);

  useEffect(() => {
    // Scroll imediato ao trocar de conversa
    if (conversaSelecionada || isNexusChat) {
      scrollToBottom(false);
    }
  }, [conversaSelecionada, isNexusChat]);

  // Função para buscar conversas (estabilizada com useCallback)
  const buscarConversas = useCallback(async (userId: number) => {
    try {
      const response = await fetch(`http://localhost:3000/conversas/${userId}`);
      if (response.ok) {
        const dados = await response.json();
        setConversas(dados);
      }
    } catch (error) {
      console.error('Erro ao buscar conversas:', error);
    }
  }, []);

  // Busca mensagens (estabilizada com useCallback)
  const buscarMensagensConversa = useCallback(async (conversaId: number) => {
    try {
      const response = await fetch(`http://localhost:3000/conversa/${conversaId}/mensagens`);
      if (response.ok) {
        const dados = await response.json();
        setMensagensConversa(dados);
      }
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
    }
  }, []);

  // Função para buscar usuários (estabilizada com useCallback)
  const buscarUsuarios = useCallback(async (userId: number) => {
    try {
      const response = await fetch('http://localhost:3000/usuarios');
      if (response.ok) {
        const dados: Usuario[] = await response.json();
        // **FILTRO ESSENCIAL:** Remove o próprio usuário logado
        setUsuarios(dados.filter(u => u.id !== userId));
      } else {
         console.error('Falha ao buscar usuários:', response.status);
      }
    } catch (error) {
      console.error('Erro de rede ao buscar usuários:', error);
    }
  }, []); // Não depende de userId, usa o que foi passado.

  // Função para marcar mensagens como lidas (estabilizada com useCallback)
  const marcarComoLida = useCallback(async (conversaId: number) => {
    setUsuarioLogado(prevUser => {
        if (!prevUser) return null;

        // 1. Notifica o servidor
        fetch(`http://localhost:3000/conversa/${conversaId}/marcar-lida/${prevUser.id}`, {
            method: 'PUT',
        }).catch(error => console.error('Erro ao marcar como lida (fetch):', error));
        
        // 2. Notifica o outro usuário via socket
        socket.emit('marcar_lida', conversaId, prevUser.id);
        
        // 3. Atualiza o estado local da lista de conversas
        setConversas(prevConversas => 
            prevConversas.map(conversa => {
                if (conversa.id === conversaId && conversa.mensagens.length > 0) {
                    const updatedMensagens = [...conversa.mensagens];
                    if (updatedMensagens[0].remetente.id !== prevUser.id) {
                      updatedMensagens[0] = { ...updatedMensagens[0], lida: true };
                    }
                    return { ...conversa, mensagens: updatedMensagens };
                }
                return conversa;
            })
        );
        return prevUser;
    });
  }, []);


  // EFEITO DE INICIALIZAÇÃO E SOCKET GERAL
  useEffect(() => {
    const dadosUsuario = localStorage.getItem('usuarioLogado');
    let userId = 0;

    if (dadosUsuario) {
      const usuario = JSON.parse(dadosUsuario);
      userId = usuario.id;
      setUsuarioLogado(usuario);
      buscarConversas(usuario.id);
      buscarUsuarios(usuario.id); // Garante que a busca seja feita
      socket.emit('usuario_conectado', usuario.id);
    }
    setLoading(false);
    
    // ... (Lógica de socket mantida - já revisada)

    const handleNovaMensagem = (mensagem: Mensagem) => {
        buscarConversas(userId); 

        setMensagensConversa(prevMensagens => {
            setConversaSelecionada(currentConversa => {
              if (currentConversa && mensagem.conversaId === currentConversa.id) {
                  marcarComoLida(currentConversa.id); 
                  return currentConversa;
              }
              return currentConversa;
            });

            if (conversaSelecionada && mensagem.conversaId === conversaSelecionada.id) {
                return [...prevMensagens, mensagem];
            }
            return prevMensagens;
        });
    };

    const handleMensagensLidas = (conversaId: number) => {
        setConversas(prevConversas => 
            prevConversas.map(conversa => {
                if (conversa.id === conversaId && conversa.mensagens.length > 0) {
                    const updatedMensagens = [...conversa.mensagens];
                    if (updatedMensagens[0].remetente.id === userId) {
                        updatedMensagens[0] = { ...updatedMensagens[0], lida: true };
                    }
                    return { ...conversa, mensagens: updatedMensagens };
                }
                return conversa;
            })
        );

        setMensagensConversa(prev => {
            if (conversaSelecionada && conversaSelecionada.id === conversaId) {
                return prev.map(msg => {
                    if (msg.remetente.id === userId) {
                        return { ...msg, lida: true };
                    }
                    return msg;
                });
            }
            return prev;
        });
    };

    socket.on('nova_mensagem', handleNovaMensagem);
    socket.on('mensagens_lidas', handleMensagensLidas);

    return () => {
        socket.off('nova_mensagem', handleNovaMensagem);
        socket.off('mensagens_lidas', handleMensagensLidas);
    };
  }, [buscarConversas, buscarUsuarios, marcarComoLida, conversaSelecionada]);


  // Funções restantes (mantidas)
  const iniciarConversa = async (outroUsuario: Usuario) => {
    if (!usuarioLogado) return;

    const conversaExistente = conversas.find(c => 
      (c.usuario1.id === usuarioLogado.id && c.usuario2.id === outroUsuario.id) || 
      (c.usuario1.id === outroUsuario.id && c.usuario2.id === usuarioLogado.id)
    );

    if (conversaExistente) {
      selecionarConversa(conversaExistente);
      return;
    }

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
        buscarConversas(usuarioLogado.id);
      }
    } catch (error) {
      console.error('Erro ao iniciar conversa:', error);
    }
  };

  const selecionarConversa = (conversa: Conversa) => {
    setIsNexusChat(false);
    setConversaSelecionada(conversa);
    setMensagensConversa([]);
    
    // Busca mensagens e então marca como lida
    buscarMensagensConversa(conversa.id).then(() => {
        marcarComoLida(conversa.id);
    });
  };

  const fecharChat = () => {
    setIsNexusChat(false);
    setConversaSelecionada(null);
    setNovaMensagem('');
  }

  const enviarMensagem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!novaMensagem.trim() || !usuarioLogado || !conversaSelecionada || isSending) return; 

    setIsSending(true);

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
        const mensagemEnviada = await response.json();
        
        setMensagensConversa(prev => [...prev, { ...mensagemEnviada, lida: false }]); 
        setNovaMensagem('');
        buscarConversas(usuarioLogado.id);
        
        socket.emit('enviar_mensagem', mensagemEnviada);

      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    } finally {
      setIsSending(false);
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

  const iniciarChatNexus = () => {
    setIsNexusChat(true);
    setConversaSelecionada(null);
    if (nexusMensagens.length === 0) {
      setNexusMensagens([{
        id: 1,
        conteudo: `Olá ${usuarioLogado?.nome}! Eu sou a NEXUS IA, sua assistente virtual. Estou aqui para te ajudar com dúvidas sobre seus estudos, tirar questões sobre as matérias e muito mais! 
Como posso te ajudar hoje?`,
        createdAt: new Date().toISOString(),
        isNexus: true
      }]);
    }
  };

  const enviarMensagemNexus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaMensagem.trim() || !usuarioLogado || nexusTyping) return;

    const mensagemUsuario = {
      id: Date.now(),
      conteudo: novaMensagem,
      createdAt: new Date().toISOString(),
      isNexus: false,
      remetente: usuarioLogado
    };

    const mensagemTexto = novaMensagem;
    setNexusMensagens(prev => [...prev, mensagemUsuario]);
    setNovaMensagem('');
    setNexusTyping(true);

    try {
      const response = await fetch('/api/nexus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: mensagemTexto }),
      });

      const data = await response.json();

      if (data.success) {
        const respostaNexus = {
          id: Date.now() + 1,
          conteudo: data.resposta,
          createdAt: new Date().toISOString(),
          isNexus: true
        };
        setNexusMensagens(prev => [...prev, respostaNexus]);
      } else {
        const erroMensagem = {
          id: Date.now() + 1,
          conteudo: data.error || "Ops! Parece que estou com alguns problemas técnicos. Tente novamente em alguns instantes!",
          createdAt: new Date().toISOString(),
          isNexus: true
        };
        setNexusMensagens(prev => [...prev, erroMensagem]);
      }
    } catch (error) {
      console.error('Erro ao comunicar com NEXUS IA:', error);
      const erroMensagem = {
        id: Date.now() + 1,
        conteudo: "Ops! Parece que estou com alguns problemas técnicos. Tente novamente em alguns instantes!",
        createdAt: new Date().toISOString(),
        isNexus: true
      };
      setNexusMensagens(prev => [...prev, erroMensagem]);
    } finally {
      setNexusTyping(false);
    }
  };

  if (loading || !usuarioLogado) {
    // Renderização de loading/login
    return (
        <div className={`flex flex-col h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
            <DynamicHeader />
            <div className="flex-1 flex items-center justify-center">
                {loading ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                ) : (
                    <div className="text-center">
                        <div className="text-red-600 text-6xl mb-4">&#x1F512;</div>
                        <h2 className={`text-xl font-semibold mb-2 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Login necessário</h2>
                        <p className={`mb-4 transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Faça login para acessar suas conversas</p>
                        <button 
                            onClick={() => window.location.href = '/login'}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Fazer Login
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
  }

  // ===========================================
  // LÓGICA DA LISTA UNIFICADA (ANTES DA RENDERIZAÇÃO)
  // ===========================================
  // Cria uma lista apenas com usuários que TÊM conversas ativas
  const conversasComUsuarios: ItemLista[] = conversas.map(conversa => {
    const outroUsuario = getOutroUsuario(conversa);
    return {
      ...outroUsuario,
      conversaAtiva: conversa,
    };
  });

  // Ordena por data da última mensagem (mais recente primeiro)
  conversasComUsuarios.sort((a, b) => {
    if ('conversaAtiva' in a && 'conversaAtiva' in b && a.conversaAtiva && b.conversaAtiva) {
      return new Date(b.conversaAtiva.updatedAt).getTime() - new Date(a.conversaAtiva.updatedAt).getTime();
    }
    return 0;
  });
  
  const listaUnificada: ItemLista[] = [
      { id: 'nexus', nome: 'NEXUS IA', isNexus: true },
      ...conversasComUsuarios
  ];


  // ===============================================
  // RENDERIZAÇÃO PRINCIPAL - LAYOUT TIPO WHATSAPP
  // ===============================================
  const isNormalChat = !!conversaSelecionada;
  const destinatario = isNormalChat ? getOutroUsuario(conversaSelecionada!) : { nome: 'NEXUS IA' };

  return (
    <ProtectedRoute allowedRoles={['ESTUDANTE', 'PROFESSOR', 'ADMIN']}>
      <div className={`flex flex-col min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <DynamicHeader />
        
        {/* Título Mobile - Visível apenas no mobile quando não há chat selecionado */}
        {!conversaSelecionada && !isNexusChat && (
          <div className="lg:hidden pt-16 pb-3 px-4">
            <h1 className={`text-2xl font-bold text-center transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Conversas
            </h1>
          </div>
        )}
        
        <main className="lg:ml-80 flex-1 relative z-0 animate-fade-in overflow-hidden p-3 sm:p-4 lg:p-6">
          <div className="h-full flex rounded-lg overflow-hidden shadow-xl" style={{ minHeight: 'calc(100vh - 120px)' }}>
            
            {/* SIDEBAR DE CONVERSAS - Oculta no mobile quando há chat selecionado */}
            <div className={`${(conversaSelecionada || isNexusChat) ? 'hidden lg:flex' : 'flex'} flex-col w-full lg:w-[380px] xl:w-[420px] border-r transition-colors duration-300 ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-white'}`}>
              
              {/* Header da Sidebar - Oculto no mobile */}
              <div className={`hidden lg:block p-5 border-b transition-colors duration-300 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h1 className={`text-2xl font-bold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Conversas</h1>
              </div>
              
              {/* Lista de Conversas */}
              <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
                {listaUnificada.map((item) => {
                  
                  if ('isNexus' in item && item.isNexus) {
                    // NEXUS IA
                    return (
                      <div 
                        key={item.id}
                        onClick={iniciarChatNexus}
                        className={`p-5 cursor-pointer transition-colors duration-300 flex items-center gap-4 border-b ${
                          isNexusChat 
                            ? (isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-red-50 border-gray-200')
                            : (isDarkMode ? 'hover:bg-gray-700 border-gray-700' : 'hover:bg-gray-50 border-gray-200')
                        }`}
                      >
                        <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center flex-shrink-0 relative border-2 border-red-500 shadow-lg">
                          <Image src="/maca.png" alt="NEXUS IA" width={32} height={32} unoptimized />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-red-600 text-lg mb-1">NEXUS IA</h3>
                          <p className={`text-sm truncate transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Sua assistente virtual
                          </p>
                        </div>
                        <div className="w-2.5 h-2.5 bg-red-600 rounded-full flex-shrink-0 animate-pulse"></div>
                      </div>
                    );
                  }
                  
                  // Usuários
                  const usuarioItem = item as Usuario & { conversaAtiva?: Conversa };
                  const conversa = usuarioItem.conversaAtiva;
                  const isConversaAtiva = !!conversa;
                  const keyId = isConversaAtiva ? `conversa-${conversa.id}` : `user-${usuarioItem.id}`;
                  const onClickAction = isConversaAtiva ? () => selecionarConversa(conversa!) : () => iniciarConversa(usuarioItem as Usuario);
                  const ultimaMensagem = conversa?.mensagens && conversa.mensagens.length > 0 ? conversa.mensagens[0] : null;
                  const isMinhaMensagem = usuarioLogado && ultimaMensagem?.remetente.id === usuarioLogado.id;
                  const naoLidaDoOutro = ultimaMensagem && !isMinhaMensagem && !ultimaMensagem.lida;
                  const isSelected = conversaSelecionada?.id === conversa?.id;

                  return (
                    <div 
                      key={keyId}
                      onClick={onClickAction}
                      className={`p-5 cursor-pointer transition-colors duration-300 flex items-center gap-4 border-b ${
                        isSelected
                          ? (isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-red-50 border-gray-200')
                          : (isDarkMode ? 'hover:bg-gray-700 border-gray-700' : 'hover:bg-gray-50 border-gray-200')
                      }`}
                    >
                      <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-semibold text-xl">
                          {usuarioItem.nome.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className={`font-semibold text-lg truncate transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {usuarioItem.nome}
                          </h3>
                          {isConversaAtiva && ultimaMensagem && (
                            <span className={`text-xs transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {formatarHora(ultimaMensagem.createdAt)}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          {isConversaAtiva && ultimaMensagem ? (
                            <p className={`text-sm truncate transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {isMinhaMensagem && <span className="mr-1">{ultimaMensagem.lida ? '✓✓' : '✓'}</span>}
                              {ultimaMensagem.conteudo}
                            </p>
                          ) : (
                            <p className={`text-sm transition-colors duration-300 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                              {usuarioItem.curso?.nome || 'Sem curso'}
                            </p>
                          )}
                          
                          {naoLidaDoOutro && (
                            <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center ml-2 flex-shrink-0">
                              <span className="text-white text-xs font-bold">1</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {listaUnificada.length === 1 && ( 
                  <div className={`text-center p-8 transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <div className="text-4xl mb-4">💬</div>
                    <p className="text-sm">Nenhuma conversa iniciada ainda.</p>
                  </div>
                )}
              </div>
              
              {/* Botão Nova Conversa na Sidebar */}
              <div className={`p-5 border-t transition-colors duration-300 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <button
                  onClick={() => setMostrarModalNovaConversa(true)}
                  className="w-full bg-red-600 text-white py-4 rounded-lg hover:bg-red-700 transition-colors font-semibold flex items-center justify-center gap-2 text-base"
                >
                  <span className="text-2xl">+</span> Nova Conversa
                </button>
              </div>
            </div>

            {/* ÁREA DE CHAT - Ocupa o resto do espaço */}
            <div className={`${(conversaSelecionada || isNexusChat) ? 'flex' : 'hidden lg:flex'} flex-1 flex-col transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
              
              {(conversaSelecionada || isNexusChat) ? (
                <>
                  {/* Header do Chat */}
                  <div className={`p-5 border-b flex items-center gap-4 transition-colors duration-300 ${
                    isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
                  }`}>
                    <button 
                      onClick={fecharChat} 
                      className="lg:hidden text-red-600 hover:text-red-800 transition-colors text-3xl font-bold"
                    >
                      ←
                    </button>
                    
                    {isNexusChat ? (
                      <>
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border-2 border-red-500">
                          <Image src="/maca.png" alt="NEXUS IA" width={28} height={28} unoptimized />
                        </div>
                        <div>
                          <h3 className="font-semibold text-red-600 text-lg">NEXUS IA</h3>
                          <span className="text-sm text-gray-500">Assistente Virtual</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-xl">
                            {destinatario.nome.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <h3 className={`font-semibold text-xl transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {destinatario.nome}
                        </h3>
                      </>
                    )}
                  </div>
                  
                  {/* Corpo do Chat - Mensagens */}
                  <div className="flex-1 overflow-y-auto p-4 scroll-smooth scrollbar-thin scrollbar-thumb-red-500 scrollbar-track-gray-200 dark:scrollbar-track-gray-700">
                    {isNexusChat ? (
                      <div className="space-y-4 min-h-full flex flex-col justify-end">
                        {nexusMensagens.map((mensagem) => (
                          <div key={mensagem.id} className={`flex ${mensagem.isNexus ? 'justify-start' : 'justify-end'}`}>
                            <div className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-2 rounded-lg ${mensagem.isNexus ? (isDarkMode ? 'bg-gradient-to-r from-red-600 to-red-700 text-white' : 'bg-gradient-to-r from-red-500 to-red-600 text-white') : 'bg-gray-600 text-white'}`}>
                              <p className="text-sm break-words whitespace-pre-wrap">{mensagem.conteudo}</p>
                              <p className={`text-xs mt-1 ${mensagem.isNexus ? 'text-red-200' : 'text-gray-200'}`}>{formatarHora(mensagem.createdAt)}</p>
                            </div>
                          </div>
                        ))}
                        {nexusTyping && (
                          <div className="flex justify-start">
                            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gradient-to-r from-red-600 to-red-700 text-white' : 'bg-gradient-to-r from-red-500 to-red-600 text-white'}`}>
                              <div className="flex items-center space-x-2">
                                <div className="flex space-x-1">
                                  <div className="w-2 h-2 bg-red-200 rounded-full animate-bounce"></div>
                                  <div className="w-2 h-2 bg-red-200 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                  <div className="w-2 h-2 bg-red-200 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                </div>
                                <span className="text-xs text-red-200">NEXUS IA está digitando...</span>
                              </div>
                            </div>
                          </div>
                        )}
                        <div ref={messagesEndRef} />
                      </div>
                    ) : (
                      mensagensConversa.length === 0 ? (
                        <div className={`h-full flex items-center justify-center transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          <div className="text-center">
                            <div className="text-6xl mb-4">👋</div>
                            <p className="text-lg">Comece uma conversa!</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4 min-h-full flex flex-col justify-end">
                          {mensagensConversa.map((mensagem) => {
                            const isRemetente = mensagem.remetente.id === usuarioLogado.id;
                            
                            return (
                              <div key={mensagem.id} className={`flex ${isRemetente ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-2 rounded-lg ${isRemetente ? 'bg-red-600 text-white' : (isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800')}`}>
                                  <p className="text-sm break-words">{mensagem.conteudo}</p>
                                  <div className={`text-xs mt-1 flex items-center justify-end gap-1 ${isRemetente ? 'text-red-200' : (isDarkMode ? 'text-gray-400' : 'text-gray-500')}`}>
                                    <span>{formatarHora(mensagem.createdAt)}</span>
                                    {isRemetente && (
                                      <span className={mensagem.lida ? 'text-blue-400' : 'text-gray-300'}>
                                        {mensagem.lida ? '✓✓' : '✓'}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                          <div ref={messagesEndRef} />
                        </div>
                      )
                    )}
                  </div>
                  
                  {/* Campo de Envio */}
                  <div className={`p-4 border-t transition-colors duration-300 ${
                    isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
                  }`}>
                    <form onSubmit={isNexusChat ? enviarMensagemNexus : enviarMensagem} className="flex gap-2">
                      <input 
                        type="text" 
                        value={novaMensagem} 
                        onChange={(e) => setNovaMensagem(e.target.value)} 
                        placeholder={isNexusChat ? "Faça uma pergunta para a NEXUS IA..." : "Digite sua mensagem..."}
                        disabled={isSending || nexusTyping}
                        className={`flex-1 px-4 py-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-300 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-black placeholder-gray-500'}`} 
                      />
                      <button 
                        type="submit" 
                        disabled={!novaMensagem.trim() || isSending || nexusTyping}
                        className="bg-red-600 text-white px-6 py-3 rounded-full hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold"
                      >
                        {isSending || nexusTyping ? '...' : '➤'}
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                // Mensagem de boas-vindas quando nenhum chat está selecionado (Desktop)
                <div className={`h-full flex items-center justify-center transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <div className="text-center">
                    <div className="text-8xl mb-6">💬</div>
                    <h2 className="text-2xl font-semibold mb-2">Nexus Conversas</h2>
                    <p className="text-lg">Selecione uma conversa para começar</p>
                  </div>
                </div>
              )}
            </div>

          </div>
        </main>

        {/* Modal de Nova Conversa */}
        {mostrarModalNovaConversa && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`rounded-lg shadow-2xl max-w-md w-full max-h-[80vh] flex flex-col transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`p-4 border-b flex items-center justify-between transition-colors duration-300 ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                <h2 className={`text-xl font-semibold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Nova Conversa</h2>
                <button
                  onClick={() => setMostrarModalNovaConversa(false)}
                  className={`text-2xl transition-colors duration-300 ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-800'}`}
                >
                  ×
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {usuarios.length === 0 ? (
                  <div className={`text-center py-8 transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <p>Nenhum usuário disponível</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {usuarios.map((usuario) => {
                      const jaTemConversa = conversas.some(c => 
                        (c.usuario1.id === usuario.id && c.usuario2.id === usuarioLogado?.id) || 
                        (c.usuario1.id === usuarioLogado?.id && c.usuario2.id === usuario.id)
                      );

                      return (
                        <div
                          key={usuario.id}
                          onClick={() => {
                            iniciarConversa(usuario);
                            setMostrarModalNovaConversa(false);
                          }}
                          className={`p-3 rounded-lg cursor-pointer transition-colors duration-300 flex items-center gap-3 ${
                            isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                          }`}
                        >
                          <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-semibold text-lg">
                              {usuario.nome.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className={`font-semibold truncate transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {usuario.nome}
                            </h3>
                            <p className={`text-sm truncate transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {usuario.curso?.nome || 'Sem curso'}
                            </p>
                          </div>
                          {jaTemConversa && (
                            <span className="text-xs text-red-600 font-semibold">Ativa</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}