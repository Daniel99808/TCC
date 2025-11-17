'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/header_adm';
import Footer from '../../components/footer';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { useSidebar } from '../../contexts/SidebarContext';

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
  const { isSidebarOpen } = useSidebar();

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
    if (!formData.nome || !formData.cpf || !formData.password || !formData.confirmPassword || !formData.cursoId || !formData.role) {
      setMessage({ type: 'error', text: 'Todos os campos obrigatórios devem ser preenchidos' });
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
        <h1 className={`text-2xl sm:text-3xl font-bold text-center transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          Cadastro de Usuário
        </h1>
        <p className={`text-center mt-2 text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
          Painel Administrativo
        </p>
      </div>
      
      <main className={`flex-1 flex items-center justify-center p-3 sm:p-4 md:p-6 lg:p-8 animate-fade-in transition-all duration-300 ${isSidebarOpen ? 'lg:ml-80' : 'lg:ml-0'}`}>
        <div className="p-6 sm:p-8 lg:p-10 rounded-2xl shadow-2xl w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20">
          {/* Cabeçalho - Oculto no mobile */}
          <div className="text-center mb-6 sm:mb-8 hidden lg:block">
            <h1 className={`text-2xl lg:text-3xl font-bold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Cadastro de Usuário</h1>
            <p className={`mt-2 text-base transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Painel Administrativo</p>
            <div className="w-16 h-1 bg-gradient-to-r from-orange-600 to-orange-700 mx-auto mt-3 rounded-full shadow-lg"></div>
          </div>

            {/* Mensagem de feedback */}
          {message && (
            <div className={`mb-4 p-3 sm:p-4 rounded-xl text-sm shadow-lg ${
              message.type === 'success' 
                ? 'bg-green-600/20 text-green-100 border border-green-500/30 backdrop-blur-sm' 
                : 'bg-red-600/20 text-red-100 border border-red-500/30 backdrop-blur-sm'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campo Nome */}
            <div>
              <label htmlFor="nome" className={`block text-sm font-bold mb-2 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Nome Completo *
              </label>
              <input
                type="text"
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleInputChange}
                placeholder="Digite o nome completo do usuário"
                className={`w-full p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium transition-all duration-300 ${isDarkMode ? 'bg-gray-800 border-2 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-2 border-gray-300 text-gray-900 placeholder-gray-500'}`}
                disabled={isLoading}
              />
            </div>

            {/* Campo CPF */}
            <div>
              <label htmlFor="cpf" className={`block text-sm font-bold mb-2 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
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
                className={`w-full p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium transition-all duration-300 ${isDarkMode ? 'bg-gray-800 border-2 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-2 border-gray-300 text-gray-900 placeholder-gray-500'}`}
                disabled={isLoading}
              />
            </div>

            {/* Campo Curso */}
            <div>
              <label htmlFor="cursoId" className={`block text-sm font-bold mb-2 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Curso *
              </label>
              <select
                id="cursoId"
                name="cursoId"
                value={formData.cursoId}
                onChange={(e) => setFormData(prev => ({ ...prev, cursoId: e.target.value }))}
                className={`w-full p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium transition-all duration-300 ${isDarkMode ? 'bg-gray-800 border-2 border-gray-600 text-white [color-scheme:dark]' : 'bg-white border-2 border-gray-300 text-gray-900'}`}
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

            {/* Campo Cargo (Role) */}
            <div>
              <label htmlFor="role" className={`block text-sm font-bold mb-2 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Cargo *
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                className={`w-full p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium transition-all duration-300 ${isDarkMode ? 'bg-gray-800 border-2 border-gray-600 text-white [color-scheme:dark]' : 'bg-white border-2 border-gray-300 text-gray-900'}`}
                disabled={isLoading}
              >
                <option value="ESTUDANTE">Estudante</option>
                <option value="PROFESSOR">Professor</option>
                <option value="ADMIN">Administrador</option>
              </select>
              <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Selecione o nível de acesso do usuário no sistema
              </p>
            </div>

            {/* Campo Turma - Apenas para Professor e Estudante */}
            {(formData.role === 'PROFESSOR' || formData.role === 'ESTUDANTE') && (
              <div>
                <label htmlFor="turma" className={`block text-sm font-bold mb-2 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Turma *
                </label>
                <select
                  id="turma"
                  name="turma"
                  value={formData.turma}
                  onChange={(e) => setFormData(prev => ({ ...prev, turma: e.target.value }))}
                  className={`w-full p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium transition-all duration-300 ${isDarkMode ? 'bg-gray-800 border-2 border-gray-600 text-white [color-scheme:dark]' : 'bg-white border-2 border-gray-300 text-gray-900'}`}
                  disabled={isLoading}
                >
                  <option value="">Selecione a turma</option>
                  <option value="A">Turma A</option>
                  <option value="B">Turma B</option>
                </select>
                <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Obrigatório para Professor e Estudante
                </p>
              </div>
            )}

            {/* Campo AAPM - Apenas para Estudante */}
            {formData.role === 'ESTUDANTE' && (
              <div className="rounded-xl p-4 bg-white/10 backdrop-blur-sm border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <label htmlFor="hasAAPM" className={`text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      Benefício AAPM
                    </label>
                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Usuário possui benefício da AAPM?
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      id="hasAAPM"
                      name="hasAAPM"
                      checked={formData.hasAAPM}
                      onChange={(e) => setFormData(prev => ({ ...prev, hasAAPM: e.target.checked }))}
                      className="sr-only peer"
                      disabled={isLoading}
                    />
                    <div className="w-12 h-6 bg-gray-400/30 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-500/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600 shadow-lg"></div>
                  </label>
                </div>
                <div className="mt-3">
                  <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-bold shadow-md ${
                    formData.hasAAPM 
                      ? 'bg-green-600/80 text-white border border-green-500/30' 
                      : 'bg-gray-500/30 text-gray-200 border border-gray-400/30'
                  }`}>
                    {formData.hasAAPM ? '✓ Com AAPM' : '✗ Sem AAPM'}
                  </span>
                </div>
              </div>
            )}

            {/* Campo Senha */}
            <div>
              <label htmlFor="password" className={`block text-sm font-bold mb-2 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Senha *
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Digite a senha inicial"
                className={`w-full p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium transition-all duration-300 ${isDarkMode ? 'bg-gray-800 border-2 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-2 border-gray-300 text-gray-900 placeholder-gray-500'}`}
                disabled={isLoading}
              />
            </div>

            {/* Campo Confirmar Senha */}
            <div>
              <label htmlFor="confirmPassword" className={`block text-sm font-bold mb-2 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Confirmar Senha *
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirme a senha"
                className={`w-full p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium transition-all duration-300 ${isDarkMode ? 'bg-gray-800 border-2 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-2 border-gray-300 text-gray-900 placeholder-gray-500'}`}
                disabled={isLoading}
              />
            </div>

            {/* Preview dos dados */}
            {(formData.nome || formData.cpf || formData.cursoId) && (
              <div className="rounded-xl p-4 bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-blue-500/30 shadow-lg">
                <h4 className={`text-sm font-bold mb-3 ${isDarkMode ? 'text-blue-200' : 'text-blue-800'}`}>📋 Preview do Usuário:</h4>
                <div className={`text-sm space-y-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  <div><strong>Nome:</strong> {formData.nome || '[Nome]'}</div>
                  <div><strong>CPF:</strong> {formData.cpf || '[CPF]'}</div>
                  <div><strong>Curso:</strong> {cursos.find(c => c.id.toString() === formData.cursoId)?.nome || '[Curso]'}</div>
                  <div><strong>Cargo:</strong> {
                    formData.role === 'ADMIN' ? 'Administrador' :
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
              className="w-full py-3 sm:py-4 px-4 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl font-bold transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-base sm:text-lg"
            >
              {isLoading ? '⏳ Cadastrando...' : '✓ Cadastrar Usuário'}
            </button>
          </form>

          {/* Informações adicionais */}
          <div className="mt-6 p-4 bg-blue-600/20 backdrop-blur-sm rounded-xl border border-blue-500/30 shadow-lg">
            <h4 className={`text-sm font-bold mb-2 ${isDarkMode ? 'text-blue-200' : 'text-blue-800'}`}>ℹ️ Informações:</h4>
            <ul className={`text-xs space-y-1.5 ${isDarkMode ? 'text-blue-200' : 'text-blue-700'}`}>
              <li>• O usuário receberá acesso com CPF e senha</li>
              <li>• O curso escolhido não pode ser alterado pelo usuário</li>
              <li>• CPF deve ser único no sistema</li>
            </ul>
          </div>
        </div>
      </main>      <Footer />
    </div>
  );
}