'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import HeaderProfessor from '../../components/header_professor';
import Footer from '../../components/footer';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useDarkMode } from '../../contexts/DarkModeContext';

interface Curso {
  id: number;
  nome: string;
}

interface Message {
  id: number;
  conteudo: string;
  tipoPublico: string;
  cursoId?: number;
  turma?: string;
  createdAt: string;
  curso?: Curso;
}

export default function MuralProfessor() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [tipoPublico, setTipoPublico] = useState<'CURSO' | 'TURMA'>('CURSO');
  const [cursoSelecionado, setCursoSelecionado] = useState('');
  const [turmaSelecionada, setTurmaSelecionada] = useState('');
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { isDarkMode } = useDarkMode();

  useEffect(() => {
    fetchMessages();
    fetchCursos();

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

  const fetchCursos = async () => {
    try {
      const response = await fetch('http://localhost:3000/cursos');
      const data = await response.json();
      setCursos(data);
    } catch (error) {
      console.error('Erro ao buscar cursos:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch('http://localhost:3000/mural');
      const data = await response.json();
      // Verificar se data é um array antes de setar
      if (Array.isArray(data)) {
        setMessages(data);
      } else {
        console.error('Dados recebidos não são um array:', data);
        setMessages([]);
      }
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
      setMessages([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) {
      setMessage('Por favor, digite uma mensagem.');
      return;
    }

    if (!cursoSelecionado) {
      setMessage('Por favor, selecione um curso.');
      return;
    }

    if (tipoPublico === 'TURMA' && !turmaSelecionada) {
      setMessage('Por favor, selecione uma turma.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const payload: {
        conteudo: string;
        tipoPublico: string;
        cursoId?: number | string | null;
        turma?: string | null;
      } = {
        conteudo: newMessage,
        tipoPublico,
        cursoId: cursoSelecionado
      };
      
      if (tipoPublico === 'TURMA') {
        payload.turma = turmaSelecionada;
      }
      
      console.log('Enviando payload:', payload);
      
      const response = await fetch('http://localhost:3000/mural', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Mensagem criada:', data);
        setMessage('Mensagem publicada com sucesso!');
        setNewMessage('');
        setTipoPublico('CURSO');
        setCursoSelecionado('');
        setTurmaSelecionada('');
        setIsModalOpen(false);
        
        // Recarregar mensagens
        await fetchMessages();
      } else {
        const responseText = await response.text();
        console.error('Response text:', responseText);
        try {
          const errorData = JSON.parse(responseText);
          console.error('Erro na resposta:', errorData);
          setMessage(`Erro ao publicar: ${errorData.error || 'Erro desconhecido'}`);
        } catch (e) {
          console.error('Resposta não é JSON válido');
          setMessage(`Erro ao publicar: Status ${response.status}`);
        }
      }
    } catch (error) {
      console.error('Erro ao publicar mensagem:', error);
      setMessage('Erro de conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };
  
  const getTipoPublicoLabel = (msg: Message) => {
    if (msg.tipoPublico === 'TODOS') return 'Todos';
    if (msg.tipoPublico === 'CURSO') return `Curso: ${msg.curso?.nome || 'N/A'}`;
    if (msg.tipoPublico === 'TURMA') return `${msg.curso?.nome || 'N/A'} - Turma ${msg.turma}`;
    return 'N/A';
  };

  return (
    <ProtectedRoute allowedRoles={['PROFESSOR']}>
      {/* Container principal com flexbox para ocupar a altura da tela */}
      <div className={`flex flex-col min-h-screen font-sans pt-16 lg:pt-0 transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <HeaderProfessor />
      
      {/* Main agora usa 'overflow-auto' para gerenciar o scroll de todo o conteúdo */}
      <main className="lg:ml-80 flex-1 p-4 sm:p-6 lg:p-8 flex flex-col items-center overflow-auto animate-fade-in">
        {/* Bem-vindo section */}
        <div className="text-center mb-6">
          <p className="text-sm text-red-600">Painel do Professor</p>
          <h2 className={`text-2xl sm:text-3xl font-bold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Meu Mural</h2>
          <p className={`text-sm sm:text-base mt-2 transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Publique avisos para seus alunos</p>
        </div>

        {/* Botão para adicionar nova mensagem */}
        <div className="w-full max-w-2xl mb-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 px-6 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            📝 Adicionar Nova Mensagem
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
        <div className={`w-full max-w-2xl rounded-xl shadow-xl p-4 sm:p-6 flex flex-col h-full transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          {/* A div interna é o painel de scroll */}
          <div className="flex-1 overflow-y-auto space-y-6">
            {messages.length === 0 ? (
              <div className={`text-center transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <p>Nenhum aviso no momento.</p>
                <p className="text-sm">Clique no botão acima para adicionar o primeiro aviso!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className={`border-b pb-4 last:border-b-0 last:pb-0 transition-colors duration-300 ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                  <div className="flex items-center mb-2">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white">
                      <i className="bi bi-person-circle text-4xl text-red-600"></i> 
                    </div>
                    <div className="ml-3">
                      <h3 className={`font-bold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Professor</h3>
                    </div>
                  </div>
                  <p className={`text-sm sm:text-base whitespace-pre-line transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{message.conteudo}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">
                      {new Date(message.createdAt).toLocaleString('pt-BR')}
                    </span>
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                      {getTipoPublicoLabel(message)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Modal para adicionar mensagem */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-xl font-bold mb-4 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Adicionar Nova Mensagem</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Tipo de Público */}
              <div>
                <label htmlFor="tipoPublico" className={`block text-sm font-medium mb-1 transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Publicar para *
                </label>
                <select
                  id="tipoPublico"
                  value={tipoPublico}
                  onChange={(e) => {
                    setTipoPublico(e.target.value as 'CURSO' | 'TURMA');
                    setTurmaSelecionada('');
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-300 ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="CURSO">Curso específico</option>
                  <option value="TURMA">Turma específica</option>
                </select>
              </div>

              {/* Seleção de Curso */}
              <div>
                <label htmlFor="curso" className={`block text-sm font-medium mb-1 transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Curso *
                </label>
                <select
                  id="curso"
                  value={cursoSelecionado}
                  onChange={(e) => setCursoSelecionado(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-300 ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  required
                >
                  <option value="">Selecione um curso</option>
                  {cursos.map((curso) => (
                    <option key={curso.id} value={curso.id}>
                      {curso.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Seleção de Turma */}
              {tipoPublico === 'TURMA' && (
                <div>
                  <label htmlFor="turma" className={`block text-sm font-medium mb-1 transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Turma *
                  </label>
                  <select
                    id="turma"
                    value={turmaSelecionada}
                    onChange={(e) => setTurmaSelecionada(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-300 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    required
                  >
                    <option value="">Selecione uma turma</option>
                    <option value="A">Turma A</option>
                    <option value="B">Turma B</option>
                  </select>
                </div>
              )}
              
              <div>
                <label htmlFor="mensagem" className={`block text-sm font-medium mb-1 transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Mensagem *
                </label>
                <textarea
                  id="mensagem"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-vertical transition-colors duration-300 ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="Digite a mensagem para o mural..."
                  maxLength={500}
                />
                <div className={`text-xs mt-1 transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {newMessage.length}/500 caracteres
                </div>
              </div>

              {/* Preview da mensagem */}
              {newMessage && (
                <div className={`border rounded-lg p-3 transition-colors duration-300 ${
                  isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'
                }`}>
                  <h4 className={`text-sm font-medium mb-2 transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Preview:</h4>
                  <div className={`text-sm whitespace-pre-line transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {newMessage}
                  </div>
                  <div className="text-xs text-red-500 mt-2 font-medium">
                    Será publicado para: {
                      tipoPublico === 'CURSO' && cursoSelecionado ? 
                        cursos.find(c => c.id.toString() === cursoSelecionado)?.nome || 'Curso' :
                      tipoPublico === 'TURMA' && cursoSelecionado && turmaSelecionada ?
                        `${cursos.find(c => c.id.toString() === cursoSelecionado)?.nome || 'Curso'} - Turma ${turmaSelecionada}` :
                      'Selecione as opções'
                    }
                  </div>
                </div>
              )}

              {/* Botões */}
              <div className="flex space-x-3 pt-2">
                <button
                  type="submit"
                  disabled={loading || !newMessage.trim()}
                  className="flex-1 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-2.5 px-4 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  {loading ? 'Publicando...' : 'Publicar'}
                </button>
                
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={`px-4 py-2.5 border rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-300 ${
                    isDarkMode 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700 focus:ring-gray-500' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500'
                  }`}
                >
                  Cancelar
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setNewMessage('');
                    setTipoPublico('CURSO');
                    setCursoSelecionado('');
                    setTurmaSelecionada('');
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
    </ProtectedRoute>
  );
}
