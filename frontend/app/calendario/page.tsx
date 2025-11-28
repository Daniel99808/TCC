// components/Calendario.tsx
'use client';

import { useState, useEffect } from 'react';
import DynamicHeader from '../components/DynamicHeader';
import Footer from '../components/footer';
import { useDarkMode } from '../contexts/DarkModeContext';
import { useSidebar } from '../contexts/SidebarContext';
import ProtectedRoute from '../components/ProtectedRoute';
import { apiUrl } from '@/lib/api';

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
  const { isSidebarOpen } = useSidebar();
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

      const response = await fetch(apiUrl(`/calendario?inicio=${inicioDoMes}&fim=${fimDoMes}`));
      
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
            <div key={`vazio-${i}`} className="p-1 sm:p-2 md:p-3 lg:p-4 text-center transition-colors duration-300 text-lg sm:text-xl md:text-2xl lg:text-3xl min-h-[40px] sm:min-h-[50px] md:min-h-[55px] lg:min-h-[60px] flex items-center justify-center font-bold text-gray-500/50">
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
      const classes = `p-1 sm:p-2 md:p-3 lg:p-4 rounded-lg sm:rounded-xl text-center cursor-pointer transition-all duration-300 relative text-lg sm:text-xl md:text-2xl lg:text-3xl min-h-[40px] sm:min-h-[50px] md:min-h-[55px] lg:min-h-[60px] flex items-center justify-center font-bold
        text-white
        ${isSelecionado ? 'bg-gradient-to-br from-red-600 to-red-700 text-white font-bold shadow-2xl scale-110 ring-4 ring-red-500/50' : ''}
        ${isHoje && !isSelecionado ? 'border-2 border-blue-500 font-bold bg-blue-500/10 shadow-lg' : ''}
        ${temEvento && !isSelecionado ? 'text-red-500 font-bold' : ''}
        ${!isSelecionado && !isHoje ? 'hover:bg-gradient-to-br hover:from-gray-700/30 hover:to-gray-800/30 hover:shadow-lg hover:scale-105' : ''}
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
              <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></div>
            )}
          </span>
        </div>
      );
    }

    // Dias do próximo mês
    const diasRestantes = 42 - dias.length;
    for (let i = 1; i <= diasRestantes; i++) {
      dias.push(
          <div key={`proximo-${i}`} className="p-1 sm:p-2 md:p-3 lg:p-4 text-center cursor-pointer transition-colors duration-300 text-lg sm:text-xl md:text-2xl lg:text-3xl min-h-[40px] sm:min-h-[50px] md:min-h-[55px] lg:min-h-[60px] flex items-center justify-center font-bold text-gray-500/50">
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
        <div className="lg:hidden pt-16 pb-4 px-4">
          <p className="text-sm text-red-600 text-center mb-1 font-semibold">Comunidade</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-center transition-colors duration-300 text-white">
            Calendário
          </h1>
          <p className="text-center text-sm mt-2 transition-colors duration-300 text-gray-200">
            Visualize os próximos eventos
          </p>
        </div>
        
        <main className={`transition-all duration-300 flex-1 p-2 sm:p-4 md:p-6 lg:p-8 relative z-0 animate-fade-in ${
          isSidebarOpen ? 'lg:ml-[360px]' : 'lg:ml-0'
        }`}>
        {/* Título Principal - Oculto no mobile */}
        <div className="hidden lg:block text-center mb-6 sm:mb-8">
          <p className="text-sm text-red-600 font-semibold">Comunidade</p>
          <h1 className="text-3xl lg:text-4xl font-bold transition-colors duration-300 text-white">
            Calendário
          </h1>
          <p className="mt-2 text-base lg:text-lg transition-colors duration-300 text-gray-200">
            Visualize os próximos eventos da comunidade
          </p>
        </div>

        {erro && (
          <div className="max-w-6xl mx-auto mb-4 p-3 sm:p-4 bg-red-600/20 border border-red-500/30 text-red-200 rounded-lg text-xs sm:text-sm md:text-base backdrop-blur-sm">
            {erro}
          </div>
        )}
        
        <div className="max-w-6xl mx-auto p-3 sm:p-4 md:p-6 lg:p-8 rounded-2xl shadow-2xl bg-white/10 backdrop-blur-lg border border-white/20">
          <div className="flex justify-between items-center mb-4 sm:mb-6 gap-2">
            <button 
              onClick={() => setDataAtual(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
              className="p-2 sm:p-3 text-xl sm:text-2xl md:text-3xl font-bold rounded-full transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 hover:scale-110 text-white hover:bg-red-600/30 bg-gray-800/50"
              disabled={carregando || (
                dataAtual.getFullYear() === new Date().getFullYear() && dataAtual.getMonth() === 0
              )}
            >
              ←
            </button>

            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent text-center flex-1 px-2 drop-shadow-lg">
              {`${meses[dataAtual.getMonth()]} ${dataAtual.getFullYear()}`}
            </h2>

            <button 
              onClick={() => setDataAtual(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
              className="p-2 sm:p-3 text-xl sm:text-2xl md:text-3xl font-bold rounded-full transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 hover:scale-110 text-white hover:bg-red-600/30 bg-gray-800/50"
              disabled={carregando || (
                dataAtual.getFullYear() === new Date().getFullYear() && dataAtual.getMonth() === 11
              )}
            >
              →
            </button>

          </div>

          {carregando && (
            <div className="text-center mb-4">
              <div className="text-xs sm:text-sm transition-colors duration-300 text-gray-400">Carregando eventos...</div>
            </div>
          )}

          <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-red-500 font-extrabold text-sm sm:text-base md:text-lg lg:text-xl mb-3 sm:mb-4">
            <div className="py-1">D</div>
            <div className="py-1">S</div>
            <div className="py-1">T</div>
            <div className="py-1">Q</div>
            <div className="py-1">Q</div>
            <div className="py-1">S</div>
            <div className="py-1">S</div>
          </div>

          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-6 sm:mb-8">
            {renderizarDias()}
          </div>

          {/* Seção de Eventos */}
          <div className="border-t border-white/20 pt-6 sm:pt-8">
            <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-center mb-4 sm:mb-6 transition-colors duration-300 text-white">
              {diaSelecionado ? `Eventos do dia ${diaSelecionado} de ${meses[dataAtual.getMonth()]}` : 'Selecione um dia para ver os eventos'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {eventosDoDia.length > 0 ? (
                eventosDoDia.map(evento => (
                  <div key={evento.id} className="p-4 sm:p-5 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border backdrop-blur-sm hover:scale-105 bg-gradient-to-br from-white/20 to-white/10 border-white/20">
                    <p className="text-base sm:text-lg md:text-xl font-bold text-red-400 break-words mb-2">
                      {evento.titulo}
                    </p>
                    <p className="text-xs sm:text-sm break-words transition-colors duration-300 text-gray-300">{evento.descricao}</p>
                    <p className="text-xs mt-3 text-gray-400">
                      {new Date(evento.data).toLocaleString('pt-BR')}
                    </p>
                  </div>
                ))
              ) : (
                <p className="col-span-full text-center text-sm sm:text-base py-8 transition-colors duration-300 text-gray-400">
                  {diaSelecionado ? 'Nenhum evento para este dia.' : 'Clique em um dia para ver os eventos.'}
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default CalendarioPage;

