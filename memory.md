# Memoria del proyecto

## Estado actual
- Repositorio sincronizado con `origin/main`.
- Compilación y dependencias verificadas.

## Historial de cambios

### [2026-11-06 00:00] — Cambio de base path en vite.config.ts para rutas absolutas
- **Agente:** OpenCode
- **Feature / módulo:** `vite-config`
- **Archivos tocados:**
  - `vite.config.ts`
  - `memory.md`
- **Qué se hizo:** Cambiado `base` de `./` a `/` en vite.config.ts.
- **Motivo:** Vercel no cargaba los assets CSS/JS correctamente debido a rutas relativas.
- **Efectos colaterales / pendientes:** Ninguno.
