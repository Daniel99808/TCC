// Configuração da URL da API
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Helper para fazer requisições à API
export const apiUrl = (path: string) => `${API_URL}${path}`;
