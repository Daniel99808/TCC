// components/Calendario.tsx
'use client';

import { useState, useEffect } from 'react';
import DynamicHeader from '../components/DynamicHeader';
import { useDarkMode } from '../contexts/DarkModeContext';
import { useSidebar } from '../contexts/SidebarContext';
import ProtectedRoute from '../components/ProtectedRoute';

// Tipagem para os eventos, para garantir que os dados da API estejam corretos
interface Evento {
  id: number;
  titulo: string;
  descricao: string;
  data: string;
}

const CalendarioPage = () => {
  const [dataAtual, setDataAtual] = useState(new Date());
  const [eventosDoMes, setEventosDoMes] = useState<Evento[]>([]);
  const [diaSelecionado, setDiaSelecionado] = useState<number | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const { isDarkMode } = useDarkMode();
  const { isSidebarOpen } = useSidebar();

  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const buscarEventos = async (data: Date) => {
    setCarregando(true);
    setErro(null);
    try {
      const ano = data.getFullYear();
      const mes = data.getMonth();
      const inicioDoMes = new Date(ano, mes, 1).toISOString();
      const fimDoMes = new Date(ano, mes + 1, 0).toISOString();

      const response = await fetch(`http://localhost:3000/calendario?inicio=${inicioDoMes}&fim=${fimDoMes}`);
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      
      const dados: Evento[] = await response.json();
      setEventosDoMes(dados);
    } catch (error) {
      console.error('Falha ao buscar eventos:', error);
      setEventosDoMes([]);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    buscarEventos(dataAtual);
  }, [dataAtual]);

  const eventosDoDia = eventosDoMes.filter(evento => {
    if (diaSelecionado === null) return false;
    const diaEvento = new Date(evento.data).getDate();
    const mesEvento = new Date(evento.data).getMonth();
    return diaEvento === diaSelecionado && mesEvento === dataAtual.getMonth();
  });

  const renderizarDias = () => {
    const ano = dataAtual.getFullYear();
    const mes = dataAtual.getMonth();
    const primeiroDiaSemana = new Date(ano, mes, 1).getDay();
    const ultimoDiaMes = new Date(ano, mes, 0).getDate();
    const ultimoDiaMesAnterior = new Date(ano, mes, 0).getDate();
    const dias = [];
    
    // Dias do mês anterior
    for (let i = primeiroDiaSemana - 1; i >= 0; i--) {
        dias.push(
            <div key={`vazio-${i}`} className={`p-2 sm:p-3 md:p-4 lg:p-5 text-center transition-colors duration-300 text-xl sm:text-2xl md:text-3xl lg:text-4xl min-h-[50px] sm:min-h-[60px] md:min-h-[70px] lg:min-h-[80px] flex items-center justify-center font-bold ${isDarkMode ? 'text-gray-500/50' : 'text-white/30'}`}>
                {ultimoDiaMesAnterior - i}
            </div>
        );
    }

    // Dias do mês atual
    for (let i = 1; i <= ultimoDiaMes; i++) {
      const isHoje = new Date().toDateString() === new Date(ano, mes, i).toDateString();
      const temEvento = eventosDoMes.some(evento => {
        const dataEvento = new Date(evento.data);
        return dataEvento.getDate() === i && dataEvento.getMonth() === mes;
      });
      const isSelecionado = diaSelecionado === i;
      const classes = `p-2 sm:p-3 md:p-4 lg:p-5 rounded-lg sm:rounded-xl text-center cursor-pointer transition-all duration-300 relative text-xl sm:text-2xl md:text-3xl lg:text-4xl min-h-[50px] sm:min-h-[60px] md:min-h-[70px] lg:min-h-[80px] flex items-center justify-center font-bold
        ${isDarkMode ? 'text-gray-200' : 'text-white'}
        ${isSelecionado ? 'bg-gradient-to-br from-red-600 to-red-700 text-white font-bold shadow-2xl scale-110 ring-4 ring-red-500/50' : ''}
        ${isHoje && !isSelecionado ? 'border-2 border-blue-500 font-bold bg-blue-500/10 shadow-lg' : ''}
        ${temEvento && !isSelecionado ? 'text-red-500 font-bold' : ''}
        ${!isSelecionado && !isHoje ? (isDarkMode ? 'hover:bg-gradient-to-br hover:from-gray-700/30 hover:to-gray-800/30 hover:shadow-lg hover:scale-105' : 'hover:bg-gradient-to-br hover:from-white/10 hover:to-white/5 hover:shadow-lg hover:scale-105') : ''}
        active:scale-95
      `;

      dias.push(
        <div 
          key={i} 
          className={classes}
          onClick={() => setDiaSelecionado(i)}
        >
          <span className="relative">
            {i}
            {temEvento && (
              <div className="absolute -top-1 -right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-600 animate-pulse"></div>
            )}
          </span>
        </div>
      );
    }

    // Dias do próximo mês
    const diasRestantes = 42 - dias.length;
    for (let i = 1; i <= diasRestantes; i++) {
      dias.push(
          <div key={`proximo-${i}`} className={`p-2 sm:p-3 md:p-4 lg:p-5 text-center cursor-pointer transition-colors duration-300 text-xl sm:text-2xl md:text-3xl lg:text-4xl min-h-[50px] sm:min-h-[60px] md:min-h-[70px] lg:min-h-[80px] flex items-center justify-center font-bold ${isDarkMode ? 'text-gray-500/50' : 'text-white/30'}`}>
              {i}
          </div>
      );
    }

    return dias;
  };

  return (
    <ProtectedRoute allowedRoles={['ESTUDANTE', 'PROFESSOR', 'ADMIN']}>
      <div 
        className="flex flex-col min-h-screen font-sans"
        style={{
          backgroundImage: 'url(/fundo.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
        }}
      >
        <DynamicHeader />
        
        {/* Título Mobile - Visível apenas no mobile */}
        <div className="lg:hidden pt-16 pb-3">
          <h1 className={`text-2xl font-bold text-center transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Calendário
          </h1>
        </div>
        
        <main className={`transition-all duration-300 flex-1 p-2 sm:p-4 md:p-6 lg:p-8 relative z-0 animate-fade-in ${
          isSidebarOpen ? 'lg:ml-80' : 'lg:ml-0'
        }`}>
        {/* Título Principal - Oculto no mobile */}
        <h1 className={`hidden lg:block text-3xl sm:text-5xl font-bold mb-4 sm:mb-6 text-center m-4 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          Calendário
        </h1>

        {erro && (
          <div className="max-w-6xl mx-auto mb-2 sm:mb-4 p-2 sm:p-3 md:p-4 bg-red-100 border border-red-400 text-red-700 rounded text-xs sm:text-sm md:text-base">
            {erro}
          </div>
        )}
        
        <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8 lg:p-10 rounded-2xl shadow-2xl bg-black/20 backdrop-blur-sm border border-white/10">
          <div className="flex justify-between items-center mb-4 sm:mb-6 md:mb-8 gap-3">
            <button 
              onClick={() => setDataAtual(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
              className={`p-3 sm:p-4 text-2xl sm:text-3xl md:text-4xl font-bold rounded-full transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 hover:scale-110 ${
                isDarkMode 
                  ? 'text-white hover:bg-red-600/30 bg-gray-800/50' 
                  : 'text-gray-700 hover:bg-red-500/20 bg-white/30'
              }`}
              disabled={carregando || (
                dataAtual.getFullYear() === new Date().getFullYear() && dataAtual.getMonth() === 0
              )}
            >
              ←
            </button>

            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent text-center flex-1 px-2 drop-shadow-lg">
              {`${meses[dataAtual.getMonth()]} ${dataAtual.getFullYear()}`}
            </h2>

            <button 
              onClick={() => setDataAtual(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
              className={`p-3 sm:p-4 text-2xl sm:text-3xl md:text-4xl font-bold rounded-full transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 hover:scale-110 ${
                isDarkMode 
                  ? 'text-white hover:bg-red-600/30 bg-gray-800/50' 
                  : 'text-gray-700 hover:bg-red-500/20 bg-white/30'
              }`}
              disabled={carregando || (
                dataAtual.getFullYear() === new Date().getFullYear() && dataAtual.getMonth() === 11
              )}
            >
              →
            </button>

          </div>

          {carregando && (
            <div className="text-center mb-3 sm:mb-4">
              <div className={`text-xs sm:text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Carregando eventos...</div>
            </div>
          )}

          <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-red-500 font-extrabold text-base sm:text-lg md:text-xl lg:text-2xl mb-3 sm:mb-4">
            <div className="py-2">D</div>
            <div className="py-2">S</div>
            <div className="py-2">T</div>
            <div className="py-2">Q</div>
            <div className="py-2">Q</div>
            <div className="py-2">S</div>
            <div className="py-2">S</div>
          </div>

          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {renderizarDias()}
          </div>

          {/* Seção de Eventos */}
          <div className="mt-4 sm:mt-6 md:mt-8">
            <h3 className={`text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-center mb-3 sm:mb-4 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              {diaSelecionado ? `Eventos do dia ${diaSelecionado}` : 'Selecione um dia para ver os eventos'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {eventosDoDia.length > 0 ? (
                eventosDoDia.map(evento => (
                  <div key={evento.id} className={`p-4 sm:p-5 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border backdrop-blur-sm hover:scale-105 ${isDarkMode ? 'bg-black/30 hover:bg-black/40 border-white/20' : 'bg-black/20 hover:bg-black/30 border-white/20'}`}>
                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-red-500 break-words">
                      {evento.titulo}
                    </p>
                    <p className={`text-xs sm:text-sm mt-2 sm:mt-3 break-words transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-white/90'}`}>{evento.descricao}</p>
                  </div>
                ))
              ) : (
                <p className={`col-span-full text-center text-sm sm:text-base py-4 transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {diaSelecionado ? 'Nenhum evento para este dia.' : 'Clique em um dia para ver os eventos.'}
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
      </div>
    </ProtectedRoute>
  );
};

export default CalendarioPage;

