'use client';

import React, { useState, useEffect } from 'react';
import Header from '../../components/header_adm';
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

export default function CalendarioAdm() {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [data, setData] = useState('');
  const [tipoPublico, setTipoPublico] = useState('TODOS');
  const [cursoId, setCursoId] = useState('');
  const [turma, setTurma] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [eventos, setEventos] = useState<CalendarioEvento[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loadingCursos, setLoadingCursos] = useState(false);
  const { isDarkMode } = useDarkMode();

  // Turmas padrão
  const turmas = ['A', 'B'];

  // Carregar eventos e cursos existentes
  useEffect(() => {
    fetchEventos();
    fetchCursos();
  }, []);

  const fetchCursos = async () => {
    try {
      setLoadingCursos(true);
      const response = await fetch(apiUrl('/cursos'));
      if (response.ok) {
        const data = await response.json();
        setCursos(data);
      }
    } catch (error) {
      console.error('Erro ao buscar cursos:', error);
    } finally {
      setLoadingCursos(false);
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
      setMessage('Por favor, preencha todos os campos obrigatórios.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    if (tipoPublico !== 'TODOS' && !cursoId) {
      setMessage('Selecione um curso para este tipo de evento.');
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
      const [ano, mes, dia] = data.split('-').map(Number);
      const dataEvento = new Date(ano, mes - 1, dia, 12, 0, 0);

      const payload: any = {
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        data: dataEvento.toISOString(),
        tipoPublico,
      };

      if (tipoPublico !== 'TODOS' && cursoId) {
        payload.cursoId = parseInt(cursoId);
      }

      if (tipoPublico === 'TURMA' && turma) {
        payload.turma = turma;
      }

      console.log('Enviando payload:', payload);

      const response = await fetch(apiUrl('/calendario'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('Resposta status:', response.status);

      if (response.ok) {
        const novoEvento = await response.json();
        console.log('Evento criado:', novoEvento);
        setMessage('✅ Evento criado com sucesso!');
        setTitulo('');
        setDescricao('');
        setData('');
        setTipoPublico('TODOS');
        setCursoId('');
        setTurma('');
        
        setTimeout(() => {
          setMessage('');
        }, 3000);
        
        // Recarregar eventos
        fetchEventos();
      } else {
        const errorData = await response.json();
        console.error('Erro na resposta:', errorData);
        setMessage(`❌ Erro: ${errorData.message || errorData.error || 'Erro ao criar evento'}`);
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
    setTipoPublico('TODOS');
    setCursoId('');
    setTurma('');
    setMessage('');
  };

  const formatarData = (dataString: string) => {
    return new Date(dataString).toLocaleDateString('pt-BR');
  };

  const getPublicoLabel = (evento: CalendarioEvento) => {
    if (evento.tipoPublico === 'TODOS') {
      return 'Todos';
    } else if (evento.tipoPublico === 'CURSO') {
      const curso = cursos.find(c => c.id === evento.cursoId);
      return `Curso: ${curso?.nome || 'N/A'}`;
    } else if (evento.tipoPublico === 'TURMA') {
      const curso = cursos.find(c => c.id === evento.cursoId);
      return `${curso?.nome || 'N/A'} - Turma ${evento.turma}`;
    }
    return evento.tipoPublico;
  };

  // Data mínima é hoje
  const dataMinima = new Date().toISOString().split('T')[0];

  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
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
                Calendário ADM
              </h1>
              <p className="text-sm sm:text-base transition-colors duration-300 text-white">
                Gerencie eventos para alunos, professores e turmas
              </p>
            </div>
          </div>

          {/* Cabeçalho da página - Oculto no mobile */}
          <div className="hidden lg:block mb-6 lg:mb-8">
            <div className="flex flex-col items-center text-center">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 transition-colors duration-300 text-white">
                Calendário - Painel ADM
              </h1>
              <p className="text-sm sm:text-base lg:text-lg transition-colors duration-300 text-white">
                Gerencie eventos para alunos, professores e turmas
              </p>
            </div>
          </div>

          {/* Layout em grid para desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
            {/* Coluna esquerda - Formulário (desktop) */}
            <div className="lg:col-span-1 order-2 lg:order-1">
              <div className="rounded-2xl shadow-2xl p-5 lg:p-6 bg-white/10 backdrop-blur-lg border border-white/20 sticky top-24">
                <h2 className="text-base sm:text-lg lg:text-lg font-bold mb-4 transition-colors duration-300 text-white">
                  Novo Evento
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-3">
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
                      min={new Date().toISOString().split('T')[0]}
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
                        setCursoId('');
                        setTurma('');
                      }}
                      className="w-full px-3 sm:px-4 py-2.5 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium transition-all duration-300 bg-white/10 backdrop-blur-md border-2 border-white/20 text-white hover:bg-white/15"
                    >
                      <option value="TODOS">Todos</option>
                      <option value="CURSO">Curso Específico</option>
                      <option value="TURMA">Turma Específica</option>
                    </select>
                  </div>

                  {tipoPublico !== 'TODOS' && (
                    <div>
                      <label htmlFor="cursoId" className="block text-xs sm:text-sm font-bold mb-1.5 text-white">
                        Curso *
                      </label>
                      <select
                        id="cursoId"
                        value={cursoId}
                        onChange={(e) => {
                          setCursoId(e.target.value);
                          setTurma('');
                        }}
                        className="w-full px-3 sm:px-4 py-2.5 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium transition-all duration-300 bg-white/10 backdrop-blur-md border-2 border-white/20 text-white hover:bg-white/15 disabled:opacity-50"
                        disabled={loadingCursos}
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
                      disabled={loading || !titulo.trim() || !descricao.trim() || !data || (tipoPublico !== 'TODOS' && !cursoId) || (tipoPublico === 'TURMA' && !turma)}
                      className="flex-1 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      {loading ? 'Criando...' : 'Criar'}
                    </button>
                    
                    <button
                      type="button"
                      onClick={handleClear}
                      className="px-3 py-2.5 border-2 rounded-lg text-xs sm:text-sm font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] border-white/30 text-white hover:bg-white/10"
                    >
                      Limpar
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
                  {eventos.length === 0 ? (
                    <div className="text-center py-8 sm:py-10 text-gray-300">
                      <div className="text-4xl sm:text-5xl mb-3">📅</div>
                      <p className="text-sm sm:text-base font-semibold">Nenhum evento encontrado</p>
                      <p className="text-xs sm:text-sm mt-2">Crie um novo evento no formulário ao lado</p>
                    </div>
                  ) : (
                    eventos.slice(0, 15).map((evento) => (
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
                      </div>
                    ))
                  )}
                </div>
                
                {eventos.length > 15 && (
                  <div className="text-center mt-4">
                    <a 
                      href="/calendario" 
                      className="text-blue-400 hover:text-blue-300 text-xs sm:text-sm font-bold hover:underline transition-all duration-300 inline-block"
                    >
                      Ver todos os {eventos.length} eventos →
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
              <li>• Selecione o público alvo correto</li>
              <li>• Para turmas específicas, escolha curso + turma</li>
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
