'use client';

import React, { useState, useEffect } from 'react';
import Header from '../../components/header_adm';
import Footer from '../../components/footer';
import Image from 'next/image';
import { useDarkMode } from '../../contexts/DarkModeContext';

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
  const { isDarkMode } = useDarkMode();

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

      const response = await fetch(`http://localhost:3000/calendario?inicio=${hoje.toISOString()}&fim=${futuro.toISOString()}`);
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

      const response = await fetch('http://localhost:3000/calendario', {
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
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 animate-fade-in">
        <div className="max-w-4xl mx-auto">
          {/* Cabeçalho da página */}
          <div className={`rounded-lg shadow-md p-6 mb-6 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h1 className={`text-3xl font-bold mb-2 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Painel Administrativo - Calendário
            </h1>
            <p className={`transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Gerencie eventos do calendário da comunidade
            </p>
          </div>

          {/* Lista de eventos */}
          <div className={`rounded-lg shadow-md p-6 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-xl font-semibold mb-4 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Próximos Eventos
            </h2>
            
            <div className="space-y-3">
              {eventos.length === 0 ? (
                <div className={`text-center py-8 transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <div className="text-4xl mb-2">📅</div>
                  <p>Nenhum evento encontrado</p>
                  <p className="text-sm">Clique no botão &quot;+&quot; para criar o primeiro evento!</p>
                </div>
              ) : (
                eventos.slice(0, 8).map((evento) => (
                  <div key={evento.id} className={`border rounded-md p-4 transition-all duration-300 hover:shadow-md ${
                    isDarkMode 
                      ? 'border-gray-700 bg-gray-750 hover:bg-gray-700' 
                      : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                  }`}>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-800 text-lg">
                        {evento.titulo}
                      </h3>
                      <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full">
                        {formatarData(evento.data)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">
                      {evento.descricao}
                    </p>
                  </div>
                ))
              )}
            </div>
            
            {eventos.length > 8 && (
              <div className="text-center mt-4">
                <a 
                  href="/calendario" 
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Ver todos os eventos →
                </a>
              </div>
            )}
          </div>

          {/* Informações adicionais */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Dicas para criar eventos:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
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
        className="fixed bottom-6 right-6 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-2xl hover:shadow-red-500/50 transition-all duration-300 z-50 flex items-center justify-center hover:scale-110 active:scale-95 group"
        title="Adicionar novo evento"
      >
        <svg className="w-6 h-6 sm:w-7 sm:h-7 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Modal para adicionar evento */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className={`rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            {/* Header da modal */}
            <div className={`flex justify-between items-center p-6 border-b transition-colors duration-300 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div>
                <h2 className={`text-xl sm:text-2xl font-bold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Novo Evento
                </h2>
                <p className={`text-xs sm:text-sm mt-1 transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Preencha os detalhes do evento</p>
              </div>
              <button
                onClick={closeModal}
                className={`p-2 rounded-full transition-colors hover:bg-opacity-80 ${isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-400 hover:bg-gray-100'}`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Conteúdo da modal */}
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="titulo" className={`block text-sm font-semibold mb-2 transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Título do Evento *
                  </label>
                  <input
                    type="text"
                    id="titulo"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-300 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="Ex: Reunião de Condomínio, Festa Junina..."
                    maxLength={100}
                  />
                  <div className={`text-xs mt-1 transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {titulo.length}/100 caracteres
                  </div>
                </div>

                <div>
                  <label htmlFor="descricao" className={`block text-sm font-semibold mb-2 transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Descrição do Evento *
                  </label>
                  <textarea
                    id="descricao"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    rows={4}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none transition-all duration-300 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="Descreva os detalhes do evento: horário, local, o que trazer..."
                    maxLength={500}
                  />
                  <div className={`text-xs mt-1 transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {descricao.length}/500 caracteres
                  </div>
                </div>

                <div>
                  <label htmlFor="data" className={`block text-sm font-semibold mb-2 transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Data do Evento *
                  </label>
                  <input
                    type="date"
                    id="data"
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                    min={dataMinima}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-300 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
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
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={loading || !titulo.trim() || !descricao.trim() || !data}
                    className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-4 rounded-lg hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
                  >
                    {loading ? 'Criando...' : 'Criar Evento'}
                  </button>
                  
                  <button
                    type="button"
                    onClick={closeModal}
                    className={`px-6 py-3 border rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-300 ${
                      isDarkMode 
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
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
  );
}