# EmplihaCaixote Front – Componentes e Funções

## Visão Geral
- Aplicação Angular standalone com gerenciamento de estado via Signals e comunicação em tempo real através de WebSocket.
- Rotas principais em `src/app/app.routes.ts` e providers em `src/app/app.config.ts`.

## Mapa de Rotas
- `'/salas'` → `RoomsComponent`
- `'/sala/:id'` → `LobbyComponent`
- `'/game'` → `GameComponent`
- `'/loja'` → `LojaComponent`
- `'/login'` → `LoginComponent`
- `'/cadastro'` → `CadastroComponent`
- `'/'` → `HomeComponent`

## Componentes de Página

### AppComponent
- Arquivo: `src/app/app.component.ts`
- Função: Componente raiz que rende o `router-outlet` para navegação da aplicação.

### HomeComponent
- Arquivo: `src/app/pages/home/home.component.ts`
- Funções:
  - Exibe ações iniciais com base no estado de autenticação (`login`, `cadastro`, `iniciar`, `loja`).
  - Utiliza `UserService` para verificar se o usuário está autenticado.

### LoginComponent
- Arquivo: `src/app/pages/auth/login/login.component.ts`
- Funções:
  - Formulário de login e submissão para a API de autenticação via `UserService`.
  - Navega para `'/salas'` após sucesso; exibe mensagens de erro em caso de falha.

### CadastroComponent
- Arquivo: `src/app/pages/auth/cadastro/cadastro.component.ts`
- Funções:
  - Formulário de cadastro e submissão para a API via `UserService`.
  - Valida campos e navega para `'/salas'` após sucesso.

### RoomsComponent
- Arquivo: `src/app/pages/rooms/rooms.component.ts`
- Funções:
  - Lista de salas públicas com criação/entrada de sala (`GameService` + `WsService`).
  - Mantém `rooms` em `signal/computed` e gerencia navegação para o lobby.

### LobbyComponent
- Arquivo: `src/app/pages/lobby/lobby.component.ts`
- Funções:
  - Tela de espera da sala, mostrando jogadores, prontidão e estado da sala.
  - Escuta eventos via `WsService` e navega para `'/game'` ao receber `start-game`.

### GameComponent
- Arquivo: `src/app/pages/game/game.component.ts`
- Funções:
  - Área de jogo Connect Four: grid, controle de colunas, peças e timer de turno.
  - Integração com `WsService` para eventos: `start-game`, `turn-start`, `board-update`, `turn-timeout`, `game-over`.
  - Estados locais (`gameState`, `timerInfo`) e poderes (limpar linha, eliminar caixa, reduzir tempo, bloquear coluna).

### LojaComponent
- Arquivo: `src/app/pages/loja/loja.component.ts`
- Função: Página da loja (estrutura base pronta para expansão).

## Componentes Compartilhados

### CardLayoutComponent
- Arquivo: `src/app/components/card-layout/card-layout.component.ts`
- Função: Layout de cartão reutilizável para páginas com conteúdo centralizado e estilização consistente.

## Serviços

### UserService
- Arquivo: `src/app/services/user.service.ts`
- Funções:
  - Login/Cadastro via HTTP; guarda `token` e `user` no `localStorage`.
  - Signals: `user`, `isLoggedIn`. Métodos utilitários `getToken`, `getUser`, `logout`.

### WsService
- Arquivo: `src/app/services/ws.service.ts`
- Funções:
  - Conexão WebSocket com fila de envio, reabertura automática e fluxos `message$` e `onOpen()`.
  - API `send(typeOrPayload, payload?)` para comunicação com o backend.

### GameService
- Arquivo: `src/app/services/store/game.service.ts`
- Funções:
  - Estado da sala e integração com WebSocket para criar/entrar sala.
  - Interface com `RoomInfo` e tipagem de mensagens de servidor/cliente.

## Guard, Interceptor e Estratégia

### authGuard
- Arquivo: `src/app/guards/auth.guard.ts`
- Função: Restringe acesso às páginas protegidas baseado em `UserService.isLoggedIn()`.

### authInterceptor
- Arquivo: `src/app/interceptors/auth.interceptor.ts`
- Função: Anexa `Authorization: Bearer <token>` às requisições HTTP quando disponível.

### NoReuseStrategy
- Arquivo: `src/app/strategies/no-reuse-strategy.ts`
- Função: Controla reutilização de rotas para evitar manter componentes indevidamente ativos na navegação.

## Referências Úteis
- Rotas: `src/app/app.routes.ts`
- Providers: `src/app/app.config.ts`

## Observações de UI
- Tipografia `'VCR_OSD_MONO'` configurada em `src/styles.scss` e aplicada amplamente em títulos e elementos-chave.
- Padrões visuais harmonizados entre `Rooms` e `Lobby` para consistência.
