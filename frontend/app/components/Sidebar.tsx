'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Usuario {
  id: number;
  nome: string;
  tipo: string;
}

interface MenuItemProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

export default function Sidebar() {
  const router = useRouter();
  const [usuarioLogado, setUsuarioLogado] = useState<Usuario | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const dadosUsuario = localStorage.getItem('usuarioLogado');
    if (dadosUsuario) {
      setUsuarioLogado(JSON.parse(dadosUsuario));
    }
  }, []);

  // Função para renderizar os itens de menu baseado no tipo de usuário
  const getMenuItems = (): MenuItemProps[] => {
    const usuarioTipo = usuarioLogado?.tipo || 'estudante';

    // Menu comum para todos os usuários
    const menuComum: MenuItemProps[] = [
      {
        href: '/inicio',
        label: 'Início',
        icon: (
          <svg className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        ),
      },
      {
        href: '/mural',
        label: 'Mural',
        icon: (
          <svg className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        ),
      },
      {
        href: '/calendario',
        label: 'Calendário',
        icon: (
          <svg className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        ),
      },
      {
        href: '/conversas',
        label: 'Conversas',
        icon: (
          <svg className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        ),
      },
      {
        href: '/perfil',
        label: 'Perfil',
        icon: (
          <svg className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        ),
      },
    ];

    // Menus específicos por tipo de usuário
    if (usuarioTipo === 'administrador' || usuarioTipo === 'admin') {
      return [
        menuComum[0], // Início
        {
          href: '/mural_adm',
          label: 'Mural (Admin)',
          icon: (
            <svg className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          ),
        },
        {
          href: '/administrador/calendario_adm',
          label: 'Calendário (Admin)',
          icon: (
            <svg className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          ),
        },
        {
          href: '/administrador/cadastro_adm',
          label: 'Cadastro de Usuários',
          icon: (
            <svg className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          ),
        },
        {
          href: '/administrador/aapm',
          label: 'AAPM',
          icon: (
            <svg className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          ),
        },
        menuComum[4], // Perfil
      ];
    } else if (usuarioTipo === 'professor') {
      return [
        menuComum[0], // Início
        {
          href: '/professor/mural',
          label: 'Mural',
          icon: (
            <svg className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          ),
        },
        {
          href: '/professor/calendario',
          label: 'Calendário',
          icon: (
            <svg className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          ),
        },
        menuComum[3], // Conversas
        menuComum[4], // Perfil
      ];
    }

    // Menu padrão para Estudantes
    return menuComum;
  };

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
          <div className="relative p-3 sm:p-4 md:p-5 lg:p-6 border-b border-white/5 transition-colors duration-300 shrink-0">

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
                <p className="text-xs truncate transition-colors duration-300 text-white">
                  {usuarioLogado.tipo === 'administrador' || usuarioLogado.tipo === 'admin' ? 'Administrador' : usuarioLogado.tipo === 'professor' ? 'Professor' : 'Estudante'}
                </p>
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
            {getMenuItems().map((item, index) => (
              <li key={index}>
                <a 
                  href={item.href} 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="group flex items-center gap-4 sm:gap-5 px-4 sm:px-5 py-3.5 sm:py-4 rounded-xl transition-all duration-300 relative overflow-hidden text-white hover:text-white hover:bg-gradient-to-r hover:from-gray-800/60 hover:to-gray-700/40 hover:shadow-lg hover:pl-6"
                >
                  {/* Barra indicadora animada */}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 group-hover:h-3/5 bg-gradient-to-b from-red-500 to-red-600 rounded-r-full transition-all duration-300" />
                  
                  {item.icon}
                  <span className="font-medium text-base sm:text-lg transition-transform duration-300 group-hover:translate-x-1">{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Rodapé - Botão Sair com Glassmorphism Premium */}
        <div className="p-2.5 sm:p-3 md:p-4 border-t border-white/10 bg-gradient-to-t from-gray-900/95 via-gray-900/80 to-transparent backdrop-blur-xl shrink-0">
          {/* Linha de brilho sutil */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          
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
    </>
  );
}
