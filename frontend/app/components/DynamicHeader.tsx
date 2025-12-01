'use client';

import React, { useEffect, useState } from 'react';
import SidebarEstudante from './SidebarEstudante';
import SidebarProfessor from './SidebarProfessor';
import SidebarAdm from './SidebarAdm';

export default function DynamicHeader() {
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const usuarioLogado = localStorage.getItem('usuarioLogado');
    if (usuarioLogado) {
      const user = JSON.parse(usuarioLogado);
      // Tenta usar 'tipo' primeiro, depois 'role' como fallback
      setUserRole(user.tipo || user.role);
    }
  }, []);

  if (!userRole) {
    return null; // Ou um loader
  }

  // Normaliza o tipo para lowercase para comparação
  const normalizedRole = userRole.toLowerCase();

  if (normalizedRole === 'professor') {
    return <SidebarProfessor />;
  }

  if (normalizedRole === 'administrador' || normalizedRole === 'admin') {
    return <SidebarAdm />;
  }

  // Default para ESTUDANTE
  return <SidebarEstudante />;
}
