# Gamelog — Gerenciador de Backlog, Pastas & Listas de Jogos

**Gamelog** é uma aplicação web completa e moderna inspirada na estética e funcionalidades do [Backloggd](https://www.backloggd.com/), desenvolvida para organizar, catalogar e acompanhar todo o seu histórico de jogos em uma hierarquia elegante:

$$\text{Pasta} \longrightarrow \text{Lista de Jogos} \longrightarrow \text{Jogos}$$

---

## 🚀 Funcionalidades Principais

1. **Hierarquia Completa de 3 Níveis**:
   - **Pastas (Folders)**: Agrupe listas por temas (ex: *Franquias Favoritas*, *Metas de 2026*, *RPGs Clássicos*, *PlayStation Hits*), com cores e descrições customizadas.
   - **Listas de Jogos**: Crie listas temáticas dentro de pastas ou avulsas (raiz), com suporte a rankings ordenados (#1, #2, #3...), anotações por jogo e reordenação rápida.
   - **Jogos**: Detalhes completos com pôsteres em alta definição, ano de lançamento, gênero, plataformas e desenvolvedora.

2. **Acompanhamento de Status e Diário de Jogatina (Logs)**:
   - Status: *Jogando*, *Backlog*, *Zerados (Completed)*, *Lista de Desejos (Wishlist)*, *Pausados* e *Abandonados*.
   - Avaliações em estrelas (0 a 5 com meias estrelas), resenhas escritas e contagem de horas jogadas.
   - Sistema de favoritos (coração) e registro cronológico no Diário de Jogos.

3. **Catálogo Integrado & Cadastro de Jogos Customizados**:
   - Catálogo pré-carregado com mais de 60 títulos aclamados (FromSoftware, Capcom, Square Enix, PlayStation Studios, etc.).
   - Filtros por Gênero e Plataforma em tempo real.
   - Cadastro de novos jogos com capa personalizada via URL.

4. **Operações em Lote (Multi-Select)**:
   - Seleção múltipla para remover vários jogos de uma lista ou de um status específico de uma só vez.
   - Exclusão em lote de pastas e listas de jogos com modais de confirmação seguros.

5. **Importador do Backloggd via URL**:
   - Importe pastas, listas e histórico diretamente de perfis públicos do Backloggd.

6. **Sistema de Backup Automático & Persistência Local**:
   - **Auto-Importação**: Sempre que o projeto é iniciado (`npm run dev` ou `npm start`), o servidor consulta automaticamente o arquivo `.json` mais recente contido na pasta `backup/` e carrega todo o estado.
   - **Exportação Direta**: Ao clicar em **Backup → Exportar**, os dados são gravados diretamente na pasta `backup/` do projeto com carimbo de data e hora (ex: `backloggd-backup-2026-11-11-02-28-36.json`), além de iniciar o download no navegador.

---

## 📁 Estrutura de Pastas do Projeto

```text
├── backup/                    # 📁 Pasta onde os backups automáticos em .json são salvos e lidos
│   └── backloggd-backup-*.json
├── src/
│   ├── components/            # Componentes visuais modulares
│   │   ├── modals/            # Modais (Backup, Confirmação, Detalhes, Edição de Pastas/Listas)
│   │   ├── views/             # Telas principais (Perfil, Pastas, Status, Diário, Catálogo)
│   │   ├── GameCard.tsx       # Card de jogo com pôster 3:4 e seleção múltipla
│   │   ├── Navbar.tsx         # Barra superior com atalhos de navegação e backup
│   │   └── SidebarTree.tsx    # Explorador em árvore de pastas e listas
│   ├── context/
│   │   └── StoreContext.tsx   # Gerenciamento de estado global e sincronização com /api/backups
│   ├── data/
│   │   └── initialData.ts     # Dados padrão de exemplo
│   ├── types.ts               # Definições de tipos TypeScript
│   ├── App.tsx                # Componente raiz da aplicação
│   ├── main.tsx               # Ponto de entrada do React
│   └── index.css              # Estilos globais e Tailwind CSS
├── server.ts                  # Servidor Express Full-Stack com API de Backups e Vite
├── package.json               # Dependências e scripts de execução
├── tsconfig.json              # Configurações do TypeScript
└── vite.config.ts             # Configuração do Vite e Tailwind CSS v4
```

---

## 💻 Como Rodar o Projeto Localmente

### Pré-requisitos
- **Node.js** (versão 18 ou superior recomendada)
- **npm** ou **yarn** ou **bun**

### Passo a Passo

1. **Clone ou baixe o repositório**:
   ```bash
   git clone <URL_DO_REPOSITORIO>
   cd <PASTA_DO_PROJETO>
   ```

2. **Instale as dependências**:
   ```bash
   npm install
   ```

3. **Inicie o servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```
   > O servidor full-stack Express + Vite iniciará automaticamente na porta `3000`:
   > **`http://localhost:3000`**

4. **Para rodar em modo de produção (opcional)**:
   ```bash
   npm run build
   npm start
   ```

---

## 💾 Como Funciona o Backup e a Restauração

### 🔄 Auto-Importação ao Iniciar
Toda vez que a aplicação é iniciada e acessada no navegador:
1. O frontend faz uma requisição para a rota `GET /api/backups/latest`.
2. O servidor lê o diretório `backup/`, identifica o arquivo `.json` mais recente (baseado na data de modificação).
3. Se existir um backup, o estado completo (jogos, pastas, listas, notas, diário e perfil) é importado automaticamente!
4. Uma indicação com o nome do arquivo carregado é exibida no modal de Backup.

### 📤 Exportar para a pasta `/backup`
1. No menu superior, clique no botão **Backup**.
2. Clique em **Exportar para pasta /backup & Download**.
3. O servidor salva o arquivo diretamente em `backup/backloggd-backup-YYYY-MM-DD-HH-mm-ss.json` e o navegador também baixa uma cópia de segurança.
4. Qualquer novo backup salvo passa a ser o novo arquivo padrão carregado na próxima inicialização do sistema!

---

## 🛠️ Tecnologias Utilizadas

- **React 19** com hooks funcionais e Context API
- **TypeScript** para tipagem estática e segurança de código
- **Tailwind CSS v4** para estilização moderna e responsiva
- **Express + Vite** para ambiente full-stack com suporte a endpoints de API de persistência
- **Lucide React** para ícones limpos e minimalistas
