# Memoria del proyecto

## Estado actual
- Repositorio sincronizado con `origin/main`.
- Compilación y dependencias verificadas.

## Historial de cambios

### [2026-11-05 23:55] — Adición de vercel.json para correcto enrutamiento y assets
- **Agente:** OpenCode
- **Feature / módulo:** `vercel-config`
- **Archivos tocados:**
  - `vercel.json`
  - `memory.md`
- **Qué se hizo:** Creado `vercel.json` especificando explícitamente el framework (`vite`), comando de build (`npm run build`) y directorio de salida (`dist`). Subido a `origin/main`.
- **Motivo:** Los warnings de npm (como `install-scripts` o rutas relativas) provocaban que Vercel no cargara correctamente las rutas absolutas de los assets CSS/JS, mostrando la página sin formato.
- **Efectos colaterales / pendientes:** Ninguno. Siguiente despliegue en Vercel aplicará esta configuración.
