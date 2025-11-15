# 🚀 Guia de Deploy na Vercel - TCC

## 📋 Pré-requisitos

1. ✅ Conta no GitHub
2. ✅ Conta na Vercel (https://vercel.com)
3. ✅ Repositório Git configurado

## 🔧 Passo 1: Preparar o Projeto

### 1.1 - Verificar se o projeto builda localmente

```bash
cd frontend
npm run build
```

Se der erro, anote o erro e corrija antes de continuar.

### 1.2 - Criar arquivo .env.local no frontend

Crie o arquivo `frontend/.env.local` com suas variáveis:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_do_supabase
```

⚠️ **IMPORTANTE**: Nunca commite o arquivo `.env.local` no Git!

### 1.3 - Verificar .gitignore

Certifique-se que o `frontend/.gitignore` contém:

```
.env.local
.env*.local
.next/
node_modules/
```

## 🌐 Passo 2: Fazer Push para o GitHub

```bash
# Na raiz do projeto TCC
git add .
git commit -m "Preparar para deploy na Vercel"
git push origin main
```

## 🚀 Passo 3: Deploy na Vercel

### Opção A: Via Website (Recomendado)

1. Acesse https://vercel.com
2. Faça login com sua conta GitHub
3. Clique em **"Add New Project"**
4. Selecione o repositório **TCC**
5. Configure o projeto:

   **Framework Preset**: Next.js
   
   **Root Directory**: `frontend` ⚠️ IMPORTANTE!
   
   **Build Command**: `npm run build` (ou deixe padrão)
   
   **Output Directory**: `.next` (ou deixe padrão)
   
   **Install Command**: `npm install` (ou deixe padrão)

6. **Environment Variables** (Adicione suas variáveis):
   - `NEXT_PUBLIC_SUPABASE_URL`: [sua URL]
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: [sua chave]

7. Clique em **"Deploy"**

### Opção B: Via CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Na pasta frontend
cd frontend

# Login na Vercel
vercel login

# Deploy
vercel

# Seguir as instruções:
# - Set up and deploy? Y
# - Which scope? [Sua conta]
# - Link to existing project? N
# - What's your project's name? tcc-frontend
# - In which directory is your code located? ./
# - Want to override the settings? N
```

## 🔑 Passo 4: Configurar Variáveis de Ambiente na Vercel

1. No Dashboard da Vercel, vá em **Settings** → **Environment Variables**
2. Adicione cada variável:
   - Key: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: [sua URL do Supabase]
   - Environment: Production, Preview, Development
3. Adicione todas as variáveis necessárias
4. Clique em **"Redeploy"** se necessário

## ⚠️ Erros Comuns e Soluções

### Erro 1: "Build failed"
**Solução**: Verifique se `npm run build` funciona localmente primeiro.

```bash
cd frontend
npm install
npm run build
```

### Erro 2: "Root directory not found"
**Solução**: Configure o Root Directory como `frontend` nas configurações do projeto na Vercel.

### Erro 3: "Module not found"
**Solução**: Verifique se todas as dependências estão no `package.json`:

```bash
cd frontend
npm install
```

### Erro 4: "Environment variables not defined"
**Solução**: Adicione as variáveis de ambiente no Dashboard da Vercel.

### Erro 5: TypeScript errors
**Solução temporária**: Já configuramos para ignorar alguns erros. Se persistir:

```typescript
// next.config.ts
typescript: {
  ignoreBuildErrors: true, // ⚠️ Apenas para deploy inicial
}
```

## 🔄 Passo 5: Deploy Automático

Agora, toda vez que você fizer push para o GitHub, a Vercel vai fazer deploy automático! 🎉

```bash
git add .
git commit -m "Nova funcionalidade"
git push origin main
# Deploy automático acontece!
```

## 🎯 Passo 6: Backend (Separado)

O backend precisa ser hospedado separadamente. Opções:

1. **Railway** (Recomendado) - https://railway.app
2. **Render** - https://render.com
3. **Heroku**
4. **AWS/Azure**

### Deploy Backend na Railway:

1. Vá para https://railway.app
2. Conecte com GitHub
3. Selecione o repositório TCC
4. Configure Root Directory como `backend`
5. Adicione variáveis de ambiente
6. Deploy!

Depois, atualize a variável `NEXT_PUBLIC_API_URL` na Vercel com a URL do backend.

## 📱 Verificar o Deploy

1. Acesse a URL fornecida pela Vercel (exemplo: `https://tcc-frontend.vercel.app`)
2. Teste todas as funcionalidades
3. Verifique o console do browser (F12) para erros
4. Teste login, navegação, etc.

## 🐛 Debug

Ver logs na Vercel:
1. Dashboard → Seu Projeto → **Deployments**
2. Clique no deployment
3. Veja a aba **"Build Logs"** e **"Runtime Logs"**

## ✅ Checklist Final

- [ ] Projeto builda localmente (`npm run build` funciona)
- [ ] Variáveis de ambiente configuradas
- [ ] .gitignore configurado corretamente
- [ ] Push para GitHub feito
- [ ] Root Directory configurado como `frontend` na Vercel
- [ ] Variáveis de ambiente adicionadas na Vercel
- [ ] Deploy bem-sucedido
- [ ] Site funcionando na URL da Vercel
- [ ] Backend deployado separadamente (se necessário)

## 📞 Precisa de Ajuda?

Se encontrar algum erro específico, me mande:
1. A mensagem de erro completa
2. O log do build na Vercel
3. O que você já tentou

Boa sorte com o deploy! 🚀
