'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function HeaderProfessor() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('usuarioLogado');
    router.push('/login');
  };

  return (
    <header className="bg-red-600 text-white p-4 flex justify-around items-center shadow-lg rounded-b-xl">
      <a href="/professor/mural" className="text-lg font-semibold hover:text-red-200 transition-colors">Meu Mural</a>
      <a href="/professor/calendario" className="text-lg font-semibold hover:text-red-200 transition-colors">Calendário</a>
      <a href="/perfil" className="text-lg font-semibold hover:text-red-200 transition-colors">Perfil</a>

      <div className="flex items-center space-x-4">
        <button
          onClick={handleLogout}
          className="text-sm bg-red-700 hover:bg-red-800 px-3 py-2 rounded transition-colors flex items-center gap-2"
          title="Sair"
        >
          <i className="bi bi-box-arrow-right"></i>
          Sair
        </button>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm bg-red-700 px-2 py-1 rounded">Professor</span>
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-red-600">
            <i className="bi bi-person-workspace text-2xl"></i>
          </div>
        </div>
      </div>
    </header>
  );
}
