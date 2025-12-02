'use client';

import React, { useState, useEffect } from 'react';
import Header from '../../components/header_adm';
import Footer from '../../components/footer';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { apiUrl } from '@/lib/api';

interface Usuario {
  id: number;
  nome: string;
  cpf: string;
  role?: string;
  hasAAPM: boolean;
  curso: {
    nome: string;
  } | null;
  turma: string | null;
}

export default function AAPMPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [filteredUsuarios, setFilteredUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroTurma, setFiltroTurma] = useState('Geral');
  const [filtroCurso, setFiltroCurso] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [totalAssinantes, setTotalAssinantes] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [cursosDisponiveis, setCursosDisponiveis] = useState<string[]>([]);
  const itemsPerPage = 20;
  const { isDarkMode } = useDarkMode();

  const turmas = ['Geral', 'A', 'B'];
  const cursos = ['Tec. Desenvolvimento de Sistemas', 'Tec. Eletroeletronica', 'Tec. Plastico', 'Tec. Administração', 'Tec. Logistica', 'Tec. Manutenção de Maquinas'];

  useEffect(() => {
    fetchUsuarios();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [usuarios, searchTerm, filtroTurma, filtroCurso]);

  const fetchUsuarios = async () => {
    try {
      const response = await fetch(apiUrl('/usuarios'));
      if (response.ok) {
        const data = await response.json();
        
        // Filtrar apenas estudantes
        const estudantes = data.filter((u: Usuario) => u.role === 'ESTUDANTE');
        
        // Log detalhado para debug
        console.log('=== DADOS DO BACKEND ===');
        console.log('Total de usuários:', data.length);
        console.log('Total de estudantes:', estudantes.length);
        
        // Extrair cursos únicos do banco de dados (apenas de estudantes)
        const cursosUnicos: string[] = Array.from(new Set(
          estudantes
            .filter((u: Usuario) => u.curso && u.curso.nome)
            .map((u: Usuario) => u.curso!.nome)
        ));
        
        console.log('Cursos únicos encontrados no banco:', cursosUnicos);
        console.log('Amostra de estudantes com cursos:', estudantes.filter((u: Usuario) => u.curso).slice(0, 5).map((u: Usuario) => ({ nome: u.nome, curso: u.curso?.nome })));
        
        setCursosDisponiveis(cursosUnicos);
        setUsuarios(estudantes);
        
        // Calcular total de assinantes (apenas estudantes)
        const total = estudantes.filter((u: Usuario) => u.hasAAPM).length;
        setTotalAssinantes(total);
      } else {
        setMessage({ type: 'error', text: 'Erro ao carregar usuários' });
      }
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      setMessage({ type: 'error', text: 'Erro de conexão com o servidor' });
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    let filtered = [...usuarios];

    // Filtro de busca por nome
    if (searchTerm) {
      filtered = filtered.filter(u => 
        u.nome.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por turma
    if (filtroTurma !== 'Geral') {
      filtered = filtered.filter(u => u.turma && u.turma === filtroTurma);
    }

    // Filtro por curso
    if (filtroCurso) {
      console.log('=== DEBUG FILTRO CURSO ===');
      console.log('Filtrando por:', filtroCurso);
      console.log('Usuários antes do filtro:', filtered.length);
      console.log('Amostra de usuários:', filtered.slice(0, 5).map(u => ({ 
        nome: u.nome, 
        cursoBD: u.curso?.nome,
        match: u.curso?.nome === filtroCurso
      })));
      
      filtered = filtered.filter(u => u.curso && u.curso.nome === filtroCurso);
      
      console.log('Usuários após filtro:', filtered.length);
      console.log('Usuários encontrados:', filtered.map(u => ({ nome: u.nome, curso: u.curso?.nome })));
    }

    setFilteredUsuarios(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const toggleAAPM = async (usuarioId: number, currentStatus: boolean) => {
    try {
      const response = await fetch(apiUrl(`/usuarios/${usuarioId}/aapm`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hasAAPM: !currentStatus
        }),
      });

      if (response.ok) {
        // Atualizar localmente
        setUsuarios(prev => prev.map(u => 
          u.id === usuarioId ? { ...u, hasAAPM: !currentStatus } : u
        ));
        
        // Atualizar contador
        setTotalAssinantes(prev => currentStatus ? prev - 1 : prev + 1);
        
        setMessage({ 
          type: 'success', 
          text: `AAPM ${!currentStatus ? 'ativado' : 'desativado'} com sucesso!` 
        });
        
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: 'Erro ao atualizar status AAPM' });
      }
    } catch (error) {
      console.error('Erro ao atualizar AAPM:', error);
      setMessage({ type: 'error', text: 'Erro de conexão com o servidor' });
    }
  };

  const limparFiltros = () => {
    setSearchTerm('');
    setFiltroTurma('Geral');
    setFiltroCurso('');
  };

  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <div className="min-h-screen" style={{backgroundImage: 'url(/fundo.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed'}}>
        <Header />
        
        {/* Título Mobile - Visível apenas no mobile */}
        <div className="lg:hidden pt-16 pb-4 px-4">
          <h1 className={`text-2xl sm:text-3xl font-bold text-center mb-2 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-white'}`}>
            Gerenciamento AAPM
          </h1>
          <p className="text-center text-sm transition-colors duration-300 text-white">
            Controle de assinaturas
          </p>
        </div>
        
        <main className="flex-1 p-2 sm:p-4 md:p-6 lg:p-8 animate-fade-in transition-all duration-300 lg:ml-[360px]">
          <div className="max-w-7xl mx-auto">
            {/* Cabeçalho Melhorado - Oculto no mobile */}
            <div className="mb-6 sm:mb-8 hidden lg:block">
              <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 text-center transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-white'}`}>
                Gerenciamento AAPM
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-center transition-colors duration-300 text-white">
                Controle de assinaturas da Associação de Apoio aos Pais e Mestres
              </p>
            </div>

            {/* Card de Total de Assinantes Melhorado */}
            <div className="rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 bg-gradient-to-br from-red-600 to-red-700 transition-all duration-300 hover:shadow-red-500/50">
              <div className="flex items-center justify-between flex-col sm:flex-row gap-4 sm:gap-6">
                <div className="text-center sm:text-left">
                  <p className="text-white text-xs sm:text-sm font-semibold opacity-90 mb-1 sm:mb-2">Total de Assinantes</p>
                  <p className="text-white text-3xl sm:text-4xl lg:text-5xl font-bold">{totalAssinantes}</p>
                </div>
                <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-xl flex-shrink-0">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Mensagem de Feedback */}
            {message && (
              <div className={`mb-4 p-4 rounded-xl shadow-lg backdrop-blur-sm ${
                message.type === 'success' 
                  ? 'bg-green-600/20 text-green-100 border border-green-500/30' 
                  : 'bg-red-600/20 text-red-100 border border-red-500/30'
              }`}>
                {message.text}
              </div>
            )}

            {/* Filtros Melhorados */}
            <div className="rounded-2xl shadow-2xl p-4 sm:p-6 mb-6 bg-white/10 backdrop-blur-lg border border-white/20">
              <div className="flex items-center gap-3 mb-4">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <h2 className="text-lg sm:text-xl font-bold transition-colors duration-300 text-white">Filtros</h2>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
                <button
                  onClick={() => setFiltroTurma('Geral')}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-bold transition-all duration-300 text-xs sm:text-sm shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 whitespace-nowrap ${
                    filtroTurma === 'Geral'
                      ? 'bg-gradient-to-r from-red-600 to-red-700 text-white'
                      : 'bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20'
                  }`}
                >
                  Total
                </button>
                
                {turmas.slice(1).map(turma => (
                  <button
                    key={turma}
                    onClick={() => setFiltroTurma(turma)}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-bold transition-all duration-300 text-xs sm:text-sm shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 whitespace-nowrap ${
                      filtroTurma === turma
                        ? 'bg-gradient-to-r from-red-600 to-red-700 text-white'
                        : 'bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20'
                    }`}
                  >
                    Turma {turma}
                  </button>
                ))}

                {/* Botões de Filtro por Curso - Com scroll horizontal em mobile */}
                {cursosDisponiveis.length > 0 ? (
                  cursosDisponiveis.map(curso => (
                    <button
                      key={curso}
                      title={curso}
                      onClick={() => setFiltroCurso(filtroCurso === curso ? '' : curso)}
                      className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-bold transition-all duration-300 text-xs sm:text-sm shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px] sm:max-w-none ${
                        filtroCurso === curso
                          ? 'bg-gradient-to-r from-red-600 to-red-700 text-white'
                          : 'bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20'
                      }`}
                    >
                      {curso}
                    </button>
                  ))
                ) : (
                  cursos.map(curso => (
                    <button
                      key={curso}
                      title={curso}
                      onClick={() => setFiltroCurso(filtroCurso === curso ? '' : curso)}
                      className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-bold transition-all duration-300 text-xs sm:text-sm shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px] sm:max-w-none ${
                        filtroCurso === curso
                          ? 'bg-gradient-to-r from-red-600 to-red-700 text-white'
                          : 'bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20'
                      }`}
                    >
                      {curso}
                    </button>
                  ))
                )}
              </div>

              {/* Busca Melhorada */}
              <div className="relative mt-3 sm:mt-4">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Pesquisar por nome..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-9 sm:pl-10 pr-9 sm:pr-10 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-300 shadow-lg ${
                    isDarkMode 
                      ? 'bg-white/10 border border-white/20 text-white placeholder-white backdrop-blur-sm' 
                      : 'bg-white/50 border border-white/30 text-gray-900 placeholder-gray-600 backdrop-blur-sm'
                  }`}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Botão Limpar Filtros */}
              {(filtroTurma !== 'Geral' || filtroCurso || searchTerm) && (
                <button
                  onClick={limparFiltros}
                  className="mt-2 sm:mt-3 flex items-center gap-2 text-red-400 hover:text-red-300 font-medium text-xs sm:text-sm transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Limpar filtros
                </button>
              )}
            </div>

            {/* Tabela de Usuários Melhorada */}
            <div className="rounded-2xl shadow-2xl overflow-hidden bg-white/10 backdrop-blur-lg border border-white/20">
              {loading ? (
                <div className="flex flex-col items-center justify-center p-8 sm:p-12">
                  <div className="animate-spin rounded-full w-10 h-10 sm:w-12 sm:h-12 border-b-2 border-red-600 mb-3 sm:mb-4"></div>
                  <p className="text-xs sm:text-sm text-white">Carregando dados...</p>
                </div>
              ) : filteredUsuarios.length === 0 ? (
                <div className="text-center p-8 sm:p-12">
                  <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">🔍</div>
                  <p className={`text-base sm:text-lg font-bold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Nenhum usuário encontrado</p>
                  <p className={`text-xs sm:text-sm mt-2 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-white'}`}>Tente ajustar os filtros de busca</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-max">
                    <thead className="bg-white/5 backdrop-blur-sm border-b border-white/20">
                      <tr>
                        <th className="px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 lg:py-4 text-left text-xs sm:text-sm font-bold transition-colors duration-300 text-white">
                          Nome
                        </th>
                        <th className="px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 lg:py-4 text-center text-xs sm:text-sm font-bold transition-colors duration-300 hidden sm:table-cell text-white">
                          Curso
                        </th>
                        <th className="px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 lg:py-4 text-center text-xs sm:text-sm font-bold transition-colors duration-300 hidden md:table-cell text-white">
                          Turma
                        </th>
                        <th className="px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 lg:py-4 text-center text-xs sm:text-sm font-bold transition-colors duration-300 text-white">
                          AAPM
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {filteredUsuarios
                        .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                        .map((usuario) => (
                        <tr key={usuario.id} className="hover:bg-white/5 transition-all duration-200">
                          <td className="px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 lg:py-4 text-xs sm:text-sm transition-colors duration-300 text-white">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs bg-red-600/80 text-white shadow-lg flex-shrink-0">
                                {usuario.nome.substring(0, 2).toUpperCase()}
                              </div>
                              <span className="font-semibold truncate sm:truncate">{usuario.nome.substring(0, 20)}</span>
                            </div>
                          </td>
                          <td className="px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 lg:py-4 text-center text-xs sm:text-sm transition-colors duration-300 hidden sm:table-cell text-white">
                            <span className="truncate">{usuario.curso?.nome || '-'}</span>
                          </td>
                          <td className="px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 lg:py-4 text-center text-xs sm:text-sm transition-colors duration-300 hidden md:table-cell text-white">
                            <span className="inline-block px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg text-xs font-bold bg-white/10 backdrop-blur-sm border border-white/20">
                              {usuario.turma || '-'}
                            </span>
                          </td>
                          <td className="px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 lg:py-4 text-center">
                            <button
                              onClick={() => toggleAAPM(usuario.id, usuario.hasAAPM)}
                              className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl whitespace-nowrap ${
                                usuario.hasAAPM
                                  ? 'bg-gradient-to-r from-green-600 to-green-700 text-white'
                                  : 'bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20'
                              }`}
                            >
                              {usuario.hasAAPM ? '✓' : '○'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Paginação */}
            {filteredUsuarios.length > itemsPerPage && (
              <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-3 sm:p-4">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 sm:px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl"
                >
                  ← Anterior
                </button>
                
                <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-center sm:text-left">
                  <span className="text-xs sm:text-sm font-semibold transition-colors duration-300 text-white">
                    Página {currentPage} de {Math.ceil(filteredUsuarios.length / itemsPerPage)}
                  </span>
                  <span className={`text-xs transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-white'}`}>
                    ({((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredUsuarios.length)} de {filteredUsuarios.length})
                  </span>
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredUsuarios.length / itemsPerPage)))}
                  disabled={currentPage >= Math.ceil(filteredUsuarios.length / itemsPerPage)}
                  className="px-3 sm:px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl"
                >
                  Próximo →
                </button>
              </div>
            )}

            {/* Footer com informações */}
            <div className="mt-4 sm:mt-6 text-center">
              <p className={`text-xs sm:text-sm transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-white'}`}>
                Mostrando {Math.min(filteredUsuarios.length, itemsPerPage)} de {filteredUsuarios.length} usuários filtrados (Total: {usuarios.length})
              </p>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
