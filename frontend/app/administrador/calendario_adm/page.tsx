'use client';

import React, { useState, useEffect } from 'react';
import Header from '../../components/header_adm';
import Footer from '../../components/footer';
import Image from 'next/image';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { useSidebar } from '../../contexts/SidebarContext';
import { apiUrl } from '@/lib/api';

interface CalendarioEvento {
  id: number;
  titulo: string;
  descricao: string;
  data: string;
}

export default function CalendarioAdm() {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [data, setData] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [eventos, setEventos] = useState<CalendarioEvento[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Sidebar removido para evitar bug de deslocamento lateral

  // Carregar eventos existentes
  useEffect(() => {
    fetchEventos();
  }, []);

  const fetchEventos = async () => {
    try {
      // Buscar eventos dos próximos 30 dias
      const hoje = new Date();
      const futuro = new Date();
      futuro.setDate(hoje.getDate() + 30);

      const response = await fetch(apiUrl(`/calendario?inicio=${hoje.toISOString()}&fim=${futuro.toISOString()}`));
      if (response.ok) {
        const data = await response.json();
        setEventos(data);
      }
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!titulo.trim() || !descricao.trim() || !data) {
      setMessage('Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Converter a data para o formato correto, mantendo o fuso horário local
      // O input date retorna YYYY-MM-DD, precisamos criar a data corretamente
      const [ano, mes, dia] = data.split('-').map(Number);
      const dataEvento = new Date(ano, mes - 1, dia, 12, 0, 0); // Meio-dia para evitar problemas de fuso horário

      const response = await fetch(apiUrl('/calendario'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          titulo,
          descricao,
          data: dataEvento.toISOString(),
        }),
      });

      if (response.ok) {
        const novoEvento = await response.json();
        setMessage('Evento criado com sucesso!');
        setTitulo('');
        setDescricao('');
        setData('');
        // Fechar modal após 1 segundo
        setTimeout(() => {
          setIsModalOpen(false);
          setMessage('');
        }, 1000);
        
        // Recarregar eventos
        fetchEventos();
      } else {
        const errorData = await response.json();
        setMessage(`Erro ao criar evento: ${errorData.message || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      setMessage('Erro ao conectar com o servidor. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setTitulo('');
    setDescricao('');
    setData('');
    setMessage('');
  };

  const openModal = () => {
    setIsModalOpen(true);
    setMessage('');
  };

  const closeModal = () => {
    setIsModalOpen(false);
    handleClear();
  };

  const formatarData = (dataString: string) => {
    return new Date(dataString).toLocaleDateString('pt-BR');
  };

  // Data mínima é hoje
  const dataMinima = new Date().toISOString().split('T')[0];

  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <div className="min-h-screen flex flex-col" style={{backgroundImage: 'url(/fundo.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed'}}>
        <Header />
        
        {/* Título Mobile - Visível apenas no mobile */}
        <div className="lg:hidden pt-16 pb-4 px-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-center mb-2 transition-colors duration-300 text-white">
            Calendário ADM
          </h1>
          <p className="text-center text-sm transition-colors duration-300 text-gray-200">
            Gerencie eventos do calendário
          </p>
        </div>
        
        <main className="flex-1 container mx-auto p-2 sm:p-3 md:p-4 lg:p-6 py-3 sm:py-4 md:py-6 lg:py-8 animate-fade-in transition-all duration-300">
        <div className="max-w-4xl mx-auto">
          {/* Cabeçalho da página - Oculto no mobile */}
          <div className="hidden lg:block rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 lg:mb-8 bg-white/10 backdrop-blur-lg border border-white/20">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 text-center transition-colors duration-300 text-white">
              Calendário - Painel ADM
            </h1>
            <p className="text-xs sm:text-sm lg:text-base text-center transition-colors duration-300 text-gray-200">
              Gerencie eventos da comunidade
            </p>
          </div>

          {/* Lista de eventos */}
          <div className="rounded-2xl shadow-2xl p-3 sm:p-4 md:p-6 lg:p-8 bg-white/10 backdrop-blur-lg border border-white/20">
            <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold mb-3 sm:mb-4 md:mb-6 transition-colors duration-300 text-white">
              Próximos Eventos
            </h2>
            
            <div className="space-y-2.5 sm:space-y-3 md:space-y-4">
              {eventos.length === 0 ? (
                <div className="text-center py-6 sm:py-8 md:py-10 text-gray-300">
                  <div className="text-3xl sm:text-4xl md:text-5xl mb-2.5 sm:mb-3 md:mb-4">📅</div>
                  <p className="text-sm sm:text-base md:text-lg font-semibold">Nenhum evento encontrado</p>
                  <p className="text-xs sm:text-sm mt-1.5 sm:mt-2">Clique no botão &quot;+&quot; para criar o primeiro evento!</p>
                </div>
              ) : (
                eventos.slice(0, 8).map((evento) => (
                  <div key={evento.id} className="p-3 sm:p-4 md:p-5 rounded-xl bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01]">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1.5 sm:gap-2 md:gap-3 mb-2 sm:mb-3">
                      <h3 className="font-bold text-sm sm:text-base md:text-lg text-white">
                        {evento.titulo}
                      </h3>
                      <span className="text-xs sm:text-sm bg-blue-600/80 text-white px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full font-semibold shadow-md w-fit whitespace-nowrap">
                        {formatarData(evento.data)}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm md:text-base whitespace-pre-wrap text-gray-200">
                      {evento.descricao}
                    </p>
                  </div>
                ))
              )}
            </div>
            
            {eventos.length > 8 && (
              <div className="text-center mt-4 sm:mt-5 md:mt-6">
                <a 
                  href="/calendario" 
                  className="text-blue-400 hover:text-blue-300 text-xs sm:text-sm md:text-base font-bold hover:underline transition-all duration-300 inline-block"
                >
                  Ver todos os eventos →
                </a>
              </div>
            )}
          </div>

          {/* Informações adicionais */}
          <div className={`border rounded-lg p-3 sm:p-4 md:p-5 mt-4 sm:mt-5 md:mt-6 ${
            isDarkMode 
              ? 'bg-blue-900/20 border-blue-700/50' 
              : 'bg-blue-50 border-blue-200'
          }`}>
            <h3 className="text-xs sm:text-sm font-bold mb-2 text-blue-300">Dicas:</h3>
            <ul className="text-xs sm:text-sm space-y-0.5 sm:space-y-1 text-blue-200">
              <li>• Use títulos claros e descritivos</li>
              <li>• Inclua: horário, local, o que trazer</li>
              <li>• Para eventos recorrentes, crie um para cada data</li>
              <li>• Seja claro e objetivo</li>
            </ul>
          </div>
        </div>
      </main>

      {/* Botão flutuante para adicionar evento */}
      <button
        onClick={openModal}
        className="fixed bottom-5 sm:bottom-6 md:bottom-8 right-5 sm:right-6 md:right-8 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white p-4 sm:p-5 hover:cursor-pointer rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-40 transform hover:scale-110 active:scale-95"
        title="Adicionar novo evento"
      >
        <Image 
          src="/lapis.png" 
          alt="Adicionar evento" 
          width={24} 
          height={24}
          className="w-6 h-6 sm:w-7 sm:h-7"
        />
      </button>

      {/* Modal para adicionar evento */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="rounded-2xl shadow-2xl max-w-lg w-full max-h-[95vh] overflow-y-auto border bg-gray-900/95 backdrop-blur-xl border-gray-700">
            {/* Header da modal */}
            <div className="flex justify-between items-center p-3 sm:p-4 md:p-6 border-b border-gray-700">
              <div>
                <h2 className="text-base sm:text-lg md:text-2xl font-bold text-white">
                  Adicionar Evento
                </h2>
                <p className="text-xs sm:text-sm mt-0.5 sm:mt-1 text-gray-400">Preencha os detalhes</p>
              </div>
              <button
                onClick={closeModal}
                className="p-1.5 sm:p-2 rounded-full transition-all duration-300 flex-shrink-0 hover:bg-white/10 text-white"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Conteúdo da modal */}
            <div className="p-3 sm:p-4 md:p-6">
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                <div>
                  <label htmlFor="titulo" className="block text-xs sm:text-sm font-bold mb-1.5 sm:mb-2 text-white">
                    Título *
                  </label>
                  <input
                    type="text"
                    id="titulo"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-all duration-300 bg-gray-800 border-2 border-gray-600 text-white placeholder-gray-400"
                    placeholder="Ex: Reunião..."
                    maxLength={100}
                  />
                  <div className="text-xs mt-1 font-semibold text-gray-300">
                    {titulo.length}/100
                  </div>
                </div>

                <div>
                  <label htmlFor="descricao" className="block text-xs sm:text-sm font-bold mb-1.5 sm:mb-2 text-white">
                    Descrição *
                  </label>
                  <textarea
                    id="descricao"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    rows={3}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-medium transition-all duration-300 bg-gray-800 border-2 border-gray-600 text-white placeholder-gray-400"
                    placeholder="Detalhes do evento..."
                    maxLength={500}
                  />
                  <div className="text-xs mt-1 font-semibold text-gray-300">
                    {descricao.length}/500
                  </div>
                </div>

                <div>
                  <label htmlFor="data" className="block text-xs sm:text-sm font-bold mb-1.5 sm:mb-2 text-white">
                    Data *
                  </label>
                  <input
                    type="date"
                    id="data"
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                    min={dataMinima}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-all duration-300 bg-gray-800 border-2 border-gray-600 text-white [color-scheme:dark]"
                  />
                </div>

                {/* Mensagem de feedback */}
                {message && (
                  <div className={`p-2.5 sm:p-3 md:p-4 rounded-lg text-xs sm:text-sm font-semibold shadow-lg ${
                    message.includes('sucesso') 
                      ? 'bg-green-600/20 text-green-100 border-2 border-green-500/30' 
                      : 'bg-red-600/20 text-red-100 border-2 border-red-500/30'
                  }`}>
                    {message}
                  </div>
                )}

                {/* Botões */}
                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={loading || !titulo.trim() || !descricao.trim() || !data}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg text-sm sm:text-base font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {loading ? 'Criando...' : 'Criar'}
                  </button>
                  
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-3 sm:px-4 py-2.5 sm:py-3 border-2 rounded-lg text-sm sm:text-base font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] border-white/30 text-white hover:bg-white/10"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <Footer />
      </div>
    </ProtectedRoute>
  );
}