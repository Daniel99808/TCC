# 🚀 DEPLOY COMPLETO - RESUMO RÁPIDO

## ✅ Verificação Pré-Deploy

Seu projeto está **PRONTO** para deploy! ✓ Build funciona localmente

---

## 📋 ORDEM DE DEPLOY (IMPORTANTE!)

### 1️⃣ **PRIMEIRO: Backend na Railway** (OBRIGATÓRIO)
### 2️⃣ **DEPOIS: Frontend na Vercel**

⚠️ **POR QUE NESSA ORDEM?**
- Você precisa da URL do backend para configurar no frontend
- Backend tem Socket.IO (WebSocket) que Vercel não suporta

---

## 🚂 PASSO 1: Deploy do Backend (Railway)

### Acesse: https://railway.app

1. **Login** com GitHub
2. **"New Project"** → **"Deploy from GitHub repo"**
3. Selecione: **TCC**
4. **IMPORTANTE**: Configure **Root Directory** = `backend`
5. Adicione variáveis de ambiente:
   ```
   DATABASE_URL=sua_connection_string_supabase
   PORT=3000
   NODE_ENV=production
   ```
6. **Generate Domain** (copie a URL gerada!)
7. Teste: `https://sua-url.railway.app/` 
   - Deve mostrar: "Servidor rodando!"

**📝 Guia Detalhado**: Veja `DEPLOY_BACKEND_RAILWAY.md`

---

## 🌐 PASSO 2: Deploy do Frontend (Vercel)

### Acesse: https://vercel.com

1. **Login** com GitHub
2. **"Add New Project"**
3. Selecione: **TCC**
4. **IMPORTANTE**: Configure **Root Directory** = `frontend`
5. Adicione variáveis de ambiente:
   ```
   NEXT_PUBLIC_SUPABASE_URL=sua_url_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_supabase
   NEXT_PUBLIC_API_URL=https://sua-url.railway.app
   ```
   ☝️ Use a URL do backend do Passo 1!
6. **Deploy**!

**📝 Guia Detalhado**: Veja `DEPLOY_VERCEL.md`

---

## 🔑 Variáveis de Ambiente Necessárias

### Backend (Railway):
```env
DATABASE_URL=postgresql://...
PORT=3000
NODE_ENV=production
```

### Frontend (Vercel):
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
NEXT_PUBLIC_API_URL=https://sua-url.railway.app
```

---

## 📱 Após Deploy

### Testar:
1. ✅ Abrir URL da Vercel
2. ✅ Fazer login
3. ✅ Testar navegação (mural, calendário)
4. ✅ Testar chat (WebSocket)

### Se algo der errado:
- **Backend**: Ver logs no Railway Dashboard
- **Frontend**: Ver logs no Vercel → Deployments → View Logs
- **Browser**: F12 → Console para erros JavaScript

---

## 🔄 Deploy Automático

Depois que tudo estiver configurado:

```bash
git add .
git commit -m "Nova feature"
git push origin main
```

**Railway e Vercel vão fazer redeploy automático!** 🎉

---

## 💰 Custos

- **Railway**: Grátis (500h/mês)
- **Vercel**: Grátis
- **Supabase**: Grátis
- **Total**: R$ 0,00 🎉

---

## ❓ Problemas Comuns

### "Application failed to respond" (Railway)
- Verifique se PORT=3000 está nas variáveis
- Veja os logs no Railway

### "Build failed" (Vercel)
- Veja se Root Directory está como `frontend`
- Verifique se `npm run build` funciona localmente

### "Cannot connect to backend"
- Verifique se NEXT_PUBLIC_API_URL está correto
- Teste a URL do backend no navegador

### Chat não funciona
- Backend PRECISA estar no Railway (ou similar)
- Vercel não suporta WebSockets

---

## 📞 Próximos Passos

1. [ ] Deploy backend na Railway
2. [ ] Copiar URL do backend
3. [ ] Deploy frontend na Vercel
4. [ ] Configurar variáveis de ambiente
5. [ ] Testar tudo!
6. [ ] Comemorar! 🎉

---

## 📚 Documentação Completa

- **Backend**: `DEPLOY_BACKEND_RAILWAY.md`
- **Frontend**: `DEPLOY_VERCEL.md`

**Boa sorte! 🚀**
