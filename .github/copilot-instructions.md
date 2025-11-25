# Copilot / AI instructions for EmplihaCaixote-front

Quick, focused guidance to help an AI assistant (or contributor) be immediately productive with this repository.

Principles

- This is an Angular 19 client using standalone components and Angular Signals extensively. Prefer `signal()`/`computed()` instead of converting state to Observables unless needed.
- Low-level networking is built around a single `WsService` (WebSocket) and `UserService` (HTTP + localStorage). Use these services rather than re-implementing network access.
- `GameService` acts as a higher-level store for game state (room). `GameComponent` often listens to raw ws messages for real-time game flow.

Where to look (fast start)

- WebSocket wrapper: `src/app/services/ws.service.ts` — central for low-level message send/receive and reconnection. Keep message JSON consistent across the UI and backend.
- Game state & orchestration: `src/app/services/store/game.service.ts` — emits room state updates and the `createRoom/joinRoom` flows.
- User/auth: `src/app/services/user.service.ts` — login/register and localStorage token handling; HTTP requests use `provideHttpClient` + `authInterceptor`.
- Routing & providers: `src/app/app.config.ts` — important global providers (HttpClient interceptors, router, zone change detection strategy).
- Key pages/components: `src/app/pages/rooms/rooms.component.ts`, `src/app/pages/lobby/lobby.component.ts`, `src/app/pages/game/game.component.ts` — show usage patterns of signals and WebSocket messages.
- Types: `src/app/services/auth.ts` and `src/app/services/game.ts` — thin helpful type declarations used across components.

Developer workflows / commands

- Dev server: `npm run start` (expands to `ng serve --host 0.0.0.0 --disable-host-check`). This makes the dev server available externally.
- Build (prod): `npm run build` or `ng build` — default Angular build; config found in `angular.json`.
- Watch build: `npm run watch`.
- Tests: `npm run test` (`ng test` using Karma). Unit tests are minimal; mocking ws behavior typically required.

Important integration and environment notes

- Backend endpoints are currently hard-coded:
  - WebSocket: `src/app/services/ws.service.ts` -> `ws://192.168.0.163:8080`
  - Auth API: `src/app/services/user.service.ts` -> `http://192.168.0.163:8080/auth`
    Change these values in code (or refactor to support environment variables) if you need to run server elsewhere.
- The frontend relies heavily on real-time messages from the backend. For local development without a backend, you can:
  - Start a small local mock WebSocket server that replies with the expected message format.
  - Temporarily stub or mock `WsService` in tests or injected components.

Key message patterns (examples)

- To query rooms (client->server):
  - `ws.send({ type: 'get-rooms' });` (see `RoomsComponent`)
- Room lifecycle (fragments):
  - create: `payload = { type: 'create-room', user: { id, username }, isPrivate: boolean }`
  - join: `payload = { type: 'join-room', roomId, user: { id, username } }`
  - ready: `ws.send('player-ready', { roomId, playerId, username })` (see `LobbyComponent`)
- Game actions (examples):
  - Drop piece: `ws.send('play-move', { roomId, playerId, column })` (see `GameComponent`)
  - Use power: `ws.send('use-power', { roomId, powerType, ...})`

Pitfalls & gotchas

- `WsService.send` is implemented to accept a flexible payload. Different calling sites either use a single object (e.g., `gameService.createRoom()` calls `this.ws.send(payload)`), or a string command + object (e.g., `this.wsService.send('play-move', payload)` in `GameComponent`). Follow the code examples when adding new messages.
- `NoReuseStrategy` returns `false` for `salas` and `sala/:id` to prevent reuse for those specific paths — if you rely on lifecycle hooks (ngOnInit/ngOnDestroy) double-check `NoReuseStrategy` when navigating.

Codebase patterns and conventions

- Standalone components: many components are `standalone: true` and specify module imports in the `Component({ imports: [...] })` metadata. Prefer importing Angular primitives/modules (CommonModule, FormsModule) and internal standalone components.
- Signals: Use `signal()` for mutable local state and `computed()` for derived state. When updating arrays/objects in signals, set the whole value (e.g., `this._rooms.set(newArray)`).
- Router: Routes use `app.routes.ts`. A `NoReuseStrategy` is registered globally, meaning route reuse may be disabled for many routes — carefully check `NoReuseStrategy` when debugging component lifecycle issues.
- Http & auth: The `authInterceptor` adds `Authorization: Bearer <token>`. Tokens are stored in `localStorage` by `UserService` after login.

Testing & debugging tips

- WebSocket tests: tests should mock `WsService` or use spies to simulate `message$` emissions. Look at `src/app/services/ws.service.spec.ts` for a simple pattern.
- Use Angular DevTools to inspect signals and isolated component state during debugging.
- If a backend isn't reachable, update `ws.service.ts`/`user.service.ts` to point to `localhost` or use a mock server.

Contributed changes to consider

- Centralize backend URLs using environment files (e.g., `src/environments/*.ts`) instead of hard-coded strings.
- Add a `WsClient` typed message model and a unified enum for message `type` values to reduce mismatch risk.

When to ask for clarification

- If your change adds a new WS message type, ask whether it should be handled in `GameService` (room-level state) or only in a specific page like `GameComponent` (game mechanics). Follow existing split: store-level updates in `GameService`, real-time game flow in `GameComponent`.

Example tasks for AI completion

- Implement server-side message handling for a new power ability: identify `GameComponent` handlers for `use-power` and `board-update`, add UI control in `game.component.html`, and wire `ws.send('use-power', ...)`.
- Add environment configuration for backend URL: modify `ws.service.ts` and `user.service.ts` to read from `environment` files and update `angular.json` build configurations.

If anything here is unclear/open or you want the conventions expanded to cover specific files (e.g. message schema or new UX flows), ask and I will iterate.
