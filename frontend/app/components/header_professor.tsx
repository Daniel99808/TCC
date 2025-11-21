'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDarkMode } from '../contexts/DarkModeContext';

interface Usuario {
  id: number;
  nome: string;
  tipo: string;
}

export default function HeaderProfessor() {
  const router = useRouter();
  const [usuarioLogado, setUsuarioLogado] = useState<Usuario | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  useEffect(() => {
    const dadosUsuario = localStorage.getItem('usuarioLogado');
    if (dadosUsuario) {
      setUsuarioLogado(JSON.parse(dadosUsuario));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('usuarioLogado');
    router.push('/login');
  };

  return (
    <>
      {/* Botão Menu Mobile */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className={`fixed top-3 left-3 z-50 lg:hidden p-2.5 rounded-lg ${
          isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
        } shadow-lg`}
        aria-label="Menu"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isMobileMenuOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar com Glassmorphism Premium */}
      <aside className={`fixed left-0 top-0 h-full w-[300px] sm:w-[320px] md:w-[350px] lg:w-[360px] transition-all duration-500 ease-in-out z-40 overflow-y-auto ${
        isDarkMode 
          ? 'bg-gradient-to-br from-gray-900/95 via-gray-900/90 to-gray-800/95 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] border-r border-white/5' 
          : 'bg-gradient-to-br from-white/95 via-white/90 to-gray-50/95 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] border-r border-gray-300/30'
      } ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        
        {/* Efeito de brilho sutil no topo */}
        <div className={`absolute top-0 left-0 right-0 h-px ${
          isDarkMode ? 'bg-gradient-to-r from-transparent via-white/10 to-transparent' : 'bg-gradient-to-r from-transparent via-red-300/30 to-transparent'
        }`} />
        
        {/* Perfil do Usuário */}
        {usuarioLogado && (
          <div className={`p-4 sm:p-6 border-b transition-all duration-300 ${
            isDarkMode ? 'border-white/5 bg-gradient-to-b from-white/5 to-transparent' : 'border-gray-200/30 bg-gradient-to-b from-gray-100/20 to-transparent'
          }`}>
            <div 
              className={`flex items-center gap-3 rounded-2xl p-3 sm:p-4 transition-all duration-300 cursor-pointer group relative overflow-hidden ${
                isDarkMode 
                  ? 'bg-gradient-to-br from-gray-800/60 to-gray-800/40 hover:from-gray-800/80 hover:to-gray-700/60 shadow-lg hover:shadow-xl hover:shadow-red-900/20' 
                  : 'bg-gradient-to-br from-white/60 to-gray-50/40 hover:from-white/80 hover:to-gray-50/60 shadow-md hover:shadow-lg hover:shadow-red-500/10'
              } backdrop-blur-md border ${
                isDarkMode ? 'border-white/10 hover:border-red-500/30' : 'border-gray-300/30 hover:border-red-400/40'
              }`}
              onClick={() => {
                router.push('/perfil');
                setIsMobileMenuOpen(false);
              }}
            >
              {/* Efeito de brilho ao hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className={`absolute inset-0 ${
                  isDarkMode 
                    ? 'bg-gradient-to-r from-transparent via-red-500/5 to-transparent' 
                    : 'bg-gradient-to-r from-transparent via-red-400/10 to-transparent'
                } translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000`} />
              </div>
              
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-red-600/50 transition-all duration-300 group-hover:scale-110">
                <span className="text-white font-bold text-lg sm:text-xl drop-shadow-lg">
                  {usuarioLogado.nome.substring(0, 2).toUpperCase()}
                </span>
                {/* Anel decorativo */}
                <div className="absolute inset-0 rounded-full border-2 border-white/20 group-hover:border-white/40 transition-all duration-300" />
              </div>
              <div className="flex-1 min-w-0 relative z-10">
                <h3 className={`font-bold text-base sm:text-lg truncate transition-colors duration-300 ${
                  isDarkMode ? 'text-white group-hover:text-red-400' : 'text-gray-900 group-hover:text-red-600'
                }`}>{usuarioLogado.nome}</h3>
                <p className={`text-sm sm:text-base truncate transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-400 group-hover:text-gray-300' : 'text-gray-600 group-hover:text-gray-700'
                }`}>Professor</p>
              </div>
              {/* Ícone de seta */}
              <svg className={`w-5 h-5 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1 ${
                isDarkMode ? 'text-red-400' : 'text-red-600'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        )}

        {/* Menu */}
        <nav className="p-3 sm:p-4">
          <ul className="space-y-2 sm:space-y-2.5">
            <li>
              <a 
                href="/professor/mural" 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-4 sm:gap-5 px-4 sm:px-5 py-3.5 sm:py-4 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                  isDarkMode 
                    ? 'text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-gray-800/80 hover:to-gray-800/50' 
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gradient-to-r hover:from-gray-100/80 hover:to-white/50'
                } backdrop-blur-sm border border-transparent hover:border-white/10 hover:shadow-lg`}
              >
                <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-r-full transition-all duration-300 opacity-0 group-hover:opacity-100 ${
                  isDarkMode ? 'bg-gradient-to-b from-red-500 to-red-600' : 'bg-gradient-to-b from-red-600 to-red-700'
                } shadow-lg shadow-red-500/50`} />
                
                <svg className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="font-semibold text-base sm:text-lg transition-transform duration-300 group-hover:translate-x-1">Meu Mural</span>
              </a>
            </li>

            <li>
              <a 
                href="/professor/calendario" 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-4 sm:gap-5 px-4 sm:px-5 py-3.5 sm:py-4 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                  isDarkMode 
                    ? 'text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-gray-800/80 hover:to-gray-800/50' 
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gradient-to-r hover:from-gray-100/80 hover:to-white/50'
                } backdrop-blur-sm border border-transparent hover:border-white/10 hover:shadow-lg`}
              >
                <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-r-full transition-all duration-300 opacity-0 group-hover:opacity-100 ${
                  isDarkMode ? 'bg-gradient-to-b from-red-500 to-red-600' : 'bg-gradient-to-b from-red-600 to-red-700'
                } shadow-lg shadow-red-500/50`} />
                
                <svg className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="font-semibold text-base sm:text-lg transition-transform duration-300 group-hover:translate-x-1">Calendário</span>
              </a>
            </li>

            <li>
              <a 
                href="/perfil" 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-4 sm:gap-5 px-4 sm:px-5 py-3.5 sm:py-4 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                  isDarkMode 
                    ? 'text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-gray-800/80 hover:to-gray-800/50' 
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gradient-to-r hover:from-gray-100/80 hover:to-white/50'
                } backdrop-blur-sm border border-transparent hover:border-white/10 hover:shadow-lg`}
              >
                <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-r-full transition-all duration-300 opacity-0 group-hover:opacity-100 ${
                  isDarkMode ? 'bg-gradient-to-b from-red-500 to-red-600' : 'bg-gradient-to-b from-red-600 to-red-700'
                } shadow-lg shadow-red-500/50`} />
                
                <svg className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="font-semibold text-base sm:text-lg transition-transform duration-300 group-hover:translate-x-1">Perfil</span>
              </a>
            </li>
          </ul>
        </nav>

        {/* Rodapé - Botão Sair com Glassmorphism Premium */}
        <div className={`absolute bottom-0 left-0 right-0 p-3 sm:p-4 border-t transition-all duration-300 ${
          isDarkMode 
            ? 'border-white/5 bg-gradient-to-t from-gray-900/95 via-gray-900/80 to-transparent backdrop-blur-xl' 
            : 'border-gray-200/30 bg-gradient-to-t from-white/95 via-white/80 to-transparent backdrop-blur-xl'
        }`}>
          {/* Linha de brilho sutil */}
          <div className={`absolute top-0 left-0 right-0 h-px ${
            isDarkMode ? 'bg-gradient-to-r from-transparent via-white/10 to-transparent' : 'bg-gradient-to-r from-transparent via-red-300/20 to-transparent'
          }`} />
          
          <button
            onClick={handleLogout}
            className={`flex items-center gap-4 sm:gap-5 px-4 sm:px-5 py-3.5 sm:py-4 rounded-xl transition-all duration-300 w-full group relative overflow-hidden ${
              isDarkMode 
                ? 'text-red-400 hover:text-red-300 bg-gradient-to-r from-red-900/20 to-red-800/10 hover:from-red-900/40 hover:to-red-800/30' 
                : 'text-red-600 hover:text-red-700 bg-gradient-to-r from-red-50/50 to-red-100/30 hover:from-red-100/70 hover:to-red-200/50'
            } border ${
              isDarkMode ? 'border-red-900/30 hover:border-red-800/50' : 'border-red-200/40 hover:border-red-300/60'
            } shadow-lg hover:shadow-xl hover:shadow-red-500/20`}
          >
            {/* Efeito de brilho ao hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className={`absolute inset-0 ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-transparent via-red-500/10 to-transparent' 
                  : 'bg-gradient-to-r from-transparent via-red-400/15 to-transparent'
              } translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000`} />
            </div>
            
            <svg className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0 relative z-10 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="font-bold text-base sm:text-lg relative z-10 transition-transform duration-300 group-hover:translate-x-1">Sair</span>
          </button>
        </div>
      </aside>

      <div className="hidden lg:block lg:w-[360px]" />
    </>
  );
}
