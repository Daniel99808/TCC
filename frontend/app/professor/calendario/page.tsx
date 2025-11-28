'use client';

import React, { useState, useEffect } from 'react';
import HeaderProfessor from '../../components/header_professor';
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

export default function CalendarioProfessor() {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [data, setData] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [eventos, setEventos] = useState<CalendarioEvento[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isDarkMode } = useDarkMode();
  const { isSidebarOpen } = useSidebar();

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
      const [ano, mes, dia] = data.split('-').map(Number);
      const dataEvento = new Date(ano, mes - 1, dia, 12, 0, 0);

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
    <ProtectedRoute allowedRoles={['PROFESSOR']}>
      <div className="min-h-screen flex flex-col pt-16 lg:pt-0" style={{backgroundImage: 'url(/fundo.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed'}}>
        <HeaderProfessor />
        
        <main className={`flex-1 container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 animate-fade-in transition-all duration-300 ${isSidebarOpen ? 'lg:ml-[360px]' : 'lg:ml-0'}`}>
        <div className="max-w-4xl mx-auto">
          {/* Cabeçalho da página */}
          <div className="rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 bg-white/10 backdrop-blur-lg border border-white/20">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 transition-colors duration-300 text-center text-white">
              Painel do Professor - Calendário
            </h1>
            <p className="text-sm sm:text-base lg:text-lg transition-colors duration-300 text-center text-gray-200">
              Publique eventos no calendário da comunidade
            </p>
          </div>

          {/* Lista de eventos */}
          <div className="rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 bg-white/10 backdrop-blur-lg border border-white/20">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4 sm:mb-6 transition-colors duration-300 text-white">
              Próximos Eventos
            </h2>
            
            <div className="space-y-4">
              {eventos.length === 0 ? (
                <div className="text-center py-8 transition-colors duration-300 text-gray-300">
                  <p className="text-lg font-semibold">Nenhum evento encontrado</p>
                  <p className="text-sm mt-2">Clique no botão &quot;+&quot; para criar o primeiro evento!</p>
                </div>
              ) : (
                eventos.slice(0, 8).map((evento) => (
                  <div key={evento.id} className="p-4 sm:p-5 rounded-xl bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01]">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                      <h3 className="font-bold text-base sm:text-lg text-white">
                        {evento.titulo}
                      </h3>
                      <span className="text-xs sm:text-sm bg-red-600/80 text-white px-3 py-1 rounded-full font-semibold shadow-md w-fit">
                        {formatarData(evento.data)}
                      </span>
                    </div>
                    <p className="text-sm sm:text-base whitespace-pre-wrap text-gray-200">
                      {evento.descricao}
                    </p>
                  </div>
                ))
              )}
            </div>
            
            {eventos.length > 8 && (
              <div className="text-center mt-6">
                <a 
                  href="/calendario" 
                  className="text-red-600 hover:text-red-700 text-sm sm:text-base font-bold hover:underline transition-all duration-300"
                >
                  Ver todos os eventos →
                </a>
              </div>
            )}
          </div>

          {/* Informações adicionais */}
          <div className="bg-red-600/20 backdrop-blur-sm border border-red-500/30 rounded-xl p-4 sm:p-5 mt-6 shadow-lg">
            <h3 className="text-sm sm:text-base font-bold mb-3 text-red-300">Dicas para criar eventos:</h3>
            <ul className="text-sm space-y-2 text-red-200">
              <li>• Use títulos claros e descritivos</li>
              <li>• Inclua informações importantes: horário, local, o que trazer</li>
              <li>• Para eventos recorrentes, crie um evento para cada data</li>
              <li>• Evite abreviações - seja claro e objetivo</li>
            </ul>
          </div>
        </div>
      </main>

      {/* Botão flutuante para adicionar evento */}
      <button
        onClick={openModal}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-2xl hover:shadow-red-500/50 transition-all duration-300 z-50 flex items-center justify-center hover:scale-110 active:scale-95 group"
        title="Adicionar novo evento"
      >
        <svg className="w-6 h-6 sm:w-7 sm:h-7 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Modal para adicionar evento */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Header da modal */}
            <div className="flex justify-between items-center p-6 border-b border-white/20">
              <div>
                <h2 className={`text-xl sm:text-2xl font-bold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Novo Evento
                </h2>
                <p className={`text-xs sm:text-sm mt-1 transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Preencha os detalhes do evento</p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 rounded-full hover:bg-white/10 transition-all duration-300 text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Conteúdo da modal */}
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="titulo" className={`block text-sm font-bold mb-2 transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-800'
                  }`}>
                    Título do Evento *
                  </label>
                  <input
                    type="text"
                    id="titulo"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 font-medium transition-all duration-300 ${
                      isDarkMode 
                        ? 'bg-gray-800 border-2 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-2 border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="Ex: Reunião de Pais, Prova de Matemática..."
                    maxLength={100}
                  />
                  <div className={`text-xs mt-2 font-semibold transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {titulo.length}/100 caracteres
                  </div>
                </div>

                <div>
                  <label htmlFor="descricao" className={`block text-sm font-bold mb-2 transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-800'
                  }`}>
                    Descrição do Evento *
                  </label>
                  <textarea
                    id="descricao"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    rows={4}
                    className={`w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 resize-vertical font-medium transition-all duration-300 ${
                      isDarkMode 
                        ? 'bg-gray-800 border-2 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-2 border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="Descreva os detalhes do evento: horário, local, o que trazer..."
                    maxLength={500}
                  />
                  <div className={`text-xs mt-2 font-semibold transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {descricao.length}/500 caracteres
                  </div>
                </div>

                <div>
                  <label htmlFor="data" className={`block text-sm font-bold mb-2 transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-800'
                  }`}>
                    Data do Evento *
                  </label>
                  <input
                    type="date"
                    id="data"
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                    min={dataMinima}
                    className={`w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 font-medium transition-all duration-300 ${
                      isDarkMode 
                        ? 'bg-gray-800 border-2 border-gray-600 text-white [color-scheme:dark]' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                {/* Mensagem de feedback */}
                {message && (
                  <div className={`p-3 rounded-md text-sm ${
                    message.includes('sucesso') 
                      ? 'bg-green-100 text-green-700 border border-green-200' 
                      : 'bg-red-100 text-red-700 border border-red-200'
                  }`}>
                    {message}
                  </div>
                )}

                {/* Botões */}
                <div className="flex space-x-3 pt-2">
                  <button
                    type="submit"
                    disabled={loading || !titulo.trim() || !descricao.trim() || !data}
                    className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 px-4 rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {loading ? 'Criando...' : 'Criar Evento'}
                  </button>
                  
                  <button
                    type="button"
                    onClick={closeModal}
                    className={`px-6 py-3 border rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${
                      isDarkMode 
                        ? 'border-white/30 text-white hover:bg-white/10' 
                        : 'border-gray-300 text-gray-700 hover:bg-white/50'
                    }`}
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
