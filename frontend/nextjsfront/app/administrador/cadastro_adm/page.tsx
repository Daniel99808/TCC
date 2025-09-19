'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/header_adm';
import Footer from '../../components/footer';

interface CadastroData {
  nome: string;
  cpf: string;
  password: string;
  confirmPassword: string;
  cursoId: string;
}

interface Curso {
  id: number;
  nome: string;
}

interface ApiResponse {
  message: string;
  user?: {
    id: number;
    nome: string;
    cpf: string;
    createdAt: string;
    curso?: Curso;
  };
  error?: string;
}

export default function CadastroAdmPage() {
  const [formData, setFormData] = useState<CadastroData>({
    nome: '',
    cpf: '',
    password: '',
    confirmPassword: '',
    cursoId: ''
  });
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const router = useRouter();

  // Buscar cursos disponíveis
  useEffect(() => {
    const fetchCursos = async () => {
      try {
        const response = await fetch('http://localhost:3000/cursos');
        if (response.ok) {
          const data = await response.json();
          setCursos(data);
        }
      } catch (error) {
        console.error('Erro ao buscar cursos:', error);
      }
    };

    fetchCursos();
  }, []);

  const formatCPF = (value: string) => {
    // Remove tudo que não é dígito
    const numericValue = value.replace(/\D/g, '');
    
    // Aplica a máscara do CPF: 000.000.000-00
    if (numericValue.length <= 11) {
      return numericValue
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2');
    }
    return value;
  };

  const validateCPF = (cpf: string) => {
    const numericCPF = cpf.replace(/\D/g, '');
    return numericCPF.length === 11;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'cpf') {
      setFormData(prev => ({
        ...prev,
        [name]: formatCPF(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    
    // Validações
    if (!formData.nome || !formData.cpf || !formData.password || !formData.confirmPassword || !formData.cursoId) {
      setMessage({ type: 'error', text: 'Todos os campos são obrigatórios' });
      return;
    }

    if (!validateCPF(formData.cpf)) {
      setMessage({ type: 'error', text: 'CPF deve conter 11 dígitos' });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Senhas não coincidem' });
      return;
    }

    if (formData.password.length < 4) {
      setMessage({ type: 'error', text: 'Senha deve ter pelo menos 4 caracteres' });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3000/cadastro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome: formData.nome,
          cpf: formData.cpf.replace(/\D/g, ''), // Remove máscara para enviar apenas números
          password: formData.password,
          cursoId: formData.cursoId,
        }),
      });

      const data: ApiResponse = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message });
        setFormData({ nome: '', cpf: '', password: '', confirmPassword: '', cursoId: '' });
        
        // Não redireciona - admin pode cadastrar mais usuários
      } else {
        setMessage({ type: 'error', text: data.message || 'Erro ao cadastrar usuário' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro de conexão com o servidor' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
          {/* Cabeçalho */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">👨‍💼 Cadastro de Usuário</h1>
            <p className="text-gray-600 mt-2">Painel Administrativo</p>
            <div className="w-16 h-1 bg-orange-600 mx-auto mt-3 rounded"></div>
          </div>

          {/* Mensagem de feedback */}
          {message && (
            <div className={`mb-4 p-3 rounded-md text-sm ${
              message.type === 'success' 
                ? 'bg-green-100 text-green-700 border border-green-200' 
                : 'bg-red-100 text-red-700 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campo Nome */}
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                Nome Completo *
              </label>
              <input
                type="text"
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleInputChange}
                placeholder="Digite o nome completo do usuário"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                disabled={isLoading}
              />
            </div>

            {/* Campo CPF */}
            <div>
              <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 mb-1">
                CPF *
              </label>
              <input
                type="text"
                id="cpf"
                name="cpf"
                value={formData.cpf}
                onChange={handleInputChange}
                placeholder="000.000.000-00"
                maxLength={14}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                disabled={isLoading}
              />
            </div>

            {/* Campo Curso */}
            <div>
              <label htmlFor="cursoId" className="block text-sm font-medium text-gray-700 mb-1">
                Curso *
              </label>
              <select
                id="cursoId"
                name="cursoId"
                value={formData.cursoId}
                onChange={(e) => setFormData(prev => ({ ...prev, cursoId: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                disabled={isLoading}
              >
                <option value="">Selecione o curso</option>
                {cursos.map((curso) => (
                  <option key={curso.id} value={curso.id}>
                    {curso.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Campo Senha */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Senha *
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Digite a senha inicial"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                disabled={isLoading}
              />
            </div>

            {/* Campo Confirmar Senha */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar Senha *
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirme a senha"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                disabled={isLoading}
              />
            </div>

            {/* Preview dos dados */}
            {(formData.nome || formData.cpf || formData.cursoId) && (
              <div className="border border-gray-200 rounded-md p-3 bg-gray-50">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Preview do Usuário:</h4>
                <div className="text-sm text-gray-600">
                  <div><strong>Nome:</strong> {formData.nome || '[Nome]'}</div>
                  <div><strong>CPF:</strong> {formData.cpf || '[CPF]'}</div>
                  <div><strong>Curso:</strong> {cursos.find(c => c.id.toString() === formData.cursoId)?.nome || '[Curso]'}</div>
                </div>
              </div>
            )}

            {/* Botão Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-red-600 text-white rounded-lg hover:bg-orange-700 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {isLoading ? '👤 Cadastrando...' : '👤 Cadastrar Usuário'}
            </button>
          </form>

          {/* Informações adicionais */}
          <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-sm font-medium text-blue-800 mb-1">💡 Informações:</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• O usuário receberá acesso com CPF e senha</li>
              <li>• O curso escolhido não pode ser alterado pelo usuário</li>
              <li>• CPF deve ser único no sistema</li>
            </ul>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}