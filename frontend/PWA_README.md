# PWA - Progressive Web App

## 🚀 Recursos Implementados

### ✅ Funcionalidades Principais
- **Instalável**: App pode ser instalado na tela inicial em dispositivos móveis e desktop
- **Offline First**: Funciona sem conexão de internet com cache inteligente
- **Notificações Push**: Suporte para notificações instantâneas
- **Background Sync**: Sincronização de dados em segundo plano
- **Responsivo**: Interface adaptada para todos os tamanhos de tela

### 📱 Manifesto (manifest.json)
- Nome: Nexus Senai
- Ícones: 9 tamanhos diferentes (72x72 até 512x512)
- Display: Standalone (tela cheia sem navegador)
- Tema: Vermelho (#dc2626)
- Shortcuts: Acesso rápido a Mural, Conversas e Calendário

### 🔧 Service Worker (sw.js)
- **Cache Strategy**: Network First com fallback para cache
- **Assets Estáticos**: Páginas principais cacheadas automaticamente
- **Runtime Cache**: Cache dinâmico de recursos acessados
- **Página Offline**: Interface customizada quando sem conexão
- **Push Notifications**: Handler para notificações push
- **Background Sync**: Sincronização de mensagens offline

### 🎨 Componentes

#### PWAInstallPrompt
- Prompt customizado de instalação
- Aparece após 30 segundos (pode ser ajustado)
- Design responsivo e atraente
- Modo escuro/claro
- Animações suaves
- Pode ser dispensado (salva preferência)

### 📦 Ícones Gerados
Todos os ícones são gerados automaticamente a partir de `logo.png`:
- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-180x180.png (Apple Touch Icon)
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png
- favicon-32x32.png

## 🛠️ Como Usar

### Desenvolvimento
```bash
# Gerar ícones (após alterar logo.png)
npm run generate-icons

# Rodar em desenvolvimento
npm run dev
```

### Instalação do App

#### Desktop (Chrome/Edge)
1. Acesse o site
2. Clique no ícone de instalação na barra de endereço (⊕)
3. Confirme a instalação

#### Android
1. Acesse o site no Chrome
2. Menu (⋮) > "Adicionar à tela inicial" ou "Instalar app"
3. Confirme

#### iOS/iPad
1. Acesse no Safari
2. Botão compartilhar (□↑)
3. "Adicionar à Tela de Início"
4. Confirme

## 🧪 Testar Offline

1. Instale o app
2. Navegue pelas páginas principais
3. Ative o modo avião ou desconecte da internet
4. Continue usando o app
5. Páginas visitadas estarão disponíveis

## 📊 Cache Strategy

### Páginas Cacheadas Automaticamente
- `/` (Home)
- `/inicio`
- `/mural`
- `/conversas`
- `/calendario`
- `/perfil`
- `/offline.html`

### Runtime Cache
- Imagens
- Fontes
- CSS/JS dinâmicos
- Requisições GET bem-sucedidas

## 🔔 Notificações Push (Preparado)

O service worker está preparado para receber notificações push. Para implementar:

1. Configure um servidor de push (Firebase, OneSignal, etc)
2. Registre o subscription no backend
3. Envie notificações do servidor

## 🎯 Próximas Melhorias

- [ ] Implementar Background Sync completo para mensagens
- [ ] Adicionar screenshots ao manifest
- [ ] Implementar Share Target API
- [ ] Cache de imagens de perfil
- [ ] Otimizar tamanho do cache
- [ ] Analytics offline

## 📱 Compatibilidade

- ✅ Chrome/Edge (Desktop e Mobile)
- ✅ Safari (iOS 11.3+)
- ✅ Firefox (Desktop e Mobile)
- ✅ Samsung Internet
- ✅ Opera

## 🔍 Debug

### Verificar Service Worker
1. Abra DevTools (F12)
2. Aba "Application" (Chrome) ou "Debugger" (Firefox)
3. Seção "Service Workers"
4. Veja status, cache e atualizações

### Simular Offline
1. DevTools > Network
2. Dropdown "Online" > "Offline"
3. Recarregue a página

### Lighthouse Audit
1. DevTools > Lighthouse
2. Selecione "Progressive Web App"
3. Execute o audit

## 📝 Notas

- Service Worker só funciona em HTTPS (exceto localhost)
- Cache é atualizado automaticamente a cada minuto
- Prompt de instalação respeita preferência do usuário
- Página offline customizada com design responsivo
