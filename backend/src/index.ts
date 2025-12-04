import 'dotenv/config';
import express from 'express';
import { Server } from 'socket.io';
import http from 'http';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const app = express();
const server = http.createServer(app);

// Configurar CORS - permite frontend local e produção
const allowedOrigins = [
  'http://localhost:3001',
  'http://localhost:3000',
  process.env.FRONTEND_URL || '*'
];

// Configurar Socket.IO
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true
  }
});

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

// Mapa para armazenar atividades em memória (usuarioId -> atividades[])
const atividadesMemoria = new Map<number, Array<{
  tipo: string;
  titulo: string;
  descricao: string;
  createdAt: string;
}>>();

// Rota inicial
app.get('/', (req, res) => {
  res.send('Servidor rodando!');
});

// Rotas de Usuários
app.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        cpf: true,
        createdAt: true,
      }
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Rota para listar cursos
app.get('/cursos', async (req, res) => {
  try {
    const cursos = await prisma.curso.findMany({
      orderBy: {
        nome: 'asc'
      }
    });
    res.json(cursos);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

app.post('/cadastro', async (req, res) => {
  try {
    const { nome, cpf, password, cursoId, role, hasAAPM, turma } = req.body;

    if (!nome || !cpf || !password || !role) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        message: 'Nome, CPF, senha e cargo são obrigatórios' 
      });
    }

    // Curso é obrigatório apenas se não for ADMIN
    if (role !== 'ADMIN' && !cursoId) {
      return res.status(400).json({ 
        error: 'Missing course', 
        message: 'Curso é obrigatório para Professor e Estudante' 
      });
    }

    // Validar turma para Professor e Estudante
    if ((role === 'PROFESSOR' || role === 'ESTUDANTE') && !turma) {
      return res.status(400).json({ 
        error: 'Missing turma', 
        message: 'Turma é obrigatória para Professor e Estudante' 
      });
    }

    if (cpf.length !== 11 || !/^\d+$/.test(cpf)) {
      return res.status(400).json({ 
        error: 'Invalid CPF', 
        message: 'CPF deve conter exatamente 11 dígitos' 
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { cpf }
    });

    if (existingUser) {
      return res.status(409).json({ 
        error: 'User already exists', 
        message: 'Usuário com este CPF já está cadastrado' 
      });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Verificar se o curso existe (se não for ADMIN)
    let curso = null;
    if (role !== 'ADMIN' && cursoId) {
      curso = await prisma.curso.findUnique({
        where: { id: parseInt(cursoId) }
      });

      if (!curso) {
        return res.status(400).json({ 
          error: 'Invalid course', 
          message: 'Curso selecionado não existe' 
        });
      }
    }

    // Validar role
    if (!['ADMIN', 'PROFESSOR', 'ESTUDANTE'].includes(role)) {
      return res.status(400).json({ 
        error: 'Invalid role', 
        message: 'Cargo deve ser ADMIN, PROFESSOR ou ESTUDANTE' 
      });
    }

    const newUser = await prisma.user.create({
      data: {
        nome,
        cpf,
        password: hashedPassword,
        cursoId: role !== 'ADMIN' ? parseInt(cursoId) : null, // null para ADMIN
        role: role, // Salva o cargo escolhido
        hasAAPM: hasAAPM || false, // Salva status AAPM (padrão false)
        turma: role !== 'ADMIN' ? turma : null, // Salva turma (null para ADMIN)
      },
      include: {
        curso: true
      }
    });

    const { password: _, ...userResponse } = newUser;

    res.status(201).json({
      message: 'Usuário cadastrado com sucesso',
      user: userResponse
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ 
      error: 'Failed to create user',
      message: 'Erro interno do servidor'
    });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { cpf, password } = req.body;

    if (!cpf || !password) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        message: 'CPF e senha são obrigatórios' 
      });
    }

    const user = await prisma.user.findUnique({
      where: { cpf },
      include: {
        curso: true
      }
    });

    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid credentials', 
        message: 'CPF ou senha incorretos' 
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Invalid credentials', 
        message: 'CPF ou senha incorretos' 
      });
    }

    const { password: _, ...userResponse } = user;

    // Registrar atividade de login
    const atividade = {
      tipo: 'login',
      titulo: 'Login realizado',
      descricao: `Você fez login no sistema`,
      createdAt: new Date().toISOString()
    };
    
    if (!atividadesMemoria.has(user.id)) {
      atividadesMemoria.set(user.id, []);
    }
    atividadesMemoria.get(user.id)!.unshift(atividade);

    res.json({
      message: 'Login realizado com sucesso',
      user: {
        ...userResponse,
        role: user.role // ADMIN, PROFESSOR ou ESTUDANTE
      }
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ 
      error: 'Login failed',
      message: 'Erro interno do servidor'
    });
  }
});

// Rota para buscar perfil do usuário
app.get('/perfil/:cpf', async (req, res) => {
  try {
    const { cpf } = req.params;

    if (!cpf) {
      return res.status(400).json({ 
        error: 'CPF é obrigatório' 
      });
    }

    const user = await prisma.user.findUnique({
      where: { cpf },
      select: {
        id: true,
        nome: true,
        cpf: true,
        role: true,
        cursoId: true,
        createdAt: true,
        curso: {
          select: {
            id: true,
            nome: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ 
        error: 'Usuário não encontrado' 
      });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar perfil do usuário'
    });
  }
});

// Rotas de Conversas (estilo WhatsApp)

// Buscar todas as conversas do usuário
app.get('/conversas/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    const conversas = await prisma.conversa.findMany({
      where: {
        OR: [
          { usuario1Id: userId },
          { usuario2Id: userId }
        ]
      },
      include: {
        usuario1: {
          select: { id: true, nome: true }
        },
        usuario2: {
          select: { id: true, nome: true }
        },
        mensagens: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            remetente: {
              select: { id: true, nome: true }
            }
          }
        },
        _count: {
          select: {
            mensagens: {
              where: {
                lida: false,
                remetenteId: { not: userId }
              }
            }
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.json(conversas);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Buscar mensagens de uma conversa específica
app.get('/conversa/:conversaId/mensagens', async (req, res) => {
  try {
    const conversaId = parseInt(req.params.conversaId);

    const mensagens = await prisma.mensagem.findMany({
      where: { conversaId },
      include: {
        remetente: {
          select: { id: true, nome: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    res.json(mensagens);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Criar ou buscar conversa entre dois usuários
app.post('/conversa', async (req, res) => {
  try {
    const { usuario1Id, usuario2Id } = req.body;

    if (!usuario1Id || !usuario2Id) {
      return res.status(400).json({ error: 'IDs dos usuários são obrigatórios' });
    }

    // Garantir ordem consistente dos IDs
    const menorId = Math.min(usuario1Id, usuario2Id);
    const maiorId = Math.max(usuario1Id, usuario2Id);

    let conversa = await prisma.conversa.findUnique({
      where: {
        usuario1Id_usuario2Id: {
          usuario1Id: menorId,
          usuario2Id: maiorId
        }
      },
      include: {
        usuario1: { select: { id: true, nome: true } },
        usuario2: { select: { id: true, nome: true } }
      }
    });

    if (!conversa) {
      conversa = await prisma.conversa.create({
        data: {
          usuario1Id: menorId,
          usuario2Id: maiorId
        },
        include: {
          usuario1: { select: { id: true, nome: true } },
          usuario2: { select: { id: true, nome: true } }
        }
      });
    }

    res.json(conversa);
  } catch (error) {
    console.error('Error creating/finding conversation:', error);
    res.status(500).json({ error: 'Failed to create/find conversation' });
  }
});

// Enviar mensagem
app.post('/mensagem', async (req, res) => {
  try {
    const { conteudo, remetenteId, conversaId } = req.body;

    if (!conteudo || !remetenteId || !conversaId) {
      return res.status(400).json({ error: 'Conteúdo, remetenteId e conversaId são obrigatórios' });
    }

    const novaMensagem = await prisma.mensagem.create({
      data: {
        conteudo,
        remetenteId: parseInt(remetenteId),
        conversaId: parseInt(conversaId)
      },
      include: {
        remetente: {
          select: { id: true, nome: true }
        }
      }
    });

    // Atualizar timestamp da conversa
    await prisma.conversa.update({
      where: { id: parseInt(conversaId) },
      data: { updatedAt: new Date() }
    });

    // Emitir mensagem via Socket.IO
    io.emit(`conversa-${conversaId}`, novaMensagem);

    res.status(201).json(novaMensagem);
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({ error: 'Failed to create message' });
  }
});

// Listar todos os usuários (para iniciar conversas)
app.get('/usuarios', async (req, res) => {
  try {
    const usuarios = await prisma.user.findMany({
      select: {
        id: true,
        nome: true,
        cpf: true,
        hasAAPM: true,
        role: true,
        turma: true,
        curso: {
          select: {
            nome: true
          }
        }
      },
      orderBy: { nome: 'asc' }
    });

    res.json(usuarios);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Rota para atualizar AAPM de um usuário
app.patch('/usuarios/:id/aapm', async (req, res) => {
  try {
    const { id } = req.params;
    const { hasAAPM } = req.body;

    if (typeof hasAAPM !== 'boolean') {
      return res.status(400).json({ 
        error: 'Invalid data', 
        message: 'hasAAPM deve ser um valor booleano' 
      });
    }

    const usuario = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { hasAAPM },
      select: {
        id: true,
        nome: true,
        hasAAPM: true,
      }
    });

    res.json({
      message: 'Status AAPM atualizado com sucesso',
      usuario
    });
  } catch (error) {
    console.error('Error updating AAPM:', error);
    res.status(500).json({ error: 'Failed to update AAPM status' });
  }
});

// Rotas do Mural
app.get('/mural', async (req, res) => {
  try {
    const { userId } = req.query;
    
    console.log('GET /mural chamado com userId:', userId);
    
    let where: any = {};

    // Se userId for fornecido, filtrar baseado nos dados do usuário
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: parseInt(userId as string) },
        select: { cursoId: true, turma: true, role: true, nome: true }
      });

      console.log('Usuário encontrado:', user);

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      // Se for admin, retornar todas as mensagens
      if (user.role === 'ADMIN') {
        console.log('Usuário é ADMIN, retornando todas as mensagens');
        where = {}; // Sem filtro
      } else {
        // Para estudante ou professor, filtrar baseado em seu curso e turma
        console.log('Usuário é', user.role, '- filtrando por curso:', user.cursoId, 'turma:', user.turma);
        
        where.OR = [
          { tipoPublico: 'TODOS' }
        ];
        
        if (user.cursoId) {
          where.OR.push(
            { tipoPublico: 'CURSO', cursoId: user.cursoId }
          );
          
          // Se tiver turma, adicionar filtro de turma
          if (user.turma) {
            where.OR.push(
              { tipoPublico: 'TURMA', cursoId: user.cursoId, turma: user.turma }
            );
          }
        }
        
        console.log('Filtro WHERE construído:', JSON.stringify(where, null, 2));
      }
    } else {
      // Se não tiver userId, retornar erro ou apenas mensagens para TODOS
      console.log('Sem userId fornecido, retornando apenas mensagens TODOS');
      where.tipoPublico = 'TODOS';
    }
    
    const mural = await prisma.mural.findMany({
      where,
      select: {
        id: true,
        conteudo: true,
        tipoPublico: true,
        cursoId: true,
        turma: true,
        createdAt: true,
        curso: {
          select: {
            id: true,
            nome: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log('Mensagens encontradas:', mural.length);
    res.json(mural);
  } catch (error) {
    console.error('Erro detalhado:', error);
    res.status(500).json({ 
      error: 'Failed to fetch mural',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.post('/mural', async (req, res) => {
  try {
    console.log('POST /mural recebido');
    console.log('Body:', req.body);
    
    const { conteudo, tipoPublico, cursoId, turma } = req.body;
    
    if (!conteudo) {
      console.log('Erro: conteudo não fornecido');
      return res.status(400).json({ error: 'Missing required field: conteudo' });
    }

    console.log('Criando mensagem com:', { conteudo, tipoPublico, cursoId, turma });
    
    // Criar mensagem com os novos campos
    const newMessage = await prisma.mural.create({
      data: {
        conteudo,
        tipoPublico: tipoPublico || 'TODOS',
        cursoId: cursoId ? parseInt(cursoId) : null,
        turma: turma || null,
      },
      include: {
        curso: {
          select: {
            id: true,
            nome: true
          }
        }
      }
    });
    
    console.log('Mensagem criada:', newMessage);
    console.log('Detalhes da mensagem criada - tipoPublico:', newMessage.tipoPublico, 'cursoId:', newMessage.cursoId, 'turma:', newMessage.turma);

    // Determinar quem pode receber essa mensagem
    let recipientUsers: any[] = [];
    
    if (newMessage.tipoPublico === 'TODOS') {
      console.log('Mensagem TODOS - enviando para todos os clientes conectados');
      // Enviar para todos
      io.emit('novaMensagem', newMessage);
    } else if (newMessage.tipoPublico === 'CURSO' && newMessage.cursoId) {
      console.log('Mensagem CURSO - enviando para usuários do curso:', newMessage.cursoId);
      // Buscar todos os usuários deste curso e enviar
      recipientUsers = await prisma.user.findMany({
        where: { cursoId: newMessage.cursoId }
      });
      // Emitir para cada socket dos usuários deste curso
      // Por enquanto, emitir globalmente (melhorar com rooms depois)
      io.emit('novaMensagem', newMessage);
    } else if (newMessage.tipoPublico === 'TURMA' && newMessage.cursoId && newMessage.turma) {
      console.log('Mensagem TURMA - enviando para usuários da turma:', newMessage.cursoId, newMessage.turma);
      // Buscar usuários desta turma específica
      recipientUsers = await prisma.user.findMany({
        where: { 
          cursoId: newMessage.cursoId,
          turma: newMessage.turma
        }
      });
      // Emitir para cada socket dos usuários desta turma
      // Por enquanto, emitir globalmente (melhorar com rooms depois)
      io.emit('novaMensagem', newMessage);
    } else {
      console.log('Mensagem com dados incompletos, emitindo apenas para TODOS');
      io.emit('novaMensagem', newMessage);
    }
    console.log('Emissão Socket.IO completa - tipoPublico:', newMessage.tipoPublico);

    console.log('Retornando resposta 201');
    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error creating message:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    res.status(500).json({ error: 'Failed to create message', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// PATCH /mural/:id - Atualizar mensagem
app.patch('/mural/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { conteudo, tipoPublico, cursoId, turma } = req.body;

    if (!conteudo) {
      return res.status(400).json({ error: 'Missing required field: conteudo' });
    }

    const updatedMessage = await prisma.mural.update({
      where: { id: parseInt(id) },
      data: {
        conteudo,
        tipoPublico: tipoPublico || 'TODOS',
        cursoId: cursoId ? parseInt(cursoId) : null,
        turma: turma || null,
      },
      include: {
        curso: {
          select: {
            id: true,
            nome: true
          }
        }
      }
    });

    io.emit('mensagemAtualizada', updatedMessage);
    res.json(updatedMessage);
  } catch (error) {
    console.error('Error updating message:', error);
    res.status(500).json({ error: 'Failed to update message', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// DELETE /mural/:id - Deletar mensagem
app.delete('/mural/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deletedMessage = await prisma.mural.delete({
      where: { id: parseInt(id) }
    });

    io.emit('mensagemDeletada', { id: parseInt(id) });
    res.json({ success: true, message: 'Message deleted successfully', id: parseInt(id) });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Failed to delete message', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Rotas do Calendário
app.get('/calendario', async (req, res) => {
  try {
    const { inicio, fim } = req.query;

    if (!inicio || !fim) {
      return res.status(400).json({ error: 'Parâmetros de data "inicio" e "fim" são obrigatórios.' });
    }

    // Validar se as datas são válidas
    const dataInicio = new Date(inicio as string);
    const dataFim = new Date(fim as string);

    if (isNaN(dataInicio.getTime()) || isNaN(dataFim.getTime())) {
      return res.status(400).json({ error: 'Formato de data inválido. Use formato ISO.' });
    }

    const eventos = await prisma.calendario.findMany({
      where: {
        data: {
          gte: dataInicio,
          lte: dataFim,
        },
      },
      select: {
        id: true,
        titulo: true,
        descricao: true,
        data: true,
        tipoPublico: true,
        cursoId: true,
        turma: true,
      },
      orderBy: {
        data: 'asc',
      },
    });

    res.json(eventos);
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Endpoint para obter todos os eventos
app.get('/eventos', async (req, res) => {
  try {
    const eventos = await prisma.calendario.findMany({
      select: {
        id: true,
        titulo: true,
        descricao: true,
        data: true,
      },
      orderBy: {
        data: 'asc',
      },
    });

    // Converter o campo 'data' para 'dataEvento' para manter compatibilidade com frontend
    const eventosFormatados = eventos.map(evento => ({
      id: evento.id,
      titulo: evento.titulo,
      dataEvento: evento.data,
    }));

    res.json(eventosFormatados);
  } catch (error) {
    console.error('Error fetching all events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

app.post('/calendario', async (req, res) => {
  try {
    const { titulo, descricao, data, tipoPublico = 'TODOS', cursoId, turma } = req.body;

    console.log('Recebido POST /calendario:', { titulo, descricao, data, tipoPublico, cursoId, turma });

    if (!titulo || !data) {
      return res.status(400).json({ error: 'Os campos "titulo" e "data" são obrigatórios.' });
    }

    // Validar tipoPublico
    if (!['TODOS', 'CURSO', 'TURMA'].includes(tipoPublico)) {
      return res.status(400).json({ error: 'tipoPublico deve ser TODOS, CURSO ou TURMA' });
    }

    // Se não for para todos, validar cursoId
    if (tipoPublico !== 'TODOS' && !cursoId) {
      return res.status(400).json({ error: 'cursoId é obrigatório quando tipoPublico não é TODOS' });
    }

    // Se for para turma, validar turma
    if (tipoPublico === 'TURMA' && !turma) {
      return res.status(400).json({ error: 'turma é obrigatório quando tipoPublico é TURMA' });
    }

    // Validar se o curso existe (se informado)
    if (tipoPublico !== 'TODOS') {
      const cursoIdNum = parseInt(cursoId);
      const cursoExiste = await prisma.curso.findUnique({
        where: { id: cursoIdNum }
      });

      if (!cursoExiste) {
        return res.status(400).json({ error: 'Curso especificado não existe' });
      }
    }

    const novoEvento = await prisma.calendario.create({
      data: {
        titulo,
        descricao: descricao || '',
        data: new Date(data),
        tipoPublico,
        cursoId: tipoPublico !== 'TODOS' ? parseInt(cursoId) : null,
        turma: tipoPublico === 'TURMA' ? turma : null,
      },
    });

    console.log('Evento criado com sucesso:', novoEvento);
    res.status(201).json(novoEvento);
  } catch (error) {
    console.error('Error creating calendar event:', error);
    res.status(500).json({ error: 'Failed to create event', details: String(error) });
  }
});

// Endpoint para atualizar evento do calendário
app.put('/calendario/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descricao, data, tipoPublico, turma } = req.body;

    const eventoId = parseInt(id);

    if (!eventoId) {
      return res.status(400).json({ error: 'ID do evento inválido' });
    }

    // Verificar se o evento existe
    const eventoExistente = await prisma.calendario.findUnique({
      where: { id: eventoId }
    });

    if (!eventoExistente) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }

    // Preparar dados para atualização
    const dadosAtualizacao: any = {};
    
    if (titulo !== undefined) dadosAtualizacao.titulo = titulo;
    if (descricao !== undefined) dadosAtualizacao.descricao = descricao;
    if (data !== undefined) dadosAtualizacao.data = new Date(data);
    if (tipoPublico !== undefined) dadosAtualizacao.tipoPublico = tipoPublico;
    if (turma !== undefined) dadosAtualizacao.turma = turma;

    const eventoAtualizado = await prisma.calendario.update({
      where: { id: eventoId },
      data: dadosAtualizacao
    });

    console.log('Evento atualizado com sucesso:', eventoAtualizado);
    res.json(eventoAtualizado);
  } catch (error) {
    console.error('Error updating calendar event:', error);
    res.status(500).json({ error: 'Failed to update event', details: String(error) });
  }
});

// Endpoint para deletar evento do calendário
app.delete('/calendario/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const eventoId = parseInt(id);

    if (!eventoId) {
      return res.status(400).json({ error: 'ID do evento inválido' });
    }

    // Verificar se o evento existe
    const eventoExistente = await prisma.calendario.findUnique({
      where: { id: eventoId }
    });

    if (!eventoExistente) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }

    await prisma.calendario.delete({
      where: { id: eventoId }
    });

    console.log('Evento deletado com sucesso:', eventoId);
    res.json({ message: 'Evento deletado com sucesso', id: eventoId });
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    res.status(500).json({ error: 'Failed to delete event', details: String(error) });
  }
});


// Rota para alterar senha
app.put('/alterar-senha', async (req, res) => {
  try {
    const { userId, senhaAtual, novaSenha } = req.body;

    if (!userId || !senhaAtual || !novaSenha) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        message: 'User ID, senha atual e nova senha são obrigatórios' 
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ 
        error: 'User not found', 
        message: 'Usuário não encontrado' 
      });
    }

    // Verificar se a senha atual está correta
    const isPasswordValid = await bcrypt.compare(senhaAtual, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Invalid current password', 
        message: 'Senha atual incorreta' 
      });
    }

    // Criptografar a nova senha
    const hashedPassword = await bcrypt.hash(novaSenha, 10);

    // Atualizar a senha no banco de dados
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword
      }
    });

    res.json({
      message: 'Senha alterada com sucesso',
      success: true
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ 
      error: 'Failed to change password',
      message: 'Erro interno do servidor'
    });
  }
});

// Rota para registrar uma atividade
app.post('/atividades/:usuarioId', async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const { tipo, titulo, descricao } = req.body;

    if (!tipo || !titulo || !descricao) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando' });
    }

    const id = parseInt(usuarioId);
    const atividade = {
      tipo,
      titulo,
      descricao,
      createdAt: new Date().toISOString()
    };

    // Adicionar à memória
    if (!atividadesMemoria.has(id)) {
      atividadesMemoria.set(id, []);
    }
    
    const atividades = atividadesMemoria.get(id)!;
    atividades.unshift(atividade); // Adicionar no início
    
    // Manter apenas as últimas 50 atividades
    if (atividades.length > 50) {
      atividades.pop();
    }

    res.json({ success: true, atividade });
  } catch (error) {
    console.error('Error registering activity:', error);
    res.status(500).json({ error: 'Failed to register activity' });
  }
});

// Rota para buscar atividades do usuário
app.get('/atividades/:usuarioId', async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const id = parseInt(usuarioId);

    const atividades = atividadesMemoria.get(id) || [];
    res.json(atividades.slice(0, 5)); // Retorna as 5 mais recentes
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

// Socket.IO configuration
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });

  // Typing indicator events
  socket.on('typing-start', (data) => {
    const { conversaId, userId } = data;
    socket.broadcast.emit(`typing-${conversaId}`, { userId, isTyping: true });
  });

  socket.on('typing-stop', (data) => {
    const { conversaId, userId } = data;
    socket.broadcast.emit(`typing-${conversaId}`, { userId, isTyping: false });
  });

  // Socket.IO novaMensagem listener - não usar aqui, usar POST /mural em vez disso
  // Isso evita duplicação e garante que só clientes autenticados possam enviar
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});