# 🚂 Deploy Backend no Railway - Guia Rápido

## Por que Railway?
- ✅ Grátis (500 horas/mês)
- ✅ Suporta WebSockets (Socket.IO)
- ✅ Deploy automático do GitHub
- ✅ Fácil de configurar
- ✅ HTTPS grátis

## 🚀 Passo a Passo

### 1. Preparar o Backend

Primeiro, vamos garantir que está tudo pronto:

```bash
cd backend
npm install
```

Teste localmente:
```bash
npm run dev
```

Se funcionar, está pronto!

### 2. Criar Conta na Railway

1. Acesse: https://railway.app
2. Clique em **"Login"**
3. Escolha **"Login with GitHub"**
4. Autorize o Railway a acessar seus repositórios

### 3. Criar Novo Projeto

1. No Dashboard, clique em **"New Project"**
2. Selecione **"Deploy from GitHub repo"**
3. Procure e selecione o repositório **TCC**
4. Railway vai escanear o projeto

### 4. Configurar o Serviço

**IMPORTANTE**: Railway pode detectar tanto frontend quanto backend. Configure apenas o BACKEND:

1. Se aparecer dois serviços, DELETE o frontend (vamos usar Vercel)
2. No serviço do backend, clique em **"Settings"**
3. Role até **"Root Directory"**
4. Digite: `backend`
5. Clique em **"Deploy"** ou aguarde deploy automático

### 5. Adicionar Variáveis de Ambiente

1. Vá na aba **"Variables"**
2. Clique em **"+ New Variable"**
3. Adicione cada uma:

```env
DATABASE_URL=postgresql://seu_usuario:senha@host:5432/banco
PORT=3000
NODE_ENV=production
```

**Pegue a DATABASE_URL do Supabase:**
- Vá no Supabase → Settings → Database
- Copie a "Connection String" (URI)

### 6. Configurar Build e Start

1. Na aba **"Settings"**
2. Procure **"Build Command"** (opcional):
   ```
   npm install && npm run generate:prisma
   ```

3. **Start Command**:
   ```
   npm run dev
   ```

4. **Deploy Trigger**: Deixe marcado "main branch"

### 7. Deploy!

1. Railway vai fazer o build automático
2. Aguarde 2-5 minutos
3. Quando aparecer "Success", está pronto!

### 8. Pegar a URL do Backend

1. Na página do serviço, procure **"Domains"**
2. Clique em **"Generate Domain"**
3. Railway vai gerar algo como: `tcc-backend-production.up.railway.app`
4. **COPIE ESSA URL!** Você vai precisar dela.

### 9. Testar o Backend

Abra no navegador:
```
https://sua-url.railway.app/
```

Deve aparecer: "Servidor rodando!"

Teste outras rotas:
```
https://sua-url.railway.app/cursos
https://sua-url.railway.app/usuarios
```

### 10. Atualizar Frontend na Vercel

Agora que o backend está no ar, atualize o frontend:

1. Vá na **Vercel** → Seu projeto frontend
2. Vá em **"Settings"** → **"Environment Variables"**
3. Adicione ou edite:
   ```
   NEXT_PUBLIC_API_URL=https://sua-url.railway.app
   ```
4. Clique em **"Redeploy"** 

Pronto! Agora frontend e backend estão conectados! 🎉

## 🔄 Deploy Automático

Agora, toda vez que você fizer push no GitHub:
```bash
git add .
git commit -m "Atualização"
git push origin main
```

Railway vai fazer redeploy automático do backend! 🚀

## 🐛 Troubleshooting

### Erro: "Application failed to respond"
**Solução**: Verifique se:
- O PORT está correto (3000)
- O start command está correto
- As variáveis de ambiente estão configuradas

### Erro: "Build failed"
**Solução**: 
1. Verifique os logs de build no Railway
2. Teste `npm install` localmente
3. Verifique se todas as dependências estão no package.json

### Erro: "Database connection failed"
**Solução**:
1. Verifique a DATABASE_URL
2. Certifique-se que o Supabase permite conexões externas
3. Execute `npm run generate:prisma` no build

### WebSocket não funciona
**Solução**: Railway suporta WebSockets automaticamente! Se não funcionar:
1. Verifique se a porta está correta
2. Veja os logs no Railway
3. Teste a URL com `/socket.io/`

## 📊 Monitoramento

Ver logs em tempo real:
1. Dashboard do Railway
2. Clique no seu serviço
3. Aba **"Deployments"** → Clique no deployment ativo
4. Veja **"View Logs"**

## 💰 Limites Gratuitos

**Railway Free Tier:**
- 500 horas/mês (~20 dias)
- 1GB RAM
- 1GB Storage
- Sem cartão de crédito necessário!

**Dica**: Se acabar as horas, pode criar outra conta ou fazer upgrade.

## ✅ Checklist Final

- [ ] Backend deployado no Railway
- [ ] URL do backend copiada
- [ ] Variáveis de ambiente configuradas
- [ ] Teste da URL funcionando
- [ ] NEXT_PUBLIC_API_URL atualizada na Vercel
- [ ] Frontend redeployado na Vercel
- [ ] Login funcionando no site publicado
- [ ] Chat funcionando no site publicado

Pronto! Seu backend está no ar! 🎉
