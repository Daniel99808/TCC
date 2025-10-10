'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import Header from '../../components/header_adm';
import Footer from '../../components/footer';

interface Message {
  id: number;
  conteudo: string;
  createdAt: string;
}

export default function MuralAdm() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchMessages();

    // Configurar real-time subscription do Supabase
    const subscription = supabase
      .channel('mural-realtime')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'Mural' },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages(prev => [newMsg, ...prev]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) {
      setMessage('Por favor, digite uma mensagem.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:3000/mural', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ conteudo: newMessage }),
      });

      if (response.ok) {
        await response.json();
        setMessage('Mensagem publicada com sucesso!');
        setNewMessage('');
        setIsModalOpen(false);
        
        // Nota: A mensagem será adicionada automaticamente via Socket.IO
        // Não é necessário atualizar manualmente para evitar duplicação
      } else {
        const errorData = await response.json();
        setMessage(`Erro ao publicar: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Erro ao publicar mensagem:', error);
      setMessage('Erro de conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Container principal com flexbox para ocupar a altura da tela
    <div className="flex flex-col h-screen bg-gray-100 font-sans">
      <Header />
      
      {/* Main agora usa 'overflow-auto' para gerenciar o scroll de todo o conteúdo */}
      <main className="flex-1 p-8 flex flex-col items-center overflow-auto">
        {/* Bem-vindo section */}
        <div className="text-center mb-6">
          <p className="text-sm text-red-600">Painel Administrativo</p>
          <h2 className="text-3xl font-bold text-gray-800">Mural de Avisos</h2>
          <p className="text-gray-600 mt-2">Gerencie os avisos da comunidade</p>
        </div>

        {/* Botão para adicionar nova mensagem */}
        <div className="w-full max-w-2xl mb-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors font-semibold"
          >
            ➕ Adicionar Nova Mensagem
          </button>
        </div>

        {/* Mensagem de feedback */}
        {message && (
          <div className={`w-full max-w-2xl mb-4 p-3 rounded-md text-sm ${
            message.includes('sucesso') 
              ? 'bg-green-100 text-green-700 border border-green-200' 
              : 'bg-red-100 text-red-700 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        {/* Mural Card com altura máxima controlada */}
        <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl p-6 flex flex-col h-full">
          {/* A div interna é o painel de scroll */}
          <div className="flex-1 overflow-y-auto space-y-6">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500">
                <div className="text-4xl mb-2">📭</div>
                <p>Nenhum aviso no momento.</p>
                <p className="text-sm">Clique no botão acima para adicionar o primeiro aviso!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                  <div className="flex items-center mb-2">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white">
                      <i className="bi bi-person-circle text-4xl text-red-600"></i> 
                    </div>
                    <div className="ml-3">
                      <h3 className="font-bold text-gray-800">Administração</h3>
                    </div>
                  </div>
                  <p className="text-gray-700 whitespace-pre-line">{message.conteudo}</p>
                  <span className="block text-xs text-gray-500 mt-2">
                    {new Date(message.createdAt).toLocaleString('pt-BR')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Modal para adicionar mensagem */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Adicionar Nova Mensagem</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="mensagem" className="block text-sm font-medium text-gray-700 mb-1">
                  Mensagem *
                </label>
                <textarea
                  id="mensagem"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-vertical"
                  placeholder="Digite a mensagem para o mural..."
                  maxLength={500}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {newMessage.length}/500 caracteres
                </div>
              </div>

              {/* Preview da mensagem */}
              {newMessage && (
                <div className="border border-gray-200 rounded-md p-3 bg-gray-50">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Preview:</h4>
                  <div className="text-sm text-gray-600 whitespace-pre-line">
                    {newMessage}
                  </div>
                </div>
              )}

              {/* Botões */}
              <div className="flex space-x-3 pt-2">
                <button
                  type="submit"
                  disabled={loading || !newMessage.trim()}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? '📤 Publicando...' : '📤 Publicar'}
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setNewMessage('');
                    setMessage('');
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}