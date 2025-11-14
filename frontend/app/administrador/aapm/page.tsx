'use client';

import React, { useState, useEffect } from 'react';
import Header from '../../components/header_adm';
import Footer from '../../components/footer';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useDarkMode } from '../../contexts/DarkModeContext';

interface Usuario {
  id: number;
  nome: string;
  cpf: string;
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
  const itemsPerPage = 20;
  const { isDarkMode } = useDarkMode();

  const turmas = ['Geral', 'A', 'B'];
  const cursos = ['Téc. Plástico', 'Téc. Logística', 'Téc. Mecânica Industrial', 'Téc. Análise e Desenvolvimento de Sistemas', 'Téc. Eletroeletrônica'];

  useEffect(() => {
    fetchUsuarios();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [usuarios, searchTerm, filtroTurma, filtroCurso]);

  const fetchUsuarios = async () => {
    try {
      const response = await fetch('http://localhost:3000/usuarios');
      if (response.ok) {
        const data = await response.json();
        setUsuarios(data);
        
        // Calcular total de assinantes
        const total = data.filter((u: Usuario) => u.hasAAPM).length;
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
      filtered = filtered.filter(u => u.turma === filtroTurma);
    }

    // Filtro por curso
    if (filtroCurso) {
      filtered = filtered.filter(u => u.curso?.nome === filtroCurso);
    }

    setFilteredUsuarios(filtered);
  };

  const toggleAAPM = async (usuarioId: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`http://localhost:3000/usuarios/${usuarioId}/aapm`, {
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
      <div className={`min-h-screen pt-16 lg:pt-0 transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <Header />
        
        <main className="lg:ml-80 flex-1 p-4 sm:p-6 lg:p-8 animate-fade-in">
          <div className="max-w-7xl mx-auto">
            {/* Cabeçalho Melhorado */}
            <div className="mb-6 sm:mb-8">
              <h1 className={`text-3xl sm:text-4xl font-bold mb-2 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Gerenciamento AAPM
              </h1>
              <p className={`text-sm sm:text-base transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Controle de assinaturas da Associação de Apoio aos Pais e Mestres
              </p>
            </div>

            {/* Card de Total de Assinantes Melhorado */}
            <div className={`rounded-xl shadow-lg p-6 sm:p-8 mb-6 transition-all duration-300 hover:shadow-xl ${isDarkMode ? 'bg-gradient-to-br from-red-900 to-red-800' : 'bg-gradient-to-br from-red-500 to-red-600'}`}>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="text-white text-sm sm:text-base font-medium opacity-90 mb-1">Total de Assinantes</p>
                  <p className="text-white text-4xl sm:text-5xl font-bold">{totalAssinantes}</p>
                </div>
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Mensagem de Feedback */}
            {message && (
              <div className={`mb-4 p-4 rounded-lg ${
                message.type === 'success' 
                  ? 'bg-green-100 text-green-700 border border-green-200' 
                  : 'bg-red-100 text-red-700 border border-red-200'
              }`}>
                {message.text}
              </div>
            )}

            {/* Filtros Melhorados */}
            <div className={`rounded-xl shadow-lg p-4 sm:p-6 mb-6 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center gap-3 mb-4">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <h2 className={`text-lg sm:text-xl font-bold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Filtros</h2>
              </div>
              
              <div className="flex flex-wrap gap-2 sm:gap-3 mb-4">
                <button
                  onClick={() => setFiltroTurma('Geral')}
                  className={`px-4 sm:px-6 py-2 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base ${
                    filtroTurma === 'Geral'
                      ? 'bg-red-600 text-white shadow-md scale-105'
                      : (isDarkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300')
                  }`}
                >
                  Total
                </button>
                
                {turmas.slice(1).map(turma => (
                  <button
                    key={turma}
                    onClick={() => setFiltroTurma(turma)}
                    className={`px-4 sm:px-6 py-2 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base ${
                      filtroTurma === turma
                        ? 'bg-red-600 text-white shadow-md scale-105'
                        : (isDarkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300')
                    }`}
                  >
                    Turma {turma}
                  </button>
                ))}

                {/* Botões de Filtro por Curso */}
                {cursos.map(curso => (
                  <button
                    key={curso}
                    onClick={() => setFiltroCurso(filtroCurso === curso ? '' : curso)}
                    className={`px-4 sm:px-6 py-2 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base ${
                      filtroCurso === curso
                        ? 'bg-red-600 text-white shadow-md scale-105'
                        : (isDarkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300')
                    }`}
                  >
                    {curso.replace('Téc. ', '')}
                  </button>
                ))}
              </div>

              {/* Busca Melhorada */}
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Pesquisar por nome do aluno..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-300 ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Botão Limpar Filtros */}
              {(filtroTurma !== 'Geral' || filtroCurso || searchTerm) && (
                <button
                  onClick={limparFiltros}
                  className="mt-3 flex items-center gap-2 text-red-600 hover:text-red-700 font-medium text-sm transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Limpar todos os filtros
                </button>
              )}
            </div>

            {/* Tabela de Usuários Melhorada */}
            <div className={`rounded-xl shadow-lg overflow-hidden transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              {loading ? (
                <div className="flex flex-col items-center justify-center p-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Carregando dados...</p>
                </div>
              ) : filteredUsuarios.length === 0 ? (
                <div className="text-center p-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <p className={`text-lg font-semibold transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>Nenhum usuário encontrado</p>
                  <p className={`text-sm mt-2 transition-colors duration-300 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Tente ajustar os filtros de busca</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className={`border-b transition-colors duration-300 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                      <tr>
                        <th className={`px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                          Nome Completo
                        </th>
                        <th className={`px-4 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-semibold transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                          Curso
                        </th>
                        <th className={`px-4 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-semibold transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                          Turma
                        </th>
                        <th className={`px-4 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-semibold transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                          Status AAPM
                        </th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y transition-colors duration-300 ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                      {filteredUsuarios
                        .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                        .map((usuario) => (
                        <tr key={usuario.id} className={`transition-colors duration-200 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                          <td className={`px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                            <div className="flex items-center gap-2">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs ${isDarkMode ? 'bg-gray-600 text-white' : 'bg-red-100 text-red-600'}`}>
                                {usuario.nome.substring(0, 2).toUpperCase()}
                              </div>
                              <span className="font-medium">{usuario.nome}</span>
                            </div>
                          </td>
                          <td className={`px-4 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {usuario.curso?.nome || '-'}
                          </td>
                          <td className={`px-4 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                              {usuario.turma || '-'}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 text-center">
                            <button
                              onClick={() => toggleAAPM(usuario.id, usuario.hasAAPM)}
                              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                                usuario.hasAAPM
                                  ? 'bg-green-500 text-white hover:bg-green-600 shadow-md'
                                  : (isDarkMode ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' : 'bg-gray-300 text-gray-600 hover:bg-gray-400')
                              }`}
                            >
                              {usuario.hasAAPM ? '✓ Ativo' : 'Inativo'}
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
              <div className="mt-6 flex items-center justify-between bg-white rounded-lg shadow-md p-4">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  ←
                </button>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    Página {currentPage} de {Math.ceil(filteredUsuarios.length / itemsPerPage)}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredUsuarios.length)} de {filteredUsuarios.length})
                  </span>
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredUsuarios.length / itemsPerPage)))}
                  disabled={currentPage >= Math.ceil(filteredUsuarios.length / itemsPerPage)}
                  className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  →
                </button>
              </div>
            )}

            {/* Footer com informações */}
            <div className="mt-6 text-center text-sm text-gray-500">
              <p>Mostrando {Math.min(filteredUsuarios.length, itemsPerPage)} de {filteredUsuarios.length} usuários filtrados (Total: {usuarios.length})</p>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
