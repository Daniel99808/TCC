'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import Header from '../../components/header_adm';
import Footer from '../../components/footer';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { useSidebar } from '../../contexts/SidebarContext';

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

export default function MuralAdm() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [tipoPublico, setTipoPublico] = useState<'TODOS' | 'CURSO' | 'TURMA'>('TODOS');
  const [cursoSelecionado, setCursoSelecionado] = useState('');
  const [turmaSelecionada, setTurmaSelecionada] = useState('');
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { isDarkMode } = useDarkMode();
  const { isSidebarOpen } = useSidebar();

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

    setLoading(true);
    setMessage('');

    try {
      // Enviar com todos os campos de segmentação
      const payload: {
        conteudo: string;
        tipoPublico: string;
        cursoId?: number | string | null;
        turma?: string | null;
      } = {
        conteudo: newMessage,
        tipoPublico
      };
      
      if (tipoPublico === 'CURSO' || tipoPublico === 'TURMA') {
        payload.cursoId = cursoSelecionado;
      }
      
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

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('Mensagem criada:', data);
        setMessage('Mensagem publicada com sucesso!');
        setNewMessage('');
        setTipoPublico('TODOS');
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
    <ProtectedRoute allowedRoles={['ADMIN']}>
      {/* Container principal com flexbox para ocupar a altura da tela */}
            <div 
        className="flex flex-col min-h-screen"
        style={{
          backgroundImage: 'url(/fundo.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
        }}
      >
        <Header />
      
      {/* Título Mobile - Visível apenas no mobile */}
      <div className="lg:hidden pt-16 pb-4 px-4">
        <p className="text-sm text-red-600 text-center mb-1 font-semibold">Painel Administrativo</p>
        <h2 className={`text-2xl sm:text-3xl font-bold text-center transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          Mural de Avisos
        </h2>
        <p className={`text-center text-sm mt-2 transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
          Gerencie os avisos da comunidade
        </p>
      </div>
      
      {/* Main agora usa 'overflow-auto' para gerenciar o scroll de todo o conteúdo */}
      <main className={`flex-1 p-3 sm:p-4 md:p-6 lg:p-8 flex flex-col items-center overflow-auto animate-fade-in transition-all duration-300 ${isSidebarOpen ? 'lg:ml-80' : 'lg:ml-0'}`}>
        {/* Bem-vindo section - Oculto no mobile */}
        <div className="text-center mb-6 sm:mb-8 hidden lg:block">
          <p className="text-sm text-red-600 font-semibold">Painel Administrativo</p>
          <h2 className={`text-3xl lg:text-4xl font-bold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Mural de Avisos</h2>
          <p className={`mt-2 text-base lg:text-lg transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Gerencie os avisos da comunidade</p>
        </div>

        {/* Botão para adicionar nova mensagem */}
        <div className="w-full max-w-3xl mb-4 sm:mb-6">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 sm:py-4 px-6 rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] text-base sm:text-lg"
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
          <div className="w-full max-w-3xl rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 bg-white/10 backdrop-blur-lg border border-white/20">
          {/* A div interna é o painel de scroll */}
          <div className="flex-1 overflow-y-auto space-y-4 sm:space-y-6">
            {messages.length === 0 ? (
              <div className={`text-center py-8 transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <div className="text-5xl mb-4">📭</div>
                <p className="text-lg font-semibold">Nenhum aviso no momento.</p>
                <p className="text-sm mt-2">Clique no botão acima para adicionar o primeiro aviso!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className="p-4 sm:p-5 rounded-xl bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01]">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center bg-red-600/20">
                      <i className="bi bi-person-circle text-3xl sm:text-4xl text-red-600"></i> 
                    </div>
                    <div className="ml-3">
                      <h3 className={`font-bold text-base sm:text-lg transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Administração</h3>
                    </div>
                  </div>
                  <p className={`text-sm sm:text-base whitespace-pre-line mb-3 transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>{message.conteudo}</p>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <span className={`text-xs sm:text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {new Date(message.createdAt).toLocaleString('pt-BR')}
                    </span>
                    <span className="text-xs sm:text-sm bg-blue-600/80 text-white px-3 py-1 rounded-full font-semibold shadow-md w-fit">
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl w-full max-w-md p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <h3 className={`text-xl sm:text-2xl font-bold mb-6 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Adicionar Nova Mensagem</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Tipo de Público */}
              <div>
                <label htmlFor="tipoPublico" className="block text-sm font-medium text-gray-700 mb-1">
                  Publicar para *
                </label>
                <select
                  id="tipoPublico"
                  value={tipoPublico}
                  onChange={(e) => {
                    setTipoPublico(e.target.value as 'TODOS' | 'CURSO' | 'TURMA');
                    setCursoSelecionado('');
                    setTurmaSelecionada('');
                  }}
                  className="w-full px-3 py-2 border border-gray-300 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="TODOS">Todos os usuários</option>
                  <option value="CURSO">Curso específico</option>
                  <option value="TURMA">Turma específica</option>
                </select>
              </div>

              {/* Seleção de Curso */}
              {(tipoPublico === 'CURSO' || tipoPublico === 'TURMA') && (
                <div>
                  <label htmlFor="curso" className="block text-sm font-medium text-gray-700 mb-1">
                    Curso *
                  </label>
                  <select
                    id="curso"
                    value={cursoSelecionado}
                    onChange={(e) => setCursoSelecionado(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
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
              )}

              {/* Seleção de Turma */}
              {tipoPublico === 'TURMA' && (
                <div>
                  <label htmlFor="turma" className="block text-sm font-medium text-gray-700 mb-1">
                    Turma *
                  </label>
                  <select
                    id="turma"
                    value={turmaSelecionada}
                    onChange={(e) => setTurmaSelecionada(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  >
                    <option value="">Selecione uma turma</option>
                    <option value="A">Turma A</option>
                    <option value="B">Turma B</option>
                  </select>
                </div>
              )}
              
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
                  <div className="text-xs text-blue-600 mt-2">
                    Será publicado para: {
                      tipoPublico === 'TODOS' ? 'Todos' :
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
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 px-4 rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loading ? 'Publicando...' : 'Publicar'}
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setNewMessage('');
                    setTipoPublico('TODOS');
                    setCursoSelecionado('');
                    setTurmaSelecionada('');
                    setMessage('');
                  }}
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
      )}

        <Footer />
      </div>
    </ProtectedRoute>
  );
}