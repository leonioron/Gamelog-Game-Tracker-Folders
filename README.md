# Gamelog — Mobile-First Backlog, Pastas & Listas de Jogos

**Gamelog** é uma aplicação **mobile-first**, **100% offline/local-first**, com suporte completo à Web e empacotamento em **APK Android** instalável via **Capacitor**, organizada na hierarquia:

$$\text{Pasta} \longrightarrow \text{Lista de Jogos} \longrightarrow \text{Jogos}$$

---

## 🚀 Funcionalidades Principais

1. **Hierarquia Completa de 3 Níveis**:
   - **Pastas (Folders)**: Agrupe listas por temas (ex: *Franquias Favoritas*, *Metas de 2026*, *Clássicos Imortais*), com cores e descrições personalizadas.
   - **Listas de Jogos**: Listas dentro de pastas ou avulsas, com suporte a rankings numerados (`#1`, `#2`, `#3...`), anotações e reordenação.
   - **Jogos**: Catálogo embutido com mais de 45 títulos aclamados + cadastro manual offline com fallback local em `public/assets/`.

2. **Acompanhamento de Status & Diário (Logs)**:
   - Status: *Jogando*, *Backlog*, *Zerados*, *Desejo*, *Pausado* e *Abandonado*.
   - Avaliação em estrelas (1 a 5), contador de horas jogadas (`- / +`), favoritos e resenhas.
   - Diário cronológico usando datas locais (`YYYY-MM-DD` / `DD/MM/YYYY`), sem desvios de fuso UTC.

3. **Experiência Mobile-First & Android WebView**:
   - Tema escuro de alto contraste (`#090D14` fundo, `#121824` cartões, destaque `#6366F1` e `tabular-nums`).
   - Navegação fixa na base (`fixed bottom-0`) com 4 abas no celular (`Início`, `Pastas`, `Acervo`, `Catálogo`) e barra superior completa no desktop.
   - Proteção de topo (`--app-safe-top: max(32px, env(safe-area-inset-top, 0px))`) contra sobreposição pela barra de status do Android.
   - Área de toque mínima de `44px × 44px` e zero diálogos nativos (`alert`/`confirm`/`open`).

4. **Persistência 100% Offline & Portabilidade**:
   - **IndexedDB** como banco principal com sincronização automática e fallback em `localStorage`.
   - **Exportar JSON** e **Relatório CSV** (via compartilhamento nativo `@capacitor/filesystem` + `@capacitor/share` no Android, ou download via `Blob` na Web).
   - **Importar JSON** com modo **Mesclar** (adiciona sem apagar dados atuais) ou **Substituir Tudo**, além de copiar/colar texto JSON para WebViews restritos.
   - Quando executado com o servidor Node/Express local (`npm run dev`), também realiza auto-importação e exportação para a pasta `backup/`.

---

## 📁 Estrutura de Pastas

```text
├── .github/workflows/
│   └── build-apk.yml          # Pipeline CI/CD para gerar APK no GitHub Actions
├── android/                   # Projeto nativo Android gerado pelo Capacitor
├── backup/                    # Backups locais em .json (uso no servidor local)
├── public/assets/             # Ícones e capas fallback locais (funcionam offline no APK)
├── src/
│   ├── types/                 # Interfaces TypeScript do domínio (index.ts)
│   ├── data/                  # Catálogo estático e dados iniciais (initialData.ts)
│   ├── utils/                 # Datas locais (date.ts), CSV/validação (format.ts), parser Backloggd
│   ├── services/              # IndexedDB + localStorage (storage.ts) e exportação nativa/Web (fileExport.ts)
│   ├── context/               # StoreContext.tsx com estado global e Toast
│   ├── components/            # Navbar, MobileBottomNav, AcervoSubNav, views/ e modals/
│   ├── App.tsx                # Shell principal com safe-area, Toast e modais
│   └── index.css              # Tailwind CSS v4 + regras WebView (overflow-x: clip)
├── capacitor.config.ts        # Configuração Capacitor (webDir: 'dist', androidScheme: 'https')
├── server.ts                  # Servidor local Express + Vite (opcional para Web/backup em disco)
├── BUILD_APK.md               # Guia passo a passo para gerar e baixar o APK Android
└── package.json               # Scripts Web + Capacitor (android:sync, android:open)
```

---

## 💻 Como Rodar Localmente

### Pré-requisitos
- **Node.js 20+** (recomendado Node 22)
- **npm**

### Passo a Passo

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar servidor de desenvolvimento (http://localhost:3000)
npm run dev

# 3. Gerar build de produção estático (pasta dist/)
npm run build

# 4. Rodar build em produção com servidor local
npm start
```

### Sincronizar com Android (Capacitor)

```bash
# Compila o frontend e sincroniza assets/plugins para android/
npm run android:sync

# Abre o projeto no Android Studio (opcional)
npm run android:open
```

Para instruções detalhadas de como gerar e baixar o **APK instalável** automaticamente via **GitHub Actions**, consulte o arquivo [`BUILD_APK.md`](./BUILD_APK.md).
