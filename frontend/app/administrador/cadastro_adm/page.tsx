'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/header_adm';
import Footer from '../../components/footer';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { apiUrl } from '@/lib/api';

interface CadastroData {
  nome: string;
  cpf: string;
  password: string;
  confirmPassword: string;
  cursoId: string;
  role: string; // ADMIN, PROFESSOR ou ESTUDANTE
  hasAAPM: boolean;
  turma: string;
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
    cursoId: '',
    role: 'ESTUDANTE', // Valor padrão
    hasAAPM: false,
    turma: ''
  });
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const router = useRouter();
  const { isDarkMode } = useDarkMode();

  // Buscar cursos disponíveis
  useEffect(() => {
    const fetchCursos = async () => {
      try {
        const response = await fetch(apiUrl('/cursos'));
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
    if (!formData.nome || !formData.cpf || !formData.password || !formData.confirmPassword || !formData.role) {
      setMessage({ type: 'error', text: 'Todos os campos obrigatórios devem ser preenchidos' });
      return;
    }

    // Curso é obrigatório apenas se não for ADMIN
    if (formData.role !== 'ADMIN' && !formData.cursoId) {
      setMessage({ type: 'error', text: 'Curso é obrigatório para Professor e Estudante' });
      return;
    }

    // Validar turma para Professor e Estudante
    if ((formData.role === 'PROFESSOR' || formData.role === 'ESTUDANTE') && !formData.turma) {
      setMessage({ type: 'error', text: 'Turma é obrigatória para Professor e Estudante' });
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
      const response = await fetch(apiUrl('/cadastro'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome: formData.nome,
          cpf: formData.cpf.replace(/\D/g, ''), // Remove máscara para enviar apenas números
          password: formData.password,
          cursoId: formData.cursoId,
          role: formData.role, // Envia o cargo escolhido
          hasAAPM: formData.hasAAPM, // Envia status AAPM
          turma: formData.role !== 'ADMIN' ? formData.turma : null, // Envia turma apenas se não for ADMIN
        }),
      });

      const data: ApiResponse = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message });
        setFormData({ nome: '', cpf: '', password: '', confirmPassword: '', cursoId: '', role: 'ESTUDANTE', hasAAPM: false, turma: '' });
        
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
    <div className="min-h-screen flex flex-col" style={{backgroundImage: 'url(/fundo.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed'}}>
      <Header />
      
      {/* Título Mobile - Visível apenas no mobile */}
      <div className="lg:hidden pt-16 pb-4 px-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-center transition-colors duration-300 text-white">
          Cadastro de Usuário
        </h1>
        <p className="text-center mt-2 text-sm transition-colors duration-300 text-white">
          Painel Administrativo
        </p>
      </div>
      
      <main className="flex-1 flex items-center justify-center p-2 sm:p-3 md:p-4 lg:p-6 animate-fade-in transition-all duration-300 lg:ml-[360px]">
        <div className="p-4 sm:p-6 md:p-8 lg:p-10 rounded-2xl shadow-2xl w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20">
          {/* Cabeçalho - Oculto no mobile */}
          <div className="text-center mb-4 sm:mb-6 md:mb-8 hidden lg:block">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold transition-colors duration-300 text-white">Cadastro de Usuário</h1>
            <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm md:text-base transition-colors duration-300 text-white">Painel Administrativo</p>
            <div className="w-12 h-1 bg-gradient-to-r from-orange-600 to-orange-700 mx-auto mt-2 sm:mt-3 rounded-full shadow-lg"></div>
          </div>

            {/* Mensagem de feedback */}
          {message && (
            <div className={`mb-3 sm:mb-4 p-2.5 sm:p-3 md:p-4 rounded-lg text-xs sm:text-sm font-semibold shadow-lg ${
              message.type === 'success' 
                ? 'bg-green-600/20 text-green-100 border border-green-500/30 backdrop-blur-sm' 
                : 'bg-red-600/20 text-red-100 border border-red-500/30 backdrop-blur-sm'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {/* Campo Nome */}
            <div>
              <label htmlFor="nome" className={`block text-xs sm:text-sm font-bold mb-1.5 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-white'}`}>
                Nome Completo *
              </label>
              <input
                type="text"
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleInputChange}
                placeholder="Nome completo"
                className="w-full p-2.5 sm:p-3 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium transition-all duration-300 bg-white/15 backdrop-blur-lg border-2 border-white/30 text-white placeholder-white/60 hover:bg-white/20 hover:border-white/40 focus:bg-white/25"
                disabled={isLoading}
              />
            </div>

            {/* Campo CPF */}
            <div>
              <label htmlFor="cpf" className={`block text-xs sm:text-sm font-bold mb-1.5 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-white'}`}>
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
                className="w-full p-2.5 sm:p-3 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium transition-all duration-300 bg-white/15 backdrop-blur-lg border-2 border-white/30 text-white placeholder-white/60 hover:bg-white/20 hover:border-white/40 focus:bg-white/25"
                disabled={isLoading}
              />
            </div>

            {/* Campo Curso - Não aparece se for ADMIN */}
            {formData.role !== 'ADMIN' && (
              <div>
                <label htmlFor="cursoId" className={`block text-xs sm:text-sm font-bold mb-1.5 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-white'}`}>
                  Curso *
                </label>
                <select
                  id="cursoId"
                  name="cursoId"
                  value={formData.cursoId}
                  onChange={(e) => setFormData(prev => ({ ...prev, cursoId: e.target.value }))}
                  className="w-full p-2.5 sm:p-3 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium transition-all duration-300 bg-gray-900/70 backdrop-blur-lg border-2 border-white/30 text-white hover:bg-gray-900/80 hover:border-white/40 focus:bg-gray-900/90"
                  disabled={isLoading}
                  style={{
                    colorScheme: 'dark',
                    backgroundColor: 'rgb(17 24 39 / 0.7)'
                  }}
                >
                  <option value="">Selecione o curso</option>
                  {cursos.map((curso) => (
                    <option key={curso.id} value={curso.id}>
                      {curso.nome}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Campo Cargo (Role) */}
            <div>
              <label htmlFor="role" className={`block text-xs sm:text-sm font-bold mb-1.5 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-white'}`}>
                Cargo *
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={(e) => {
                  const newRole = e.target.value;
                  if (newRole === 'ADMIN') {
                    setFormData(prev => ({ ...prev, role: newRole, cursoId: '', turma: '' }));
                  } else {
                    setFormData(prev => ({ ...prev, role: newRole }));
                  }
                }}
                className="w-full p-2.5 sm:p-3 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium transition-all duration-300 bg-gray-900/70 backdrop-blur-lg border-2 border-white/30 text-white hover:bg-gray-900/80 hover:border-white/40 focus:bg-gray-900/90"
                disabled={isLoading}
                style={{
                  colorScheme: 'dark',
                  backgroundColor: 'rgb(17 24 39 / 0.7)'
                }}
              >
                <option value="ESTUDANTE">Estudante</option>
                <option value="PROFESSOR">Professor</option>
                <option value="ADMIN">Administrador</option>
              </select>
              <p className="text-xs mt-1 font-medium text-white">
                Nível de acesso do usuário
              </p>
            </div>

            {/* Campo Turma - Apenas para Professor e Estudante */}
            {(formData.role === 'PROFESSOR' || formData.role === 'ESTUDANTE') && (
              <div>
                <label htmlFor="turma" className={`block text-xs sm:text-sm font-bold mb-1.5 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-white'}`}>
                  Turma *
                </label>
                <select
                  id="turma"
                  name="turma"
                  value={formData.turma}
                  onChange={(e) => setFormData(prev => ({ ...prev, turma: e.target.value }))}
                  className="w-full p-2.5 sm:p-3 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium transition-all duration-300 bg-gray-900/70 backdrop-blur-lg border-2 border-white/30 text-white hover:bg-gray-900/80 hover:border-white/40 focus:bg-gray-900/90"
                  disabled={isLoading}
                  style={{
                    colorScheme: 'dark',
                    backgroundColor: 'rgb(17 24 39 / 0.7)'
                  }}
                >
                  <option value="">Selecione a turma</option>
                  <option value="A">Turma A</option>
                  <option value="B">Turma B</option>
                </select>
                <p className="text-xs mt-1 font-medium text-white">
                  Obrigatório para Professor e Estudante
                </p>
              </div>
            )}

            {/* Campo AAPM - Apenas para Estudante */}
            {formData.role === 'ESTUDANTE' && (
              <div className="rounded-lg p-3 sm:p-4 bg-white/10 backdrop-blur-sm border border-white/20">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <label htmlFor="hasAAPM" className="text-xs sm:text-sm font-semibold text-white">
                      Benefício AAPM
                    </label>
                    <p className="text-xs mt-0.5 sm:mt-1 text-white">
                      Benefício AAPM?
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input
                      type="checkbox"
                      id="hasAAPM"
                      name="hasAAPM"
                      checked={formData.hasAAPM}
                      onChange={(e) => setFormData(prev => ({ ...prev, hasAAPM: e.target.checked }))}
                      className="sr-only peer"
                      disabled={isLoading}
                    />
                    <div className="w-10 h-6 sm:w-12 sm:h-6 bg-gray-400/30 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-500/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600 shadow-lg"></div>
                  </label>
                </div>
                <div className="mt-2">
                  <span className={`inline-block px-2 sm:px-3 py-1 rounded-lg text-xs font-bold shadow-md ${
                    formData.hasAAPM 
                      ? 'bg-green-600/80 text-white border border-green-500/30' 
                      : 'bg-gray-500/30 text-white border border-gray-400/30'
                  }`}>
                    {formData.hasAAPM ? '✓ Com AAPM' : '✗ Sem AAPM'}
                  </span>
                </div>
              </div>
            )}

            {/* Campo Senha */}
            <div>
              <label htmlFor="password" className={`block text-xs sm:text-sm font-bold mb-1.5 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-white'}`}>
                Senha *
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Senha"
                className="w-full p-2.5 sm:p-3 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium transition-all duration-300 bg-white/15 backdrop-blur-lg border-2 border-white/30 text-white placeholder-white/60 hover:bg-white/20 hover:border-white/40 focus:bg-white/25"
                disabled={isLoading}
              />
            </div>

            {/* Campo Confirmar Senha */}
            <div>
              <label htmlFor="confirmPassword" className={`block text-xs sm:text-sm font-bold mb-1.5 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-white'}`}>
                Confirmar Senha *
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirme a senha"
                className="w-full p-2.5 sm:p-3 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium transition-all duration-300 bg-white/15 backdrop-blur-lg border-2 border-white/30 text-white placeholder-white/60 hover:bg-white/20 hover:border-white/40 focus:bg-white/25"
                disabled={isLoading}
              />
            </div>

            {/* Preview dos dados */}
            {(formData.nome || formData.cpf || formData.cursoId) && (
              <div className="rounded-lg p-3 sm:p-4 bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-blue-500/30 shadow-lg">
                <h4 className={`text-xs sm:text-sm font-bold mb-2 sm:mb-3 ${isDarkMode ? 'text-blue-200' : 'text-blue-800'}`}>📋 Preview:</h4>
                <div className="text-xs sm:text-sm space-y-1 sm:space-y-2 text-white">
                  <div><strong>Nome:</strong> {formData.nome || '[Nome]'}</div>
                  <div><strong>CPF:</strong> {formData.cpf || '[CPF]'}</div>
                  <div><strong>Curso:</strong> {cursos.find(c => c.id.toString() === formData.cursoId)?.nome || '[Curso]'}</div>
                  <div><strong>Cargo:</strong> {
                    formData.role === 'ADMIN' ? 'Admin' :
                    formData.role === 'PROFESSOR' ? 'Professor' : 'Estudante'
                  }</div>
                  {(formData.role === 'PROFESSOR' || formData.role === 'ESTUDANTE') && formData.turma && (
                    <div><strong>Turma:</strong> {formData.turma}</div>
                  )}
                  {formData.role === 'ESTUDANTE' && (
                    <div><strong>AAPM:</strong> {formData.hasAAPM ? '✓ Sim' : '✗ Não'}</div>
                  )}
                </div>
              </div>
            )}

            {/* Botão Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 sm:py-3 md:py-4 px-3 sm:px-4 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white rounded-lg transition-all duration-300 shadow-xl hover:shadow-2xl font-bold text-sm sm:text-base md:text-lg transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? '⏳ Cadastrando...' : '✓ Cadastrar'}
            </button>
          </form>

          {/* Informações adicionais */}
          <div className="mt-3 sm:mt-4 md:mt-6 p-3 sm:p-4 bg-blue-600/20 backdrop-blur-sm rounded-lg border border-blue-500/30 shadow-lg">
            <h4 className={`text-xs sm:text-sm font-bold mb-1.5 sm:mb-2 ${isDarkMode ? 'text-blue-200' : 'text-blue-800'}`}>ℹ️ Informações:</h4>
            <ul className={`text-xs space-y-0.5 sm:space-y-1 ${isDarkMode ? 'text-blue-200' : 'text-blue-700'}`}>
              <li>• Acesso com CPF e senha</li>
              <li>• Curso não pode ser alterado</li>
              <li>• CPF deve ser único</li>
            </ul>
          </div>
        </div>
      </main>      <Footer />
    </div>
  );
}
