'use client';

import React, { useState, useEffect } from 'react';
import Header from '../../components/header_adm';
import Footer from '../../components/footer';

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
      // Converter a data para ISO string e usar a mesma para início e fim
      const dataEvento = new Date(data);
      const dataFim = new Date(data);
      dataFim.setHours(23, 59, 59); // Fim do dia

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
        
        // Atualizar lista de eventos
        setEventos(prevEventos => [novoEvento, ...prevEventos]);
      } else {
        const errorData = await response.json();
        setMessage(`Erro ao criar evento: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      setMessage('Erro de conexão com o servidor.');
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

  const formatarData = (dataString: string) => {
    return new Date(dataString).toLocaleDateString('pt-BR');
  };

  // Data mínima é hoje
  const dataMinima = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Cabeçalho da página */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              📅 Painel Administrativo - Calendário
            </h1>
            <p className="text-gray-600">
              Crie e gerencie eventos do calendário da comunidade
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Formulário de criação de evento */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                ➕ Criar Novo Evento
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-1">
                    Título do Evento *
                  </label>
                  <input
                    type="text"
                    id="titulo"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Ex: Reunião de Condomínio, Festa Junina..."
                    maxLength={100}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {titulo.length}/100 caracteres
                  </div>
                </div>

                <div>
                  <label htmlFor="data" className="block text-sm font-medium text-gray-700 mb-1">
                    Data do Evento *
                  </label>
                  <input
                    type="date"
                    id="data"
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                    min={dataMinima}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    id="descricao"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-vertical"
                    placeholder="Descreva detalhes do evento: horário, local, o que trazer, etc..."
                    maxLength={500}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {descricao.length}/500 caracteres
                  </div>
                </div>

                {/* Preview do evento */}
                {(titulo || descricao || data) && (
                  <div className="border border-gray-200 rounded-md p-3 bg-gray-50">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Preview do Evento:</h4>
                    <div className="text-sm text-gray-600">
                      <div className="font-semibold text-lg text-red-600">
                        {titulo || '[Título do Evento]'}
                      </div>
                      <div className="text-gray-500 mb-2">
                        📅 {data ? formatarData(data) : '[Data]'}
                      </div>
                      <div className="whitespace-pre-wrap">
                        {descricao || '[Descrição do evento]'}
                      </div>
                    </div>
                  </div>
                )}

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
                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? '📅 Criando...' : '📅 Criar Evento'}
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleClear}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                  >
                    🗑️ Limpar
                  </button>
                </div>
              </form>
            </div>

            {/* Lista de eventos */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                📋 Próximos Eventos
              </h2>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {eventos.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <div className="text-4xl mb-2">📅</div>
                    <p>Nenhum evento encontrado</p>
                    <p className="text-sm">Crie o primeiro evento!</p>
                  </div>
                ) : (
                  eventos.slice(0, 8).map((evento) => (
                    <div key={evento.id} className="border border-gray-200 rounded-md p-3 bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-800 text-sm">
                          {evento.titulo}
                        </h3>
                        <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                          {formatarData(evento.data)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 whitespace-pre-wrap">
                        {evento.descricao.length > 100 
                          ? evento.descricao.substring(0, 100) + '...' 
                          : evento.descricao
                        }
                      </p>
                    </div>
                  ))
                )}
              </div>
              
              {eventos.length > 8 && (
                <div className="text-center mt-4">
                  <a 
                    href="/Users/calendario" 
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Ver todos os eventos →
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Informações adicionais */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
            <h3 className="text-sm font-medium text-blue-800 mb-2">💡 Dicas para criar eventos:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Use títulos claros e descritivos</li>
              <li>• Inclua informações importantes: horário, local, o que trazer</li>
              <li>• Para eventos recorrentes, crie um evento para cada data</li>
              <li>• Evite abreviações - seja claro e objetivo</li>
            </ul>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
