# Gamelog (v1.0.0) — Mobile-First Backlog, Pastas & Listas de Jogos

**Gamelog** é uma aplicação **mobile-first**, **100% offline/local-first**, com suporte completo à Web e empacotamento em **APK Android** instalável via **Capacitor**, organizada na hierarquia:

$$\text{Pasta} \longrightarrow \text{Lista de Jogos} \longrightarrow \text{Jogos}$$

---

## 🚀 Funcionalidades & Estrutura Atual

1. **Cabeçalho Minimalista & Proteção de Safe-Area**:
   - Cabeçalho superior limpo exibindo apenas a marca **Gamelog** e a versão sincronizada do `package.json` (`v1.0.0`) no mobile (com links de navegação no desktop).
   - Padding superior integrado diretamente no cabeçalho fixo (`sticky top-0 pt-safe-top` com `--app-safe-top: max(32px, env(safe-area-inset-top, 0px))`), garantindo que o conteúdo das seções nunca fique escondido sob a barra de status do Android ou sob o próprio cabeçalho.

2. **Seção Início (Visão Rápida)**:
   - Painel direto com 4 cards de resumo clicáveis: **Jogando**, **Zerados**, **Backlog** e **Favoritos**.
   - Prévia das **2 últimas Pastas & Listas** e dos **2 últimos Registros no Diário**.

3. **Seção Pastas**:
   - Grade direta de **Todas as Pastas** (sem árvore lateral/hierarquia ocupando espaço), com navegação interna para as listas da pasta selecionada e para os jogos de cada lista (visualização em **Pôsteres** ou **Tabela**).
   - Barra de ações compacta **somente com ícones** (`44px × 44px`): **Importar Backloggd** (via URL ou HTML), **Selecionar em lote** e **Nova Pasta** (além de **Editar**, **Excluir** e **Nova Lista** dentro de cada pasta).
   - Suporte a listas ranqueadas (`#1`, `#2`, `#3...`) com reordenação, remoção em lote e **paginação de 10 itens por página** (aplicada nas pastas, nas listas da pasta e nos jogos da lista).

4. **Seção Acervo**:
   - Sub-navegação segmentada mobile com 6 abas: **Jogando**, **Backlog**, **Zerados**, **Desejo**, **Favoritos** e **Diário**.
   - Ícone consistente de **Lista de Desejos** (`Sparkles`) aplicado na sub-navegação, no cabeçalho da aba, nas badges e nos modais de cadastro/edição de jogos.
   - Seção dedicada de **Favoritos** com remoção em lote que apenas desmarca o favorito sem apagar o status principal ou horas jogadas do jogo.
   - Botões de ação do cabeçalho reduzidos para **somente ícones** (`Selecionar vários`, `Adicionar jogo` / `Novo registro`) e **paginação de 10 itens por página** em todas as abas e no Diário.

5. **Seção Catálogo**:
   - Catálogo embutido com mais de 45 títulos + cadastro manual de jogos personalizados com fallback local offline (`public/assets/`).
   - Busca por título/estúdio/gênero, filtros por gênero e plataforma, exclusão em lote e botões compactos **somente com ícones** para **Backup**, **Selecionar vários** e **Cadastrar Jogo**.
   - **Paginação de 10 jogos por página** com redefinição automática ao filtrar.

6. **Experiência Mobile-First & Android WebView**:
   - Tema escuro de alto contraste (`#090D14` fundo, `#121824` cartões, destaque `#6366F1` e números `tabular-nums`).
   - Barra de navegação inferior fixa (`fixed bottom-0`) com 4 abas principais no celular (**Início**, **Pastas**, **Acervo**, **Catálogo**).
   - Área de toque mínima de `44px × 44px`, `overflow-x: clip` (preservando elementos `sticky`) e substituição total de diálogos nativos (`alert`/`confirm`/`open`) por modais próprios e notificações toast.

7. **Persistência 100% Offline & Portabilidade**:
   - **IndexedDB** (`gamelog_offline_db`) como armazenamento primário com sincronização e fallback imediato em `localStorage`.
   - Datas tratadas no fuso horário local (`YYYY-MM-DD` / `DD/MM/YYYY`), sem desvios de UTC.
   - **Backup completo** acessível pelo ícone no **Catálogo**:
     - **Exportar JSON** e **Relatório CSV** via compartilhamento nativo (`@capacitor/filesystem` + `@capacitor/share`) no Android ou download via `Blob` na Web.
     - **Importar JSON** nos modos **Mesclar** ou **Substituir Tudo**, incluindo modo de copiar/colar texto JSON para Android WebView.
     - Quando executado via servidor Node/Express local (`npm run dev`), consulta o backup mais recente e exporta cópias para a pasta `backup/`.

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
│   ├── components/            # Navbar, MobileBottomNav, AcervoSubNav, Pagination, views/ e modals/
│   ├── App.tsx                # Shell principal com layout, Toast e modais
│   └── index.css              # Tailwind CSS v4 + safe-area e regras WebView (overflow-x: clip)
├── capacitor.config.ts        # Configuração Capacitor (webDir: 'dist', androidScheme: 'https')
├── server.ts                  # Servidor local Express + Vite (opcional para Web/backup em disco)
├── BUILD_APK.md               # Guia passo a passo para gerar e baixar o APK Android
└── package.json               # Versão (1.0.0) e scripts Web + Capacitor (android:sync, android:open)
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
