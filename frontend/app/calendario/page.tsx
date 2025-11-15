// components/Calendario.tsx
'use client';

import { useState, useEffect } from 'react';
import DynamicHeader from '../components/DynamicHeader';
import { useDarkMode } from '../contexts/DarkModeContext';
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
            <div key={`vazio-${i}`} className={`p-1.5 sm:p-2 text-center transition-colors duration-300 text-xs sm:text-sm md:text-base min-h-[36px] sm:min-h-[44px] flex items-center justify-center ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
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
      const classes = `p-1.5 sm:p-2 md:p-2.5 rounded-md sm:rounded-lg text-center cursor-pointer transition-all duration-200 relative text-sm sm:text-base md:text-lg min-h-[36px] sm:min-h-[44px] flex items-center justify-center
        ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}
        ${isSelecionado ? (isDarkMode ? 'bg-red-700 border-2 border-red-400 font-bold shadow-lg scale-105' : 'bg-red-200 border-2 border-red-500 font-bold shadow-lg scale-105') : ''}
        ${isHoje ? 'border-2 border-blue-500 font-semibold' : ''}
        ${temEvento ? 'text-red-600 font-semibold' : ''}
        ${!isSelecionado && !isHoje ? (isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100') : ''}
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
          <div key={`proximo-${i}`} className={`p-1.5 sm:p-2 text-center cursor-pointer transition-colors duration-300 text-xs sm:text-sm md:text-base min-h-[36px] sm:min-h-[44px] flex items-center justify-center ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
              {i}
          </div>
      );
    }

    return dias;
  };

  return (
    <ProtectedRoute allowedRoles={['ESTUDANTE', 'PROFESSOR', 'ADMIN']}>
      <div className={`flex flex-col min-h-screen font-sans transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <DynamicHeader />
        <main className="lg:ml-80 flex-1 p-2 sm:p-4 md:p-6 lg:p-8 overflow-auto relative z-0 animate-fade-in">
        {/* Título Principal - Visível apenas no mobile */}
        <h1 className={`lg:hidden text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center m-4 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          Calendário
        </h1>

        {erro && (
          <div className="max-w-6xl mx-auto mb-2 sm:mb-4 p-2 sm:p-3 md:p-4 bg-red-100 border border-red-400 text-red-700 rounded text-xs sm:text-sm md:text-base">
            {erro}
          </div>
        )}
        
        <div className={`max-w-7xl mx-auto p-3 sm:p-4 md:p-6 lg:p-8 rounded-lg sm:rounded-xl shadow-2xl transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex justify-between items-center mb-3 sm:mb-4 md:mb-6 gap-2">
            <button 
              onClick={() => setDataAtual(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
              className={`p-2 sm:p-3 text-lg sm:text-xl md:text-2xl font-bold rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 ${
                isDarkMode 
                  ? 'text-gray-300 hover:bg-gray-700' 
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
              disabled={carregando || (
                dataAtual.getFullYear() === new Date().getFullYear() && dataAtual.getMonth() === 0
              )}
            >
              ←
            </button>

            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-extrabold text-red-600 text-center flex-1 px-1">
              {`${meses[dataAtual.getMonth()]} ${dataAtual.getFullYear()}`}
            </h2>

            <button 
              onClick={() => setDataAtual(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
              className={`p-2 sm:p-3 text-lg sm:text-xl md:text-2xl font-bold rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 ${
                isDarkMode 
                  ? 'text-gray-300 hover:bg-gray-700' 
                  : 'text-gray-600 hover:bg-gray-200'
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

          <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-red-600 font-extrabold text-sm sm:text-base md:text-lg mb-2">
            <div>D</div><div>S</div><div>T</div><div>Q</div><div>Q</div><div>S</div><div>S</div>
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
                  <div key={evento.id} className={`p-3 sm:p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-650' : 'bg-gray-50 hover:bg-white'}`}>
                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-red-600 break-words">
                      {evento.titulo}
                    </p>
                    <p className={`text-xs sm:text-sm mt-1 sm:mt-2 break-words transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{evento.descricao}</p>
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

