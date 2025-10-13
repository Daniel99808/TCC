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

// Configurar Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

app.use(cors());
app.use(express.json());

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
    const { nome, cpf, password, cursoId } = req.body;

    if (!nome || !cpf || !password || !cursoId) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        message: 'Nome, CPF, senha e curso são obrigatórios' 
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

    // Verificar se o curso existe
    const curso = await prisma.curso.findUnique({
      where: { id: parseInt(cursoId) }
    });

    if (!curso) {
      return res.status(400).json({ 
        error: 'Invalid course', 
        message: 'Curso selecionado não existe' 
      });
    }

    const newUser = await prisma.user.create({
      data: {
        nome,
        cpf,
        password: hashedPassword,
        cursoId: parseInt(cursoId),
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

    res.json({
      message: 'Login realizado com sucesso',
      user: userResponse
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

// Rotas do Mural
app.get('/mural', async (req, res) => {
  try {
    const mural = await prisma.mural.findMany({
      select: {
        id: true,
        conteudo: true,
        createdAt: true
      }
    });
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
    const { conteudo } = req.body;
    
    if (!conteudo) {
      return res.status(400).json({ error: 'Missing required field: conteudo' });
    }

    const newMessage = await prisma.mural.create({
      data: {
        conteudo,
      },
    });

    io.emit('novaMensagem', newMessage);

    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({ error: 'Failed to create message' });
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

app.post('/calendario', async (req, res) => {
  try {
    const { titulo, descricao, data } = req.body;

    if (!titulo || !data) {
      return res.status(400).json({ error: 'Os campos "titulo" e "data" são obrigatórios.' });
    }

    const novoEvento = await prisma.calendario.create({
      data: {
        titulo,
        descricao,
        data: new Date(data),
      },
    });

    res.status(201).json(novoEvento);
  } catch (error) {
    console.error('Error creating calendar event:', error);
    res.status(500).json({ error: 'Failed to create event' });
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

  socket.on('novaMensagem', async (data) => {
    try {
      const newMessage = await prisma.mural.create({
        data: {
          conteudo: data.conteudo,
        },
      });

      io.emit('novaMensagem', newMessage);
    } catch (error) {
      console.error('Error creating and sending message:', error);
    }
  });
});

server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});