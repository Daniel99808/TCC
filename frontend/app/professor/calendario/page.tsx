'use client';

import React, { useState, useEffect } from 'react';
import Header from '../../components/header_professor';
import Footer from '../../components/footer';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { apiUrl } from '@/lib/api';

interface CalendarioEvento {
  id: number;
  titulo: string;
  descricao: string;
  data: string;
  tipoPublico?: string;
  cursoId?: number;
  turma?: string;
}

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

export default function CalendarioProfessor() {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [data, setData] = useState('');
  const [tipoPublico, setTipoPublico] = useState('CURSO');
  const [turma, setTurma] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [eventos, setEventos] = useState<CalendarioEvento[]>([]);
  const [professor, setProfessor] = useState<Professor | null>(null);
  const [professorLoading, setProfessorLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Turmas padrão
  const turmas = ['A', 'B'];

  // Carregar eventos existentes
  useEffect(() => {
    fetchProfessor();
    fetchEventos();
  }, []);

  const fetchProfessor = async () => {
    try {
      setProfessorLoading(true);
      const userStr = typeof window !== 'undefined' ? localStorage.getItem('usuarioLogado') : null;
      if (!userStr) {
        console.error('Usuário não encontrado no localStorage');
        return;
      }

      const user = JSON.parse(userStr);
      const response = await fetch(apiUrl(`/perfil/${user.cpf}`));
      
      if (response.ok) {
        const data = await response.json();
        setProfessor(data);
      }
    } catch (error) {
      console.error('Erro ao buscar professor:', error);
    } finally {
      setProfessorLoading(false);
    }
  };

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

    if (!professor?.cursoId) {
      setMessage('Erro: Não consegui carregar o curso do professor. Tente fazer login novamente.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    if (tipoPublico === 'TURMA' && !turma) {
      setMessage('Selecione uma turma para este tipo de evento.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Converter a data para o formato correto, mantendo o fuso horário local
      const [ano, mes, dia] = data.split('-').map(Number);
      const dataEvento = new Date(ano, mes - 1, dia, 12, 0, 0);

      const payload: any = {
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        data: dataEvento.toISOString(),
        tipoPublico,
        cursoId: professor.cursoId,
      };

      if (tipoPublico === 'TURMA' && turma) {
        payload.turma = turma;
      }

      const response = await fetch(apiUrl('/calendario'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const novoEvento = await response.json();
        setMessage('✅ Evento criado com sucesso!');
        setTitulo('');
        setDescricao('');
        setData('');
        setTipoPublico('CURSO');
        setTurma('');
        
        setTimeout(() => {
          setMessage('');
        }, 3000);
        
        // Recarregar eventos
        fetchEventos();
      } else {
        const errorData = await response.json();
        setMessage(`❌ Erro: ${errorData.message || errorData.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      setMessage('❌ Erro ao conectar com o servidor. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setTitulo('');
    setDescricao('');
    setData('');
    setTipoPublico('CURSO');
    setTurma('');
    setMessage('');
    setEditingId(null);
  };

  const handleEdit = (evento: CalendarioEvento) => {
    setTitulo(evento.titulo);
    setDescricao(evento.descricao);
    const dataFormatada = new Date(evento.data).toISOString().split('T')[0];
    setData(dataFormatada);
    setTipoPublico(evento.tipoPublico || 'CURSO');
    setTurma(evento.turma || '');
    setEditingId(evento.id);
    setMessage('');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingId) return;

    if (!titulo.trim() || !descricao.trim() || !data) {
      setMessage('Por favor, preencha todos os campos obrigatórios.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const [ano, mes, dia] = data.split('-').map(Number);
      const dataEvento = new Date(ano, mes - 1, dia, 12, 0, 0);

      const payload: any = {
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        data: dataEvento.toISOString(),
        tipoPublico,
      };

      if (tipoPublico === 'TURMA' && turma) {
        payload.turma = turma;
      }

      const response = await fetch(apiUrl(`/calendario/${editingId}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setMessage('✅ Evento atualizado com sucesso!');
        handleClear();
        setTimeout(() => {
          setMessage('');
          fetchEventos();
        }, 2000);
      } else {
        const errorData = await response.json();
        setMessage(`❌ Erro: ${errorData.message || errorData.error || 'Erro ao atualizar evento'}`);
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      setMessage('❌ Erro ao conectar com o servidor. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (eventoId: number) => {
    if (!confirm('Tem certeza que deseja deletar este evento?')) return;

    setDeletingId(eventoId);
    setMessage('');

    try {
      const response = await fetch(apiUrl(`/calendario/${eventoId}`), {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage('✅ Evento deletado com sucesso!');
        setTimeout(() => {
          setMessage('');
          fetchEventos();
        }, 2000);
      } else {
        const errorData = await response.json();
        setMessage(`❌ Erro: ${errorData.message || errorData.error || 'Erro ao deletar evento'}`);
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      setMessage('❌ Erro ao conectar com o servidor. Tente novamente.');
    } finally {
      setDeletingId(null);
    }
  };

  const formatarData = (dataString: string) => {
    return new Date(dataString).toLocaleDateString('pt-BR');
  };

  // Filtrar eventos apenas do curso do professor
  const eventosFiltrados = eventos.filter(evento => {
    // Mostrar eventos públicos para todos
    if (evento.tipoPublico === 'TODOS') return true;
    // Mostrar eventos do curso do professor
    if (evento.tipoPublico === 'CURSO' && evento.cursoId === professor?.cursoId) return true;
    // Mostrar eventos de turma do curso do professor
    if (evento.tipoPublico === 'TURMA' && evento.cursoId === professor?.cursoId) return true;
    return false;
  });

  const getPublicoLabel = (evento: CalendarioEvento) => {
    if (evento.tipoPublico === 'TODOS') {
      return 'Todos';
    } else if (evento.tipoPublico === 'CURSO') {
      return `Curso: ${professor?.curso?.nome || 'N/A'}`;
    } else if (evento.tipoPublico === 'TURMA') {
      return `${professor?.curso?.nome || 'N/A'} - Turma ${evento.turma}`;
    }
    return evento.tipoPublico;
  };

  // Data mínima é hoje
  const dataMinima = new Date().toISOString().split('T')[0];

  if (professorLoading) {
    return (
      <ProtectedRoute allowedRoles={['PROFESSOR']}>
        <div className="min-h-screen flex items-center justify-center" style={{backgroundImage: 'url(/fundo.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed'}}>
          <div className="text-white text-center">
            <div className="text-4xl mb-3">⏳</div>
            <p className="text-lg font-semibold">Carregando dados do professor...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['PROFESSOR']}>
      <style>{`
        select {
          color-scheme: dark;
        }
        select option {
          background-color: #1f2937;
          color: white;
          padding: 8px;
        }
        select option:checked {
          background: linear-gradient(#06b6d4, #06b6d4);
          background-color: #0891b2;
          color: white;
        }
      `}</style>
      <div className="min-h-screen flex flex-col" style={{backgroundImage: 'url(/fundo.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed'}}>
        <Header />
        
        <main className="transition-all duration-300 pt-16 lg:pt-20 pb-8 px-4 sm:px-6 lg:px-8 animate-fade-in relative z-0 lg:ml-[360px]">
          <div className="max-w-7xl mx-auto">
            {/* Título Mobile - Visível apenas no mobile */}
            <div className="lg:hidden mb-6 lg:mb-8">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl sm:text-3xl font-bold mb-2 transition-colors duration-300 text-white">
                  Calendário Professor
                </h1>
                <p className="text-sm sm:text-base transition-colors duration-300 text-white">
                  Gerencie eventos para {professor?.curso?.nome}
                </p>
              </div>
            </div>

            {/* Cabeçalho da página - Oculto no mobile */}
            <div className="hidden lg:block mb-6 lg:mb-8">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 transition-colors duration-300 text-white">
                  Calendário - {professor?.curso?.nome}
                </h1>
                <p className="text-sm sm:text-base lg:text-lg transition-colors duration-300 text-white">
                  Gerencie eventos para seu curso
                </p>
              </div>
            </div>

            {/* Layout em grid para desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
              {/* Coluna esquerda - Formulário (desktop) */}
              <div className="lg:col-span-1 order-2 lg:order-1">
                <div className="rounded-2xl shadow-2xl p-5 lg:p-6 bg-white/10 backdrop-blur-lg border border-white/20 sticky top-24">
                  <h2 className="text-base sm:text-lg lg:text-lg font-bold mb-4 transition-colors duration-300 text-white">
                    {editingId ? '✏️ Editar Evento' : 'Novo Evento'}
                  </h2>
                  
                  <form onSubmit={editingId ? handleSaveEdit : handleSubmit} className="space-y-3">
                    <div>
                      <label htmlFor="titulo" className="block text-xs sm:text-sm font-bold mb-1.5 text-white">
                        Título *
                      </label>
                      <input
                        type="text"
                        id="titulo"
                        value={titulo}
                        onChange={(e) => setTitulo(e.target.value)}
                        className="w-full px-3 sm:px-4 py-2.5 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium transition-all duration-300 bg-white/10 backdrop-blur-md border-2 border-white/20 text-white placeholder-gray-300 hover:bg-white/15"
                        placeholder="Ex: Reunião"
                        maxLength={100}
                      />
                      <div className="text-xs mt-1 font-semibold text-gray-300">
                        {titulo.length}/100
                      </div>
                    </div>

                    <div>
                      <label htmlFor="descricao" className="block text-xs sm:text-sm font-bold mb-1.5 text-white">
                        Descrição *
                      </label>
                      <textarea
                        id="descricao"
                        value={descricao}
                        onChange={(e) => setDescricao(e.target.value)}
                        rows={2}
                        className="w-full px-3 sm:px-4 py-2.5 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none font-medium transition-all duration-300 bg-white/10 backdrop-blur-md border-2 border-white/20 text-white placeholder-gray-300 hover:bg-white/15"
                        placeholder="Detalhes..."
                        maxLength={300}
                      />
                      <div className="text-xs mt-1 font-semibold text-gray-300">
                        {descricao.length}/300
                      </div>
                    </div>

                    <div>
                      <label htmlFor="data" className="block text-xs sm:text-sm font-bold mb-1.5 text-white">
                        Data *
                      </label>
                      <input
                        type="date"
                        id="data"
                        value={data}
                        onChange={(e) => setData(e.target.value)}
                        min={dataMinima}
                        className="w-full px-3 sm:px-4 py-2.5 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium transition-all duration-300 bg-white/10 backdrop-blur-md border-2 border-white/20 text-white hover:bg-white/15 [color-scheme:dark]"
                      />
                    </div>

                    <div>
                      <label htmlFor="tipoPublico" className="block text-xs sm:text-sm font-bold mb-1.5 text-white">
                        Público *
                      </label>
                      <select
                        id="tipoPublico"
                        value={tipoPublico}
                        onChange={(e) => {
                          setTipoPublico(e.target.value);
                          setTurma('');
                        }}
                        className="w-full px-3 sm:px-4 py-2.5 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium transition-all duration-300 bg-white/10 backdrop-blur-md border-2 border-white/20 text-white hover:bg-white/15"
                      >
                        <option value="CURSO">Curso Inteiro ({professor?.curso?.nome})</option>
                        <option value="TURMA">Turma Específica</option>
                      </select>
                    </div>

                    {tipoPublico === 'TURMA' && (
                      <div>
                        <label htmlFor="turma" className="block text-xs sm:text-sm font-bold mb-1.5 text-white">
                          Turma *
                        </label>
                        <select
                          id="turma"
                          value={turma}
                          onChange={(e) => setTurma(e.target.value)}
                          className="w-full px-3 sm:px-4 py-2.5 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium transition-all duration-300 bg-white/10 backdrop-blur-md border-2 border-white/20 text-white hover:bg-white/15"
                        >
                          <option value="">Selecione uma turma</option>
                          {turmas.map((t) => (
                            <option key={t} value={t}>
                              Turma {t}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {message && (
                      <div className={`p-2.5 rounded-lg text-xs font-semibold shadow-lg ${
                        message.includes('sucesso') 
                          ? 'bg-green-600/20 text-green-100 border-2 border-green-500/30' 
                          : 'bg-red-600/20 text-red-100 border-2 border-red-500/30'
                      }`}>
                        {message}
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <button
                        type="submit"
                        disabled={loading || !titulo.trim() || !descricao.trim() || !data || (tipoPublico === 'TURMA' && !turma)}
                        className="flex-1 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                      >
                        {loading ? (editingId ? 'Atualizando...' : 'Criando...') : (editingId ? 'Atualizar' : 'Criar')}
                      </button>
                      
                      <button
                        type="button"
                        onClick={handleClear}
                        className="px-3 py-2.5 border-2 rounded-lg text-xs sm:text-sm font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] border-white/30 text-white hover:bg-white/10"
                      >
                        {editingId ? 'Cancelar' : 'Limpar'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Coluna direita - Lista de eventos */}
              <div className="lg:col-span-2 order-1 lg:order-2">
                <div className="rounded-2xl shadow-2xl p-5 lg:p-6 bg-white/10 backdrop-blur-lg border border-white/20">
                  <h2 className="text-base sm:text-lg lg:text-lg font-bold mb-4 transition-colors duration-300 text-white">
                    Próximos Eventos
                  </h2>
                  
                  <div className="space-y-3">
                    {eventosFiltrados.length === 0 ? (
                      <div className="text-center py-8 sm:py-10 text-gray-300">
                        <div className="text-4xl sm:text-5xl mb-3">📅</div>
                        <p className="text-sm sm:text-base font-semibold">Nenhum evento encontrado</p>
                        <p className="text-xs sm:text-sm mt-2">Crie um novo evento no formulário ao lado</p>
                      </div>
                    ) : (
                      eventosFiltrados.slice(0, 15).map((evento) => (
                        <div key={evento.id} className="p-4 rounded-lg bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01]">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                            <h3 className="font-bold text-sm sm:text-base text-white">
                              {evento.titulo}
                            </h3>
                            <div className="flex gap-2 flex-wrap">
                              <span className="text-xs bg-amber-600/80 text-white px-2.5 py-1 rounded-full font-semibold whitespace-nowrap">
                                {formatarData(evento.data)}
                              </span>
                              <span className="text-xs bg-blue-600/80 text-white px-2.5 py-1 rounded-full font-semibold whitespace-nowrap">
                                {getPublicoLabel(evento)}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs sm:text-sm whitespace-pre-wrap text-gray-200 line-clamp-2">
                            {evento.descricao}
                          </p>
                          <div className="flex gap-2 mt-3 pt-3 border-t border-white/20">
                            <button
                              onClick={() => handleEdit(evento)}
                              className="flex-1 text-xs sm:text-sm bg-blue-600/80 hover:bg-blue-700 text-white py-1.5 px-2 rounded font-semibold transition-all duration-200 hover:scale-[1.02]"
                            >
                              ✏️ Editar
                            </button>
                            <button
                              onClick={() => handleDelete(evento.id)}
                              disabled={deletingId === evento.id}
                              className="flex-1 text-xs sm:text-sm bg-red-600/80 hover:bg-red-700 text-white py-1.5 px-2 rounded font-semibold transition-all duration-200 hover:scale-[1.02] disabled:opacity-50"
                            >
                              {deletingId === evento.id ? '⏳...' : '🗑️ Deletar'}
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  
                  {eventosFiltrados.length > 15 && (
                    <div className="text-center mt-4">
                      <a 
                        href="/calendario" 
                        className="text-blue-400 hover:text-blue-300 text-xs sm:text-sm font-bold hover:underline transition-all duration-300 inline-block"
                      >
                        Ver todos os {eventosFiltrados.length} eventos →
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Dicas - Mobile */}
            <div className="lg:hidden rounded-2xl shadow-2xl p-5 lg:p-6 mt-6 lg:mt-8 bg-amber-900/30 backdrop-blur-lg border border-amber-700/50">
              <h3 className="text-sm font-bold mb-3 text-amber-300">Dicas:</h3>
              <ul className="text-xs sm:text-sm space-y-1.5 text-amber-200">
                <li>• Use títulos claros e descritivos</li>
                <li>• Você só pode criar eventos para {professor?.curso?.nome}</li>
                <li>• Para turmas específicas, escolha a turma</li>
                <li>• Seja claro e objetivo na descrição</li>
              </ul>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
