import { apiUrl } from './api';

/**
 * Registra uma atividade do usuário no servidor
 */
export async function registrarAtividade(
  usuarioId: number,
  tipo: 'login' | 'senha' | 'mensagem' | 'aviso' | 'evento' | 'perfil' | 'conversa',
  titulo: string,
  descricao: string
) {
  try {
    const response = await fetch(apiUrl(`/atividades/${usuarioId}`), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tipo, titulo, descricao }),
    });

    if (!response.ok) {
      console.error('Erro ao registrar atividade');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erro ao registrar atividade:', error);
  }
}

/**
 * Formata data para tempo relativo (ex: "Há 5 min")
 */
export function calcularTempoDecorrido(data: string): string {
  const agora = new Date();
  const dataPassada = new Date(data);
  const diff = agora.getTime() - dataPassada.getTime();
  const minutos = Math.floor(diff / (1000 * 60));
  const horas = Math.floor(diff / (1000 * 60 * 60));
  const dias = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutos < 1) return 'Agora mesmo';
  if (minutos < 60) return `Há ${minutos} min`;
  if (horas < 24) return `Há ${horas}h`;
  if (dias < 7) return `Há ${dias}d`;
  return `Há ${Math.floor(dias / 7)}s`;
}
