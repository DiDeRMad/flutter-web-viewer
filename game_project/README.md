# Chrono Battle Royale

Chrono Battle Royale is an online 2-D multiplayer arena shooter built with TypeScript.

## Concept
* Fast-paced top-down matches for 4–12 players
* Players collect "time shards"; spending them triggers time-bending abilities (slow-mo, rewind, dash)
* Each round lasts 5 minutes; last survivor or highest score wins

## Technology Stack
| Layer  | Tech |
|--------|------|
| Client | TypeScript + Phaser 3 + Vite |
| Server | Node.js + Express + Socket.IO + TypeScript |
| DevOps | Docker (dev), GitHub Actions (CI) |
| DB     | None yet (in-memory); later Redis/Postgres |

## Monorepo Layout
```
/game_project
  ├── server   # Node/TS backend
  │   └── src
  └── client   # Phaser front-end
      └── src
```

## Immediate Roadmap
1. Core networking loop – DONE (this commit) 🟢
2. Basic movement & state replication – DONE 🟢
3. Physics & collision – ⏳
4. Abilities & items – ⏳
5. Matchmaking & lobby – ⏳
6. Persistence (accounts, stats) – ⏳
7. CI, Docker & deployment – ⏳

Grow the codebase organically; target is 200 000 LOC by adding rich content, maps, AI bots, UI, analytics, and tools.