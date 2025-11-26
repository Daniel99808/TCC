'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Usuario {
  id: number;
  nome: string;
  tipo: string;
}

export default function Header() {
  const router = useRouter();
  const [usuarioLogado, setUsuarioLogado] = useState<Usuario | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
        className="fixed top-2.5 sm:top-3 left-2.5 sm:left-3 z-50 lg:hidden p-2 sm:p-2.5 rounded-lg bg-gray-800 text-white shadow-lg hover:shadow-xl transition-all active:scale-95"
        aria-label="Menu"
      >
        <svg className="w-4.5 h-4.5 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <aside className={`fixed left-0 top-0 h-screen w-full sm:w-[280px] md:w-[320px] lg:w-[360px] shadow-2xl transition-all duration-300 z-40 bg-gradient-to-br from-gray-900/95 via-gray-900/90 to-gray-800/95 backdrop-blur-2xl border-r border-white/10 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] flex flex-col`}>
        
        {/* Linha de brilho no topo */}
        <div className="h-px bg-gradient-to-r from-transparent via-red-600/30 to-transparent" />

        {/* Perfil do Usuário com Glassmorphism Premium */}
        {usuarioLogado && (
          <div className="relative p-3 sm:p-4 md:p-5 lg:p-6 border-b border-white/5 shrink-0">

            <div 
              className="group flex items-center gap-2 sm:gap-3 rounded-xl p-2.5 sm:p-3 md:p-4 transition-all duration-300 cursor-pointer relative overflow-hidden bg-gradient-to-br from-gray-800/60 to-gray-800/40 hover:from-gray-700/70 hover:to-gray-700/50 border border-white/5 hover:border-white/10 shadow-lg hover:shadow-xl"
              onClick={() => {
                router.push('/perfil');
                setIsMobileMenuOpen(false);
              }}
            >
              {/* Efeito shimmer ao hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              </div>
              
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
                {/* Anel decorativo com gradiente */}
                <div className="absolute inset-0 rounded-full transition-all duration-300 group-hover:scale-110 bg-gradient-to-br from-red-600 via-red-700 to-red-800 p-[2px]">
                  <div className="w-full h-full bg-red-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-xs sm:text-sm md:text-base">
                      {usuarioLogado.nome.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 min-w-0 relative z-10">
                <h3 className="font-semibold text-xs sm:text-sm md:text-base truncate transition-colors duration-300 text-white">{usuarioLogado.nome.substring(0, 20)}</h3>
                <p className="text-xs truncate transition-colors duration-300 text-gray-400">Administrador</p>
              </div>
              
              {/* Ícone de seta que aparece no hover */}
              <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        )}

        {/* Menu com Animações Premium */}
        <nav className="p-2.5 sm:p-3 md:p-4 flex-1 overflow-y-auto scrollbar-hide">
          <ul className="space-y-1.5 sm:space-y-2">
            <li>
              <a 
                href="/administrador/mural_adm" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="group flex items-center gap-4 sm:gap-5 px-4 sm:px-5 py-3.5 sm:py-4 rounded-xl transition-all duration-300 relative overflow-hidden text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-gray-800/60 hover:to-gray-700/40 hover:shadow-lg hover:pl-6"
              >
                {/* Barra indicadora animada */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 group-hover:h-3/5 bg-gradient-to-b from-red-500 to-red-600 rounded-r-full transition-all duration-300" />
                
                <svg className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="font-medium text-base sm:text-lg transition-transform duration-300 group-hover:translate-x-1">Mural ADM</span>
              </a>
            </li>

            <li>
              <a 
                href="/administrador/calendario_adm" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="group flex items-center gap-4 sm:gap-5 px-4 sm:px-5 py-3.5 sm:py-4 rounded-xl transition-all duration-300 relative overflow-hidden text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-gray-800/60 hover:to-gray-700/40 hover:shadow-lg hover:pl-6"
              >
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 group-hover:h-3/5 bg-gradient-to-b from-red-500 to-red-600 rounded-r-full transition-all duration-300" />
                
                <svg className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="font-medium text-base sm:text-lg transition-transform duration-300 group-hover:translate-x-1">Calendário ADM</span>
              </a>
            </li>

            <li>
              <a 
                href="/administrador/cadastro_adm" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="group flex items-center gap-4 sm:gap-5 px-4 sm:px-5 py-3.5 sm:py-4 rounded-xl transition-all duration-300 relative overflow-hidden text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-gray-800/60 hover:to-gray-700/40 hover:shadow-lg hover:pl-6"
              >
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 group-hover:h-3/5 bg-gradient-to-b from-red-500 to-red-600 rounded-r-full transition-all duration-300" />
                
                <svg className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                <span className="font-medium text-base sm:text-lg transition-transform duration-300 group-hover:translate-x-1">Cadastrar Usuário</span>
              </a>
            </li>

            <li>
              <a 
                href="/administrador/aapm" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="group flex items-center gap-4 sm:gap-5 px-4 sm:px-5 py-3.5 sm:py-4 rounded-xl transition-all duration-300 relative overflow-hidden text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-gray-800/60 hover:to-gray-700/40 hover:shadow-lg hover:pl-6"
              >
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 group-hover:h-3/5 bg-gradient-to-b from-red-500 to-red-600 rounded-r-full transition-all duration-300" />
                
                <svg className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="font-medium text-base sm:text-lg transition-transform duration-300 group-hover:translate-x-1">AAPM</span>
              </a>
            </li>

            <li>
              <a 
                href="/conversas" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="group flex items-center gap-4 sm:gap-5 px-4 sm:px-5 py-3.5 sm:py-4 rounded-xl transition-all duration-300 relative overflow-hidden text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-gray-800/60 hover:to-gray-700/40 hover:shadow-lg hover:pl-6"
              >
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 group-hover:h-3/5 bg-gradient-to-b from-red-500 to-red-600 rounded-r-full transition-all duration-300" />
                
                <svg className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="font-medium text-base sm:text-lg transition-transform duration-300 group-hover:translate-x-1">Conversas</span>
              </a>
            </li>
          </ul>
        </nav>

        {/* Rodapé - Botão Sair com Glassmorphism Premium */}
        <div className="p-2.5 sm:p-3 md:p-4 border-t border-white/10 bg-gradient-to-t from-gray-900/95 via-gray-900/80 to-transparent backdrop-blur-xl shrink-0">
          {/* Linha de brilho sutil */}
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent absolute top-0 left-0 right-0" />
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 sm:gap-3 md:gap-4 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 rounded-lg transition-all duration-300 w-full group relative overflow-hidden text-sm sm:text-base text-red-500 hover:text-red-400 bg-gradient-to-r from-red-900/30 to-red-800/20 hover:from-red-900/50 hover:to-red-800/40 border border-red-700/40 hover:border-red-600/60 shadow-lg hover:shadow-xl hover:shadow-red-500/20"
          >
            {/* Efeito de brilho ao hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            </div>
            
            <svg className="w-4.5 h-4.5 sm:w-5 sm:h-5 md:w-6 md:h-6 flex-shrink-0 relative z-10 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="font-bold relative z-10 transition-transform duration-300 group-hover:translate-x-1">Sair</span>
          </button>
        </div>
      </aside>

      <div className="hidden lg:block lg:w-[360px]" />
    </>
  );
}
