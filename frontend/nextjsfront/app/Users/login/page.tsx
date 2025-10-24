'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthForm() {
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);

    if (value.length > 9) {
      setCpf(`${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6, 9)}-${value.slice(9, 11)}`);
    } else if (value.length > 6) {
      setCpf(`${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6)}`);
    } else if (value.length > 3) {
      setCpf(`${value.slice(0, 3)}.${value.slice(3)}`);
    } else {
      setCpf(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    const url = 'http://localhost:3000/login'; 
    const cleanedCpf = cpf.replace(/\D/g, '');

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpf: cleanedCpf, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Login realizado com sucesso!');
        
        // Salvar dados do usuário no localStorage
        localStorage.setItem('usuarioLogado', JSON.stringify(data.user));
        
        // Redireciona baseado no ROLE do usuário
        setTimeout(() => {
          const userRole = data.user.role;
          
          if (userRole === 'ADMIN') {
            router.push('/administrador/mural_adm'); // Admin vai para painel administrativo
          } else if (userRole === 'PROFESSOR') {
            router.push('/Users/mural'); // Professor vai para área de usuários (temporário)
          } else if (userRole === 'ESTUDANTE') {
            router.push('/Users/mural'); // Estudante vai para área de usuários
          } else {
            router.push('/Users/mural'); // Fallback padrão
          }
        }, 1000);

      } else {
        setMessage(data.error || 'Ocorreu um erro.');
      }
    } catch (error) {
      setMessage('Erro na conexão com o servidor.');
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen font-sans bg-cover bg-center"
      style={{ backgroundImage: "url('/Fundo do login.png')" }}
    >
      <div className="w-full max-w-sm p-5 bg-opacity-100 rounded-lg shadow-lg">
        <div className="flex justify-center ">
          <img src="/logo.png" alt="Logo Nexus" className="w-200 " />
        </div>
        <h2 className="text-xl font-bold text-center text-white mb-6 ">
          Olá, seja bem-vindo
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="CPF"
              value={cpf}
              onChange={handleCpfChange}
              required
              className="mt-1 block w-full px-3 py-2 border bg-white/50 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 text-black placeholder-black"
              inputMode="numeric"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border bg-white/50 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 text-black placeholder-black"
            />
            <div className="flex justify-start flex-col text-sm mt-2 ">
              <a href="#" className="text-white hover:text-red-500 font-medium border-b-1 border-white">
                Esqueci minha senha
              </a>
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 "
          >
            Entrar
          </button>
        </form>
        {message && (
          <div className="mt-4 text-center text-sm font-medium">
            <p className={message.includes('sucesso') ? 'text-green-600' : 'text-red-600'}>
              {message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
