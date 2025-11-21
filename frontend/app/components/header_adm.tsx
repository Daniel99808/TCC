'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDarkMode } from '../contexts/DarkModeContext';

interface Usuario {
  id: number;
  nome: string;
  tipo: string;
}

export default function Header() {
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

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full w-[300px] sm:w-[320px] md:w-[350px] lg:w-[360px] shadow-2xl transition-all duration-300 z-40 overflow-y-auto ${
        isDarkMode ? 'bg-gray-900/80 backdrop-blur-xl border-r border-white/10' : 'bg-white/80 backdrop-blur-xl border-r border-gray-200/50'
      } ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        
        {/* Perfil do Usuário */}
        {usuarioLogado && (
          <div className={`p-4 sm:p-6 border-b transition-colors duration-300 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div 
              className={`flex items-center gap-3 rounded-xl p-3 sm:p-4 transition-colors cursor-pointer ${
                isDarkMode ? 'bg-gray-800/50 hover:bg-gray-800' : 'bg-gray-100 hover:bg-gray-200'
              }`}
              onClick={() => {
                router.push('/perfil');
                setIsMobileMenuOpen(false);
              }}
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold text-lg sm:text-xl">
                  {usuarioLogado.nome.substring(0, 2).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`font-semibold text-base sm:text-lg truncate transition-colors duration-300 ${
                  isDarkMode ? 'text-white' : 'text-gray-800'
                }`}>{usuarioLogado.nome}</h3>
                <p className={`text-sm sm:text-base truncate transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>Administrador</p>
              </div>
            </div>
          </div>
        )}

        {/* Menu */}
        <nav className="p-3 sm:p-4">
          <ul className="space-y-2 sm:space-y-3">
            <li>
              <a 
                href="/administrador/mural_adm" 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-4 sm:gap-5 px-4 sm:px-5 py-3.5 sm:py-4 rounded-lg transition-colors ${
                  isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="font-medium text-base sm:text-lg">Mural ADM</span>
              </a>
            </li>

            <li>
              <a 
                href="/administrador/calendario_adm" 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-4 sm:gap-5 px-4 sm:px-5 py-3.5 sm:py-4 rounded-lg transition-colors ${
                  isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="font-medium text-base sm:text-lg">Calendário ADM</span>
              </a>
            </li>

            <li>
              <a 
                href="/administrador/cadastro_adm" 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-4 sm:gap-5 px-4 sm:px-5 py-3.5 sm:py-4 rounded-lg transition-colors ${
                  isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                <span className="font-medium text-base sm:text-lg">Cadastrar Usuário</span>
              </a>
            </li>

            <li>
              <a 
                href="/administrador/aapm" 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-4 sm:gap-5 px-4 sm:px-5 py-3.5 sm:py-4 rounded-lg transition-colors ${
                  isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="font-medium text-base sm:text-lg">AAPM</span>
              </a>
            </li>
          </ul>
        </nav>

        {/* Rodapé - Botão Sair */}
        <div className={`absolute bottom-0 left-0 right-0 p-3 sm:p-4 border-t transition-colors duration-300 ${
          isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'
        }`}>
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 sm:gap-5 px-4 sm:px-5 py-3.5 sm:py-4 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors w-full"
          >
            <svg className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="font-medium text-base sm:text-lg">Sair</span>
          </button>
        </div>
      </aside>

      <div className="hidden lg:block lg:w-[360px]" />
    </>
  );
}
