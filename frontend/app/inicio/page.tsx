'use client';

import React, { useState, useEffect } from 'react';
import DynamicHeader from '../components/DynamicHeader';
import { useDarkMode } from '../contexts/DarkModeContext';
import { useSidebar } from '../contexts/SidebarContext';
import ProtectedRoute from '../components/ProtectedRoute';

interface Usuario {
  id: number;
  nome: string;
  tipo: string;
  curso?: { nome: string };
}

interface Mensagem {
  id: number;
  conteudo: string;
  createdAt: string;
  tipoPublico: string;
}

interface Evento {
  id: number;
  titulo: string;
  dataEvento: string;
}

interface Conversa {
  id: number;
  mensagens: Array<{
    conteudo: string;
    lida: boolean;
    remetente: { id: number };
  }>;
}

export default function InicioPage() {
  const [usuarioLogado, setUsuarioLogado] = useState<Usuario | null>(null);
  const [avisosNovos, setAvisosNovos] = useState(0);
  const [eventosProximos, setEventosProximos] = useState(0);
  const [mensagensNaoLidas, setMensagensNaoLidas] = useState(0);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [ultimasAtividades, setUltimasAtividades] = useState<any[]>([]);
  const { isDarkMode } = useDarkMode();
  const { isSidebarOpen } = useSidebar();

  useEffect(() => {
    const dadosUsuario = localStorage.getItem('usuarioLogado');
    if (dadosUsuario) {
      const usuario = JSON.parse(dadosUsuario);
      setUsuarioLogado(usuario);
      carregarDashboard(usuario);
    }
  }, []);

  const carregarDashboard = async (usuario: Usuario) => {
    try {
      // Buscar avisos novos (últimas 24h)
      const resAvisos = await fetch('http://localhost:3000/mensagens');
      if (resAvisos.ok) {
        const avisos: Mensagem[] = await resAvisos.json();
        const agora = new Date();
        const ultimoDia = new Date(agora.getTime() - 24 * 60 * 60 * 1000);
        const novos = avisos.filter(a => new Date(a.createdAt) > ultimoDia);
        setAvisosNovos(novos.length);
        
        // Adicionar às atividades recentes
        const atividadesAvisos = novos.slice(0, 3).map(aviso => ({
          tipo: 'aviso',
          titulo: 'Novo aviso da Administração',
          descricao: aviso.conteudo.substring(0, 60) + '...',
          tempo: calcularTempoDecorrido(aviso.createdAt)
        }));
        setUltimasAtividades(prev => [...prev, ...atividadesAvisos]);
      }

      // Buscar eventos próximos (próxima semana)
      const resEventos = await fetch('http://localhost:3000/eventos');
      if (resEventos.ok) {
        const eventos: Evento[] = await resEventos.json();
        const agora = new Date();
        const proximaSemana = new Date(agora.getTime() + 7 * 24 * 60 * 60 * 1000);
        const proximos = eventos.filter(e => {
          const dataEvento = new Date(e.dataEvento);
          return dataEvento > agora && dataEvento < proximaSemana;
        });
        setEventosProximos(proximos.length);
      }

      // Buscar conversas não lidas
      const resConversas = await fetch(`http://localhost:3000/conversas/${usuario.id}`);
      if (resConversas.ok) {
        const conversas: Conversa[] = await resConversas.json();
        let naoLidas = 0;
        conversas.forEach(conversa => {
          conversa.mensagens.forEach(msg => {
            if (!msg.lida && msg.remetente.id !== usuario.id) {
              naoLidas++;
            }
          });
        });
        setMensagensNaoLidas(naoLidas);
      }



    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    }
  };

  const calcularTempoDecorrido = (data: string) => {
    const agora = new Date();
    const dataPassada = new Date(data);
    const diff = agora.getTime() - dataPassada.getTime();
    const horas = Math.floor(diff / (1000 * 60 * 60));
    
    if (horas < 1) return 'Há poucos minutos';
    if (horas < 24) return `Há ${horas} hora${horas > 1 ? 's' : ''}`;
    const dias = Math.floor(horas / 24);
    return `Há ${dias} dia${dias > 1 ? 's' : ''}`;
  };

  if (!usuarioLogado) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['ESTUDANTE', 'PROFESSOR', 'ADMIN']}>
      <div 
        className="min-h-screen"
        style={{
          backgroundImage: 'url(/fundo.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
        }}
      >
        <DynamicHeader />
        
        <main className={`transition-all duration-300 pt-16 pb-8 px-4 sm:px-6 lg:px-8 animate-fade-in ${
          isSidebarOpen ? 'lg:ml-80' : 'lg:ml-0'
        }`}>
          {/* Header da Dashboard */}
          <div className="mb-8">
            <div className="flex flex-col items-center text-center">
              <h1 className={`text-3xl sm:text-4xl font-bold mb-2 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Olá, {usuarioLogado.nome.split(' ')[0]}! 👋
              </h1>
              <p className={`text-sm sm:text-base transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Aqui está o resumo das suas atividades
              </p>
            </div>
          </div>

          {/* Cards de Estatísticas - Estilo Moderno */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
            {/* Card Avisos */}
            <div className={`group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] ${
              isDarkMode ? 'bg-gradient-to-br from-red-900/40 to-red-950/40 backdrop-blur-md border border-red-800/50' : 'bg-gradient-to-br from-red-50 to-white backdrop-blur-md border border-red-100'
            } shadow-xl hover:shadow-2xl`}>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    isDarkMode ? 'bg-red-500/20' : 'bg-red-100'
                  } group-hover:scale-110 transition-transform`}>
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  {avisosNovos > 0 && (
                    <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                      Novo
                    </span>
                  )}
                </div>
                <h3 className={`text-4xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {avisosNovos}
                </h3>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Avisos Novos
                </p>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            </div>

            {/* Card Eventos */}
            <div className={`group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] ${
              isDarkMode ? 'bg-gradient-to-br from-blue-900/40 to-blue-950/40 backdrop-blur-md border border-blue-800/50' : 'bg-gradient-to-br from-blue-50 to-white backdrop-blur-md border border-blue-100'
            } shadow-xl hover:shadow-2xl`}>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100'
                  } group-hover:scale-110 transition-transform`}>
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  {eventosProximos > 0 && (
                    <span className="px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-full">
                      {eventosProximos}
                    </span>
                  )}
                </div>
                <h3 className={`text-4xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {eventosProximos}
                </h3>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Eventos Esta Semana
                </p>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            </div>

            {/* Card Mensagens */}
            <div className={`group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] ${
              isDarkMode ? 'bg-gradient-to-br from-purple-900/40 to-purple-950/40 backdrop-blur-md border border-purple-800/50' : 'bg-gradient-to-br from-purple-50 to-white backdrop-blur-md border border-purple-100'
            } shadow-xl hover:shadow-2xl`}>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    isDarkMode ? 'bg-purple-500/20' : 'bg-purple-100'
                  } group-hover:scale-110 transition-transform`}>
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  {mensagensNaoLidas > 0 && (
                    <span className="px-3 py-1 bg-purple-500 text-white text-xs font-bold rounded-full animate-pulse">
                      {mensagensNaoLidas}
                    </span>
                  )}
                </div>
                <h3 className={`text-4xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {mensagensNaoLidas}
                </h3>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Mensagens Não Lidas
                </p>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Acesso Rápido - 2 colunas */}
            <div className="lg:col-span-2">
              <div className={`rounded-2xl p-6 ${
                isDarkMode ? 'bg-gray-800/50 backdrop-blur-md border border-gray-700' : 'bg-white/50 backdrop-blur-md border border-gray-200'
              } shadow-xl`}>
                <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Acesso Rápido
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <a
                    href="/mural"
                    className={`group p-4 rounded-xl transition-all duration-300 hover:scale-105 ${
                      isDarkMode ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:bg-white hover:shadow-lg'
                    } border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                      isDarkMode ? 'bg-red-500/20' : 'bg-red-100'
                    } group-hover:scale-110 transition-transform`}>
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </div>
                    <h3 className={`font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Mural de Avisos
                    </h3>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Ver notícias e comunicados
                    </p>
                  </a>

                  <a
                    href="/calendario"
                    className={`group p-4 rounded-xl transition-all duration-300 hover:scale-105 ${
                      isDarkMode ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:bg-white hover:shadow-lg'
                    } border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                      isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100'
                    } group-hover:scale-110 transition-transform`}>
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className={`font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Calendário
                    </h3>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Eventos e datas importantes
                    </p>
                  </a>

                  <a
                    href="/conversas"
                    className={`group p-4 rounded-xl transition-all duration-300 hover:scale-105 ${
                      isDarkMode ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:bg-white hover:shadow-lg'
                    } border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                      isDarkMode ? 'bg-purple-500/20' : 'bg-purple-100'
                    } group-hover:scale-110 transition-transform`}>
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <h3 className={`font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Conversas
                    </h3>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Mensagens e chat
                    </p>
                  </a>

                  <a
                    href="/perfil"
                    className={`group p-4 rounded-xl transition-all duration-300 hover:scale-105 ${
                      isDarkMode ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:bg-white hover:shadow-lg'
                    } border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                      isDarkMode ? 'bg-green-500/20' : 'bg-green-100'
                    } group-hover:scale-110 transition-transform`}>
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h3 className={`font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Meu Perfil
                    </h3>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Configurações e dados
                    </p>
                  </a>
                </div>
              </div>
            </div>

            {/* Atividades Recentes - 1 coluna */}
            <div className="lg:col-span-1">
              <div className={`rounded-2xl p-6 h-full ${
                isDarkMode ? 'bg-gray-800/50 backdrop-blur-md border border-gray-700' : 'bg-white/50 backdrop-blur-md border border-gray-200'
              } shadow-xl`}>
                <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Atividades Recentes
                </h2>
                {ultimasAtividades.length > 0 ? (
                  <div className="space-y-4">
                    {ultimasAtividades.slice(0, 5).map((atividade, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-xl transition-all duration-300 hover:scale-[1.02] ${
                          isDarkMode ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:bg-white'
                        } border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className={`font-semibold text-sm mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {atividade.titulo}
                            </h3>
                            <p className={`text-xs mb-1 line-clamp-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {atividade.descricao}
                            </p>
                            <p className="text-xs text-red-500 font-medium">{atividade.tempo}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64">
                    <div className="w-20 h-20 bg-gray-700/30 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Nenhuma atividade recente
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

