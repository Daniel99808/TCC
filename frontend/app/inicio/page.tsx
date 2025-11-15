'use client';

import React, { useState, useEffect } from 'react';
import DynamicHeader from '../components/DynamicHeader';
import { useDarkMode } from '../contexts/DarkModeContext';
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

  const [ultimasAtividades, setUltimasAtividades] = useState<any[]>([]);
  const { isDarkMode } = useDarkMode();

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
      <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <DynamicHeader />
        
        {/* Título Mobile - Visível apenas no mobile */}
        <div className="lg:hidden pt-16 pb-3 px-4">
          <h1 className={`text-xl font-bold text-center mb-1 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Bem-vindo, {usuarioLogado.nome.split(' ')[0]}! 👋
          </h1>
          <p className={`text-center text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Resumo das suas atividades
          </p>
        </div>
        
        <main className="lg:ml-80 p-3 sm:p-4 md:p-6 lg:p-8 animate-fade-in">
          {/* Cabeçalho de Boas-vindas - Oculto no mobile */}
          <div className="mb-4 sm:mb-6 md:mb-8 px-1 hidden lg:block">
            <h1 className={`text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Bem-vindo, {usuarioLogado.nome.split(' ')[0]}! 👋
            </h1>
            <p className={`text-xs sm:text-sm md:text-base transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Aqui está um resumo das suas atividades acadêmicas
            </p>
          </div>

          {/* Cards de Estatísticas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
            {/* Avisos Novos */}
            <div className={`rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            } shadow-lg`}>
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className={`w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-lg flex items-center justify-center ${
                  isDarkMode ? 'bg-red-600/20' : 'bg-red-100'
                }`}>
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
              </div>
              <h3 className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-1 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                {avisosNovos}
              </h3>
              <p className={`text-xs sm:text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Avisos Novos
              </p>
            </div>

            {/* Eventos Esta Semana */}
            <div className={`rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            } shadow-lg`}>
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className={`w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-lg flex items-center justify-center ${
                  isDarkMode ? 'bg-blue-600/20' : 'bg-blue-100'
                }`}>
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
              <h3 className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-1 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                {eventosProximos}
              </h3>
              <p className={`text-xs sm:text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Eventos Esta Semana
              </p>
            </div>

            {/* Mensagens */}
            <div className={`rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            } shadow-lg`}>
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className={`w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-lg flex items-center justify-center ${
                  isDarkMode ? 'bg-purple-600/20' : 'bg-purple-100'
                }`}>
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <h3 className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-1 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                {mensagensNaoLidas}
              </h3>
              <p className={`text-xs sm:text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Mensagens
              </p>
            </div>


          </div>

          {/* Acesso Rápido */}
          <div className="mb-6 sm:mb-8">
            <h2 className={`text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 md:mb-6 px-1 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Acesso Rápido
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
              {/* Mural de Avisos */}
              <a
                href="/mural"
                className={`rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 transition-all duration-300 hover:scale-105 active:scale-95 ${
                  isDarkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:shadow-xl'
                } shadow-lg cursor-pointer`}
              >
                <div className={`w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-lg flex items-center justify-center mb-3 sm:mb-4 ${
                  isDarkMode ? 'bg-red-600/20' : 'bg-red-100'
                }`}>
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className={`text-sm sm:text-base md:text-lg font-semibold mb-1 sm:mb-2 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Mural de Avisos
                </h3>
                <p className={`text-xs sm:text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Últimas notícias e comunicados
                </p>
              </a>

              {/* Calendário */}
              <a
                href="/calendario"
                className={`rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 transition-all duration-300 hover:scale-105 active:scale-95 ${
                  isDarkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:shadow-xl'
                } shadow-lg cursor-pointer`}
              >
                <div className={`w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-lg flex items-center justify-center mb-3 sm:mb-4 ${
                  isDarkMode ? 'bg-blue-600/20' : 'bg-blue-100'
                }`}>
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className={`text-sm sm:text-base md:text-lg font-semibold mb-1 sm:mb-2 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Calendário
                </h3>
                <p className={`text-xs sm:text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Eventos e datas importantes
                </p>
              </a>

              {/* Conversas */}
              <a
                href="/conversas"
                className={`rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 transition-all duration-300 hover:scale-105 active:scale-95 ${
                  isDarkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:shadow-xl'
                } shadow-lg cursor-pointer`}
              >
                <div className={`w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-lg flex items-center justify-center mb-3 sm:mb-4 ${
                  isDarkMode ? 'bg-purple-600/20' : 'bg-purple-100'
                }`}>
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className={`text-sm sm:text-base md:text-lg font-semibold mb-1 sm:mb-2 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Conversas
                </h3>
                <p className={`text-xs sm:text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Mensagens e chat
                </p>
              </a>
            </div>
          </div>

          {/* Atividades Recentes */}
          <div>
            <h2 className={`text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 md:mb-6 px-1 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Atividades Recentes
            </h2>
            <div className={`rounded-lg sm:rounded-xl overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              {ultimasAtividades.length > 0 ? (
                <div className="divide-y divide-gray-700">
                  {ultimasAtividades.map((atividade, index) => (
                    <div key={index} className="p-3 sm:p-4 md:p-6 hover:bg-gray-700/30 transition-colors cursor-pointer">
                      <div className="flex items-start gap-2 sm:gap-3 md:gap-4">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-xs sm:text-sm md:text-base">A</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-semibold mb-0.5 sm:mb-1 text-xs sm:text-sm md:text-base transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                            {atividade.titulo}
                          </h3>
                          <p className={`text-xs sm:text-sm mb-0.5 sm:mb-1 transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} line-clamp-2`}>
                            {atividade.descricao}
                          </p>
                          <p className="text-xs text-gray-500">{atividade.tempo}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 sm:p-8 md:p-12 text-center">
                  <div className="text-3xl sm:text-4xl md:text-5xl mb-2 sm:mb-3 md:mb-4">📋</div>
                  <p className={`text-xs sm:text-sm md:text-base transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Nenhuma atividade recente
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
