# Backloggd Tracker — Leonio Ranulfo

Um aplicativo web moderno, completo e fluido inspirado no Backloggd (com estética escura refinada, capas de jogos em alta definição, notas por estrelas, logs de jogatina e perfil pessoal) com suporte completo à hierarquia estruturada: **Pastas → Listas de Jogos → Jogos**.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> As decisões abaixo foram confirmadas durante a etapa de alinhamento e serão a base da arquitetura do aplicativo:

- **Catálogo de Jogos Híbrido**: Base local enriquecida com mais de 60 títulos aclamados (covers em alta definição, gêneros, plataformas, anos de lançamento) com busca instantânea em tempo real + formulário para cadastrar jogos personalizados com arte de capa, desenvolvedora e ano.
- **Perfil Completo Backloggd**: Sistema de status (`Playing`, `Completed`, `Backlog`, `Wishlist`, `Dropped`, `Paused`), avaliação de 0.5 a 5 estrelas, resenhas escritas, diário de jogatina (*Game Logs*) e estatísticas de perfil em tempo real (total de jogos, horas estimadas, média de notas e distribuição por status).
- **Hierarquia Visual em Árvore Lateral (Sidebar Tree Explorer)**: Painel lateral expansível com visualização clara de Pastas, Listas aninhadas e contagem de jogos, permitindo alternar instantaneamente entre listas ou visualizar a biblioteca geral.
- **Persistência Confiável**: Salvamento automático no `localStorage` do navegador com recurso de Exportar e Importar Backup em JSON, garantindo que o usuário nunca perca suas anotações ou listas.

---

## 1. Overview & Core Concept

- **O que o aplicativo faz**: Permite ao usuário (com perfil customizável no estilo `Leonio_Ranulfo`) gerenciar e catalogar todo o seu histórico de jogos eletrônicos. O usuário pode criar **Pastas** (ex: *"Franquias Favoritas"*, *"Metas de 2026"*, *"Jogos Retrô"*, *"GOTY por Ano"*), dentro de cada pasta criar **Listas de Jogos** (ex: *"Saga Resident Evil"*, *"Zerar até Julho"*, *"Melhores JRPGs"*), e dentro de cada lista adicionar e ordenar **Jogos** com status, estrelas e resenhas.
- **Público-alvo**: Jogadores e entusiastas que querem organizar seu backlog de forma visual, elegante e sem complexidade desnecessária, no padrão da comunidade Backloggd e Letterboxd.
- **Valor Principal**: Visualização clara de pendências e conquistas com capas imersivas em pôster, navegação intuitiva em três níveis e facilidade para registrar o diário de jogatina.

---

## 2. User Experience & Visual Design

### Fluxos Principais do Usuário

1. **Exploração do Perfil & Biblioteca Geral**:
   - Cabeçalho do usuário com avatar, banner, bio (*"Leonio Ranulfo"*), resumo de jogos jogados, backlog e jogos em andamento.
   - Abas rápidas no estilo Backloggd: **Overview**, **Jogando (Playing)**, **Backlog**, **Completados (Completed)**, **Listas & Pastas**, e **Diário (Logs)**.
2. **Gerenciamento de Pastas e Listas**:
   - Criação de novas Pastas com nome, ícone e descrição opcional.
   - Criação de Listas de Jogos associadas a uma pasta (ou listas avulsas).
   - Adição de jogos a partir da busca no catálogo ou entrada rápida.
   - Ordenação manual e visualização em grade de pôsteres ou tabela detalhada.
3. **Registro de Jogo (Game Modal & Logger)**:
   - Ao clicar em um jogo: modal com pôster ampliado, metadados (plataformas, gênero, ano), seletor de status, notas de 1 a 5 estrelas, botão de favorito (*mastered/liked*) e registro de diário com data e resenha.
4. **Adição de Novo Jogo ao Catálogo**:
   - Busca em tempo real na base interna.
   - Se o jogo não existir, botão instantâneo *"Adicionar jogo personalizado"* preenchendo título, ano, plataforma e URL da imagem (com fallback estilizado caso não haja URL).

### Identidade Visual & Tema

- **Direção Estética**: *Dark Gaming Slate* inspirado no Backloggd e Letterboxd. Fundo escuro imersivo, superfícies de cartões com contraste sutil, tipografia refinada e toques de cor de destaque para status.
- **Paleta de Cores**:
  - Fundo principal: `#0b0e14` (Slate Profundo)
  - Superfícies/Containers: `#151922` e `#1c2230` com bordas sutis `border-white/5`
  - Destaque Primário (Ação & Botões): Roxo/Índigo vibrante `#6366f1` e violeta `#8b5cf6`
  - Cores semânticas de Status:
    - *Playing*: Azul elétrico `#38bdf8`
    - *Completed*: Verde esmeralda `#34d399`
    - *Backlog*: Âmbar `#fbbf24`
    - *Wishlist*: Rosa/Magenta `#f472b6`
    - *Dropped*: Vermelho/Coral `#f87171`
  - Estrelas de Avaliação: Dourado `#f59e0b`
- **Tipografia**:
  - Títulos e Navegação: `Plus Jakarta Sans` ou `Outfit` para clareza e modernidade.
  - Dados e Estatísticas: `font-mono tabular-nums` para alinhamento numérico impecável.
  - Disciplina anti-slop: nada de pílulas estáticas redundantes ou gradientes artificiais; uso de metadados tipográficos limpos com separadores discretos (`·`).

---

## 3. Principais Decisões de Produto & Arquitetura

### Decisão 1: Modelo Hierárquico Estrito (Pasta → Lista de Jogos → Jogo)
- **Abordagem**: Cada `Folder` possui uma coleção de `GameList` IDs. Cada `GameList` possui itens com referência ao ID do `Game`, além de notas específicas da lista (ex: posição no ranking, comentários da lista).
- **Vantagem**: Atende com fidelidade à solicitação explícita do usuário, permitindo agrupar listas por temas maiores e navegar facilmente pela sidebar expansível.

### Decisão 2: Catálogo Enriquecido + Suporte Offline Total
- **Abordagem**: Uma base de dados embutida com mais de 60 jogos populares de diversas épocas e plataformas (The Witcher 3, Elden Ring, Hollow Knight, Chrono Trigger, Zelda BOTW, Resident Evil 4, Baldur's Gate 3, God of War, Persona 5, etc.) com links seguros de imagens e metadados reais, combinada com modal de cadastro manual para qualquer jogo que o usuário desejar.
- **Vantagem**: O aplicativo funciona imediatamente com dados ricos, sem necessidade de chaves de API externas pagas ou que possam expirar.

### Decisão 3: Persistência Local com Exportação/Importação
- **Abordagem**: `localStorage` com hook reativo customizado e inicializador inteligente com dados de demonstração de Leonio Ranulfo. Botões dedicados no menu de configurações para fazer download de backup `.json` e restauração a qualquer momento.

---

## 4. Arquitetura Técnica & Estrutura de Componentes

### Diagrama de Arquitetura do Sistema

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Top Bar & User Profile                          │
│   [Avatar & Bio] [Stats Bar: Total, Playing, Backlog, Completed, Stars]│
└────────────────────────────────────────────────────────────────────────┘
                                    │
         ┌──────────────────────────┴──────────────────────────┐
         ▼                                                     ▼
┌─────────────────────────────────┐   ┌──────────────────────────────────┐
│   Sidebar Tree Explorer         │   │   Main Content Viewport          │
│ ┌─────────────────────────────┐ │   │ ┌──────────────────────────────┐ │
│ │ 📁 Todas as Listas           │ │   │ │ Breadcrumbs:                 │ │
│ │                             │ │   │ │ Pastas > Franquias > RE      │ │
│ │ ▼ 📁 Franquias Favoritas    │ │   │ ├──────────────────────────────┤ │
│ │   ├─ 📋 Resident Evil Rank  │ │   │ │ Filtros e Modos de Exibição  │ │
│ │   └─ 📋 Final Fantasy       │ │   │ │ (Grade Pôster / Tabela Lista)│ │
│ │                             │ │   │ ├──────────────────────────────┤ │
│ │ ▶ 📁 Metas 2026             │ │   │ │ Grid de Jogos (Posters 3:4)  │ │
│ │                             │ │   │ │ com Status, Estrelas e Ações │ │
│ │ [+ Nova Pasta] [+ Nova Lista│ │   │ └──────────────────────────────┘ │
│ └─────────────────────────────┘ │   │                                  │
└─────────────────────────────────┘   └──────────────────────────────────┘
                 │                                      │
                 └──────────────────┬───────────────────┘
                                    ▼
       ┌────────────────────────────────────────────────────────┐
       │ Modais Interativos:                                    │
       │ - Game Detail & Status / Review / Log Modal            │
       │ - Add Game to List Modal (Search & Custom Game)        │
       │ - Create / Edit Folder Modal                           │
       │ - Create / Edit List Modal                             │
       │ - Backup / Restore Modal                               │
       └────────────────────────────────────────────────────────┘
```

### Modelo de Dados (TypeScript)

- **`Game`**: `id`, `title`, `coverUrl`, `releaseYear`, `genres: string[]`, `platforms: string[]`, `developer`
- **`Folder`**: `id`, `name`, `description?`, `createdAt`, `color`
- **`GameList`**: `id`, `folderId?` (pasta pai), `title`, `description`, `games: ListGameItem[]`, `isRanked: boolean`, `createdAt`
- **`ListGameItem`**: `gameId`, `order`, `notes?`
- **`UserGameStatus`**: `gameId`, `status: 'playing' | 'completed' | 'backlog' | 'wishlist' | 'dropped' | 'paused'`, `rating: number` (0 a 5 com meias estrelas), `isFavorite: boolean`, `hoursPlayed?: number`, `review?: string`, `completedAt?: string`
- **`GameLog`**: `id`, `gameId`, `date: string`, `status: string`, `rating?: number`, `comment?: string`, `hoursSpent?: number`

---

## 5. Próximos Passos na Implementação

Assim que o plano for aprovado, executaremos as seguintes etapas:
1. Configuração dos tipos e estado reativo centralizado (`src/types.ts` e `src/store/`).
2. Base de dados de jogos com covers de alta fidelidade e utilitários de busca (`src/data/games.ts`).
3. Construção do Layout estilo Backloggd:
   - Header do perfil de Leonio Ranulfo com contadores e abas.
   - Sidebar Explorer expansível com árvore `Pasta -> Lista`.
   - Área central com visualização em grade pôster e lista ordenada.
4. Modais interativos completos:
   - Registro de Status & Log do Jogo (estrelas, resenha, status, horas).
   - Pesquisa e adição de jogos às listas.
   - Criação/edição/exclusão de Pastas e Listas.
5. Sistema de backup (exportar e importar JSON) e persistência no `localStorage`.
6. Validação com compilação e testes de usabilidade.
