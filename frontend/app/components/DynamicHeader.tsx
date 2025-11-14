'use client';

import React, { useEffect, useState } from 'react';
import Header from './header';
import HeaderProfessor from './header_professor';
import HeaderAdm from './header_adm';

export default function DynamicHeader() {
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const usuarioLogado = localStorage.getItem('usuarioLogado');
    if (usuarioLogado) {
      const user = JSON.parse(usuarioLogado);
      setUserRole(user.role);
    }
  }, []);

  if (!userRole) {
    return null; // Ou um loader
  }

  if (userRole === 'PROFESSOR') {
    return <HeaderProfessor />;
  }

  if (userRole === 'ADMIN') {
    return <HeaderAdm />;
  }

  // Default para ESTUDANTE
  return <Header />;
}
