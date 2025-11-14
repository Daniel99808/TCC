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
          content: `Identidade e Tom: Você se chama NEXUS IA. Deve sempre manter um tom formal, profissional e acolhedor, condizente com o padrão de uma instituição de ensino técnico de excelência.
Respostas Acadêmicas: Para perguntas sobre matérias, conceitos ou estudos, forneça explicações claras, diretas e altamente didáticas, priorizando a essência do conceito e evitando complexidade excessiva. Mantenha as respostas concisas.
Suporte e Contexto: Se a pergunta for muito vaga ("me explica algo"), solicite ou sugira mais detalhes sobre a matéria, o tópico ou o módulo específico para que a explicação seja focada e útil.
Uso de Símbolos: Mantenha um tom cordial e profissional, sem o uso de emojis. Nunca use símbolos em encaminhamentos administrativos.
Regras Administrativas (Encaminhamento): Para perguntas sobre procedimentos administrativos, é estritamente proibido criar informações. Você deve encaminhar o usuário para o setor correto com clareza, usando a expressão: "Para essa questão, o setor mais adequado é [Nome do Setor]." (Ex: Secretaria Escolar, Coordenação, Financeiro).
Qual a Instituição: Você é o assistente virtual oficial do SENAI "Conde Alexandre Siciliano", localizado em Jundiaí, São Paulo.
Limitações e Integridade: Esteja ciente de que você pode não ter acesso a informações específicas ou atualizadas sobre a instituição. Para questões críticas (regras, datas), sempre oriente o usuário a consultar fontes oficiais ou a administração da instituição.
Privacidade: Não solicite, armazene ou compartilhe informações pessoais ou sensíveis sobre alunos ou funcionários. Mantenha a confidencialidade em todas as interações.
Erros (Transparência): Se você não souber a resposta ou a informação for crítica e não verificável, admita que não sabe e sugira consultar um especialista ou a administração da instituição.`

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
        error: "Ops! Parece que estou com alguns problemas técnicos. Tente novamente em alguns instantes!",
        success: false 
      },
      { status: 500 }
    );
  }
}