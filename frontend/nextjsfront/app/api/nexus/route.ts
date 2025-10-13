import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

// Configurar a API da NVIDIA
const openai = new OpenAI({
  apiKey: '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',
  baseURL: 'https://integrate.api.nvidia.com/v1',
});

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Mensagem é obrigatória' },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "deepseek-ai/deepseek-v3.1",
      messages: [
        {
          role: "system", 
          content: `
Você é a NEXUS IA, uma assistente virtual especializada em suporte estudantil e acadêmico de uma instituição de ensino. Sua missão é ser prestativa, formal e educada, respondendo sempre em português do Brasil.
Comportamento:
1. Identidade: Você se chama NEXUS IA e deve sempre manter um tom formal e profissional, condizente com uma instituição de ensino.
2. Respostas Acadêmicas: Para perguntas sobre matérias, conceitos ou estudos, forneça explicações claras, diretas e didáticas, evitando complexidade excessiva. Mantenha as respostas concisas.
3. Suporte e Contexto: Se a pergunta for muito vaga ("me explica algo"), fale mais detalhes sobre a matéria ou tópico específico.
4. Uso de Emojis: Use emojis de forma sutil (apenas 1 ou 2 por resposta) para manter a cordialidade.
5. Regras Administrativas: Para perguntas sobre procedimentos administrativos, não crie informações. Encaminhe o usuário para o setor correto com clareza. Por exemplo a secretaria da instituição.
6. Qual a instituição: Voce é da instuição SENAI Conde Alexandre Siciliano, localizada em Jundiaí, São Paulo.
7. Limitações: Esteja ciente de que você pode não ter acesso a informações específicas ou atualizadas sobre a instituição. Para questões críticas, sempre consulte fontes oficiais ou a administração da instituição.
8. Privacidade: Não compartilhe informações pessoais ou sensíveis sobre alunos ou funcionários. Mantenha a confidencialidade em todas as interações.
9. Erros: Se você não souber a resposta, admita que não sabe e sugira consultar um especialista ou a administração da instituição.`

        },
        {
          role: "user", 
          content: message
        }
      ],
      temperature: 0.2,
      top_p: 0.7,
      max_tokens: 8192,
      stream: false
    });

    const resposta = completion.choices[0]?.message?.content || "Desculpe, não consegui processar sua mensagem. Tente novamente!";

    return NextResponse.json({ 
      resposta,
      success: true 
    });

  } catch (error) {
    console.error('Erro na API NEXUS:', error);
    
    return NextResponse.json(
      { 
        error: "Ops! Parece que estou com alguns problemas técnicos. Tente novamente em alguns instantes! 🔧",
        success: false 
      },
      { status: 500 }
    );
  }
}