'use client';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { supabase } from '../../../lib/supabase';
import Header from '../../components/header_professor';
import Footer from '../../components/footer';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { apiUrl, API_URL } from '@/lib/api';

interface Curso {
  id: number;
  nome: string;
}

interface Professor {
  id: number;
  nome: string;
  cursoId: number;
  curso?: Curso;
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
  const [professor, setProfessor] = useState<Professor | null>(null);
  const [professorLoading, setProfessorLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [tipoPublico, setTipoPublico] = useState<'CURSO' | 'TURMA'>('CURSO');
  const [turmaSelecionada, setTurmaSelecionada] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const { isDarkMode } = useDarkMode();

  useEffect(() => {
    fetchProfessor();
    fetchMessages();

    // Inicializar Socket.IO conectando ao backend na porta 3000
    const socket = io(API_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    // Socket.IO listener para novas mensagens
    socket.on('connect', () => {
      console.log('Conectado ao Socket.IO no backend');
    });

    socket.on('novaMensagem', (msg: Message) => {
      console.log('Professor recebeu novaMensagem via Socket.IO:', msg);
      // Verificar se a mensagem já existe para evitar duplicatas
      setMessages(prev => {
        const messageExists = prev.some(m => m.id === msg.id);
        if (messageExists) {
          console.log('Mensagem', msg.id, 'já existe no estado, ignorando duplicata');
          return prev;
        }
        console.log('Adicionando nova mensagem:', msg.id);
        return [msg, ...prev];
      });
    });

    return () => {
      socket.off('connect');
      socket.off('novaMensagem');
      socket.disconnect();
    };
  }, []);

  const fetchProfessor = async () => {
    try {
      setProfessorLoading(true);
      const userStr = typeof window !== 'undefined' ? localStorage.getItem('usuarioLogado') : null;
      if (!userStr) {
        console.error('Usuário não encontrado no localStorage');
        setProfessorLoading(false);
        return null;
      }

      const user = JSON.parse(userStr);
      console.log('Buscando dados do professor com CPF:', user.cpf);
      
      const response = await fetch(apiUrl(`/perfil/${user.cpf}`));
      
      if (response.ok) {
        const data = await response.json();
        console.log('Professor carregado com sucesso:', data);
        setProfessor(data);
        return data;
      } else {
        console.error('Erro ao buscar dados do professor - Status:', response.status);
        const errorText = await response.text();
        console.error('Erro:', errorText);
        return null;
      }
    } catch (error) {
      console.error('Erro ao buscar professor:', error);
      return null;
    } finally {
      setProfessorLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      // Tentar pegar userId do localStorage
      const userStr = typeof window !== 'undefined' ? localStorage.getItem('usuarioLogado') : null;
      let url = apiUrl('/mural');
      
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          url += `?userId=${user.id}`;
        } catch (e) {
          // Se não conseguir fazer parse, continua sem userId
        }
      }
      
      const response = await fetch(url);
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

    // Se ainda está carregando o professor
    if (professorLoading) {
      setMessage('Carregando dados do professor... Aguarde um momento.');
      return;
    }

    // Se professor não está carregado, tentar carregar
    let currentProfessor = professor;
    if (!currentProfessor?.cursoId) {
      setMessage('Carregando dados do professor...');
      const loadedProfessor = await fetchProfessor();
      currentProfessor = loadedProfessor;
      
      // Verificar se conseguimos carregar
      if (!currentProfessor?.cursoId) {
        setMessage('Erro: Não consegui carregar o curso do professor. Tente fazer login novamente.');
        return;
      }
    }

    // Se for turma, validar seleção
    if (tipoPublico === 'TURMA' && !turmaSelecionada) {
      setMessage('Por favor, selecione uma turma.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      console.log('Enviando mensagem com professor:', currentProfessor);
      console.log('tipoPublico:', tipoPublico);
      console.log('turmaSelecionada:', turmaSelecionada);
      
      // Enviar com o curso do professor
      const payload: {
        conteudo: string;
        tipoPublico: string;
        cursoId: number;
        turma?: string | null;
      } = {
        conteudo: newMessage,
        tipoPublico,
        cursoId: currentProfessor!.cursoId
      };
      
      if (tipoPublico === 'TURMA') {
        payload.turma = turmaSelecionada || null;
      } else {
        payload.turma = null;
      }
      
      console.log('Payload final:', JSON.stringify(payload, null, 2));
      
      const method = editingId ? 'PATCH' : 'POST';
      const endpoint = editingId ? `/mural/${editingId}` : '/mural';
      
      console.log('Enviando para:', apiUrl(endpoint), 'com método:', method);
      
      const response = await fetch(apiUrl(endpoint), {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Mensagem criada com sucesso:', data);
        
        setMessage(editingId ? 'Mensagem atualizada com sucesso!' : 'Mensagem publicada com sucesso!');
        setNewMessage('');
        setTipoPublico('CURSO');
        setTurmaSelecionada('');
        setEditingId(null);
        setIsModalOpen(false);
        
        // Não adicionar manualmente - deixar o Socket.IO fazer isso
        // Recarregar mensagens após 2 segundos para sincronização
        setTimeout(() => fetchMessages(), 2000);
      } else {
        const responseText = await response.text();
        console.error('Erro na resposta:', responseText);
        try {
          const errorData = JSON.parse(responseText);
          setMessage(`Erro ao publicar: ${errorData.error || 'Erro desconhecido'}`);
        } catch {
          setMessage(`Erro ao publicar: Status ${response.status} - ${responseText}`);
        }
      }
    } catch (error) {
      console.error('Erro ao publicar mensagem:', error);
      setMessage('Erro de conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (msg: Message) => {
    console.log('Editando mensagem:', msg);
    setNewMessage(msg.conteudo);
    setTipoPublico(msg.tipoPublico as 'CURSO' | 'TURMA');
    setTurmaSelecionada(msg.turma || '');
    setEditingId(msg.id);
    setIsModalOpen(true);
  };

  const handleDeleteMessage = async (id: number) => {
    console.log('Deletando mensagem com ID:', id);
    if (!window.confirm('Tem certeza que deseja deletar esta mensagem?')) return;
    
    setDeletingId(id);
    try {
      const url = apiUrl(`/mural/${id}`);
      console.log('URL da requisição DELETE:', url);
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Status da resposta:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        setMessages(prev => prev.filter(m => m.id !== id));
        setMessage('Mensagem deletada com sucesso!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        const text = await response.text();
        console.error('Erro na resposta:', text);
        setMessage('Erro ao deletar mensagem');
      }
    } catch (error) {
      console.error('Erro ao deletar mensagem:', error);
      setMessage('Erro de conexão com o servidor.');
    } finally {
      setDeletingId(null);
    }
  };;
  
  const getTipoPublicoLabel = (msg: Message) => {
    if (msg.tipoPublico === 'CURSO') return `Curso: ${msg.curso?.nome || 'N/A'}`;
    if (msg.tipoPublico === 'TURMA') return `${msg.curso?.nome || 'N/A'} - Turma ${msg.turma}`;
    return 'N/A';
  };

  return (
    <ProtectedRoute allowedRoles={['PROFESSOR']}>
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
        <p className="text-sm text-red-600 text-center mb-1 font-semibold">Painel do Professor</p>
        <h2 className={`text-2xl sm:text-3xl font-bold text-center transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          Mural de Avisos
        </h2>
        <p className="text-center text-sm mt-2 transition-colors duration-300 text-gray-200">
          Gerencie os avisos da sua turma
        </p>
      </div>
      
      {/* Main agora usa 'overflow-auto' para gerenciar o scroll de todo o conteúdo */}
      <main className="flex-1 p-2 sm:p-4 md:p-6 lg:p-8 flex flex-col items-center overflow-y-auto overflow-x-hidden animate-fade-in transition-all duration-300 lg:ml-[360px]">
        {/* Bem-vindo section - Oculto no mobile */}
        <div className="text-center mb-6 sm:mb-8 hidden lg:block">
          <p className="text-sm text-red-600 font-semibold">Painel do Professor</p>
          <h2 className="text-3xl lg:text-4xl font-bold transition-colors duration-300 text-white">Mural de Avisos</h2>
          <p className="mt-2 text-base lg:text-lg transition-colors duration-300 text-gray-200">Gerencie os avisos da sua turma</p>
        </div>

        {/* Botão para adicionar nova mensagem */}
        <div className="w-full max-w-3xl mb-3 sm:mb-4 md:mb-6 px-2 sm:px-0">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2.5 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3 md:py-4 rounded-lg transition-all duration-300 w-full group relative overflow-hidden text-sm sm:text-base md:text-lg text-red-500 hover:text-red-400 bg-gradient-to-r from-red-900/30 to-red-800/20 hover:from-red-900/50 hover:to-red-800/40 border border-red-700/40 hover:border-red-600/60 shadow-lg hover:shadow-xl hover:shadow-red-500/20 font-bold"
          >
            {/* Efeito de brilho ao hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            </div>
            
            <span className="text-xl sm:text-2xl relative z-10 transition-all duration-300 group-hover:scale-110">+</span>
            <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">Adicionar Mensagem</span>
          </button>
        </div>

        {/* Mensagem de feedback */}
        {message && (
          <div className={`w-full max-w-3xl mb-3 sm:mb-4 md:mb-6 px-2 sm:px-0 p-2.5 sm:p-3 md:p-4 rounded-lg text-xs sm:text-sm md:text-base font-medium shadow-lg transition-all duration-300 ${
            message.includes('sucesso') 
              ? 'bg-green-600/20 text-green-100 border border-green-500/30 backdrop-blur-sm' 
              : 'bg-red-600/20 text-red-100 border border-red-500/30 backdrop-blur-sm'
          }`}>
            {message}
          </div>
        )}

          {/* Mural Card com altura máxima controlada */}
          <div className="w-full max-w-3xl px-2 sm:px-0 rounded-2xl shadow-2xl p-3 sm:p-4 md:p-6 lg:p-8 bg-white/10 backdrop-blur-lg border border-white/20">
          {/* A div interna é o painel de scroll */}
          <div className="flex-1 overflow-y-auto space-y-2 sm:space-y-2.5 md:space-y-3 max-h-[60vh] sm:max-h-[70vh] scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style]:none [overflow-y-scroll]:scrollbar-none">
            {messages.length === 0 ? (
              <div className="text-center py-6 sm:py-8 transition-colors duration-300 text-gray-300">
                <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">📭</div>
                <p className="text-base sm:text-lg font-semibold">Nenhum aviso no momento.</p>
                <p className="text-xs sm:text-sm mt-2">Clique no botão acima para adicionar!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className="group p-2.5 sm:p-3 md:p-4 rounded-lg bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-sm border border-white/15 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.005] cursor-pointer hover:from-white/20 hover:to-white/10">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center mb-1.5 sm:mb-2 flex-1">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center bg-red-600/20 flex-shrink-0">
                        <i className="bi bi-person-circle text-lg sm:text-xl md:text-2xl text-red-600"></i> 
                      </div>
                      <div className="ml-2 sm:ml-2.5">
                        <h3 className="font-bold text-xs sm:text-sm md:text-base transition-colors duration-300 text-white">Professor</h3>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(message)}
                        className="p-1.5 sm:p-2 rounded-lg bg-blue-600/40 hover:bg-blue-600/60 border border-blue-400/40 hover:border-blue-400/60 text-blue-200 hover:text-blue-100 transition-all duration-200 flex items-center justify-center"
                        title="Editar mensagem"
                      >
                        <span className="text-sm sm:text-base">✎</span>
                      </button>
                      <button
                        onClick={() => handleDeleteMessage(message.id)}
                        disabled={deletingId === message.id}
                        className="p-1.5 sm:p-2 rounded-lg bg-red-600/40 hover:bg-red-600/60 border border-red-400/40 hover:border-red-400/60 text-red-200 hover:text-red-100 transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Deletar mensagem"
                      >
                        <span className="text-sm sm:text-base">{deletingId === message.id ? '...' : '🗑'}</span>
                      </button>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm md:text-base whitespace-pre-line mb-1.5 sm:mb-2 transition-colors duration-300 text-gray-200">{message.conteudo}</p>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                    <span className="text-xs transition-colors duration-300 text-white opacity-80">
                      {new Date(message.createdAt).toLocaleString('pt-BR')}
                    </span>
                    <span className="text-xs bg-blue-600/70 text-white px-2 sm:px-2.5 py-0.5 rounded-full font-semibold shadow-md w-fit">
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-2xl flex items-center justify-center z-50 p-3 sm:p-4 animate-fade-in">
          <div className="bg-white/10 backdrop-blur-3xl border-2 border-white/30 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto relative overflow-hidden group hover:border-white/40 transition-all duration-500">
            {/* Elemento decorativo de vidro com gradiente */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 pointer-events-none" />
            
            {/* Efeito de brilho */}
            <div className="absolute -inset-px bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Header com glassmorphismo avançado */}
            <div className="sticky top-0 bg-gradient-to-r from-red-600/70 to-red-700/70 backdrop-blur-2xl p-4 sm:p-6 border-b-2 border-white/20 rounded-t-3xl relative z-50">
              <div className="absolute inset-0 bg-white/5 backdrop-blur-xl rounded-t-3xl" />
              <div className="flex items-center justify-between relative z-50">
                <div>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white flex items-center gap-2 drop-shadow-lg">
                    <span className="text-2xl">{editingId ? '✎' : '📝'}</span> {editingId ? 'Editar' : 'Nova'} Mensagem
                  </h3>
                  <p className="text-red-100/95 text-xs sm:text-sm mt-1">{editingId ? 'Atualizar aviso para seus alunos' : 'Publicar aviso para seus alunos'}</p>
                </div>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setNewMessage('');
                    setTipoPublico('CURSO');
                    setTurmaSelecionada('');
                    setMessage('');
                  }}
                  className="text-white hover:bg-white/30 rounded-full p-2 transition-all hover:scale-110 backdrop-blur-md"
                >
                  ✕
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6 relative z-0">
              {/* Informações de quem está publicando */}
              <div className="bg-blue-600/30 backdrop-blur-lg border-2 border-blue-400/40 rounded-xl p-3 sm:p-4 flex items-start gap-3 hover:bg-blue-600/40 hover:border-blue-400/60 transition-all duration-300">
                <span className="text-xl mt-0.5">ℹ️</span>
                <div>
                  <p className="font-bold text-white text-sm sm:text-base drop-shadow">Você está publicando como Professor</p>
                  <p className="text-blue-100/90 text-xs sm:text-sm mt-1">Esta mensagem será visível para seus alunos do {professor?.curso?.nome}</p>
                </div>
              </div>

              {/* Curso do Professor - Informacional */}
              <div className="space-y-3">
                <label className="block text-sm sm:text-base font-bold text-white flex items-center gap-2 drop-shadow">
                  <span className="text-blue-400">📚</span> Seu Curso
                </label>
                <div className="w-full px-4 py-3 rounded-lg text-sm sm:text-base bg-gray-900/70 backdrop-blur-lg border-2 border-white/40 text-white font-medium">
                  {professor?.curso?.nome || 'Carregando...'}
                </div>
              </div>

              {/* Tipo de Público */}
              <div className="space-y-3">
                <label className="block text-sm sm:text-base font-bold text-white flex items-center gap-2 drop-shadow">
                  <span className="text-red-400">★</span> Tipo de Aviso
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {['CURSO', 'TURMA'].map((tipo) => (
                    <button
                      key={tipo}
                      type="button"
                      onClick={() => {
                        setTipoPublico(tipo as 'CURSO' | 'TURMA');
                        setTurmaSelecionada('');
                      }}
                      className={`py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg font-bold text-sm sm:text-base transition-all duration-300 border-2 backdrop-blur-md ${
                        tipoPublico === tipo
                          ? 'bg-red-600/50 border-red-400/70 text-white shadow-lg shadow-red-500/30 hover:bg-red-600/60'
                          : 'bg-white/10 border-white/30 text-gray-200 hover:bg-white/20 hover:border-red-400/50'
                      }`}
                    >
                      {tipo === 'CURSO' ? '👥 Para todo o curso' : '👨‍🎓 Para uma turma'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Seleção de Turma */}
              {tipoPublico === 'TURMA' && (
                <div className="space-y-3 animate-fade-in">
                  <label htmlFor="turma" className="block text-sm sm:text-base font-bold text-white flex items-center gap-2 drop-shadow">
                    <span className="text-red-400">★</span> Selecionar Turma
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['A', 'B'].map((turma) => (
                      <button
                        key={turma}
                        type="button"
                        onClick={() => setTurmaSelecionada(turma)}
                        className={`py-2.5 px-4 rounded-lg font-bold text-sm transition-all duration-300 border-2 backdrop-blur-md ${
                          turmaSelecionada === turma
                            ? 'bg-red-600/50 border-red-400/70 text-white shadow-lg shadow-red-500/30 hover:bg-red-600/60'
                            : 'bg-white/10 border-white/30 text-gray-200 hover:bg-white/20 hover:border-red-400/50'
                        }`}
                      >
                        Turma {turma}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Mensagem */}
              <div className="space-y-3">
                <label htmlFor="mensagem" className="block text-sm sm:text-base font-bold text-white flex items-center justify-between drop-shadow">
                  <span className="flex items-center gap-2">
                    <span className="text-red-400">★</span> Mensagem
                  </span>
                  <span className={`text-xs font-semibold ${newMessage.length > 400 ? 'text-yellow-300' : newMessage.length > 450 ? 'text-red-400' : 'text-gray-300'}`}>
                    {newMessage.length}/500
                  </span>
                </label>
                <textarea
                  id="mensagem"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-red-400/80 resize-vertical font-medium transition-all duration-300 bg-white/15 backdrop-blur-lg border-2 border-white/30 text-white placeholder-gray-400 hover:bg-white/20 hover:border-white/40 focus:bg-white/25"
                  placeholder="Digite sua mensagem aqui... Seja claro e conciso!"
                  maxLength={500}
                />
              </div>

              {/* Preview da mensagem */}
              {newMessage.trim() && (
                <div className="bg-white/10 backdrop-blur-lg border-2 border-white/30 rounded-xl p-4 sm:p-5 animate-fade-in hover:bg-white/15 hover:border-white/40 transition-all duration-300">
                  <h4 className="text-xs sm:text-sm font-bold text-red-300 mb-3 flex items-center gap-2 drop-shadow">
                    <span>👁️</span> Preview
                  </h4>
                  <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 sm:p-4 border border-white/20">
                    <p className="text-white text-sm sm:text-base whitespace-pre-wrap leading-relaxed">
                      {newMessage}
                    </p>
                  </div>
                  <div className="mt-3 text-xs sm:text-sm font-semibold text-blue-200 flex items-center gap-2 drop-shadow">
                    <span>📤</span> Será enviado para:{' '}
                    <span className="text-white font-bold">
                      {tipoPublico === 'CURSO' 
                        ? `Todos os alunos de ${professor?.curso?.nome}`
                        : tipoPublico === 'TURMA' && turmaSelecionada
                          ? `Turma ${turmaSelecionada} - ${professor?.curso?.nome}`
                          : 'Selecione os filtros'
                      }
                    </span>
                  </div>
                </div>
              )}

              {/* Botões */}
              <div className="flex gap-2 sm:gap-3 pt-4 border-t-2 border-white/20">
                <button
                  type="submit"
                  disabled={loading || !newMessage.trim() || professorLoading || (tipoPublico === 'TURMA' && !turmaSelecionada)}
                  className="flex-1 px-4 py-2.5 sm:py-3 border-2 border-red-400/60 hover:border-red-400/80 disabled:border-gray-500/40 text-white disabled:text-gray-400 rounded-lg text-sm sm:text-base font-bold shadow-lg hover:shadow-xl disabled:shadow-none transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:scale-100 hover:bg-red-600/20 disabled:bg-gray-600/10 backdrop-blur-md flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <span className="animate-spin">⚙️</span> {editingId ? 'Atualizando...' : 'Publicando...'}
                    </>
                  ) : professorLoading ? (
                    <>
                      <span className="animate-spin">⚙️</span> Carregando dados...
                    </>
                  ) : (
                    <>
                      <span>{editingId ? '✓' : '✓'}</span> {editingId ? 'Atualizar' : 'Publicar'}
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setNewMessage('');
                    setTipoPublico('CURSO');
                    setTurmaSelecionada('');
                    setEditingId(null);
                    setMessage('');
                  }}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-white/40 hover:border-white/60 text-gray-200 hover:text-white rounded-lg text-sm sm:text-base font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] hover:bg-white/20 backdrop-blur-md"
                >
                  ✕ Cancelar
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
