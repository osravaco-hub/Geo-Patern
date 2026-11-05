# Memoria del proyecto

## Estado actual
- Añadido `vite.config.ts` con `@vitejs/plugin-react` y rutas relativas `base: './'` para corregir problemas de carga en despliegues estáticos (como Vercel).

## Historial de cambios

### [2026-11-05 17:50] — Creación de vite.config.ts
- **Agente:** OpenCode
- **Feature / módulo:** `build-config`
- **Archivos tocados:**
  - `vite.config.ts`
- **Qué se hizo:** Creado archivo de configuración de Vite con soporte para React y rutas relativas.
- **Motivo:** El proyecto carecía de `vite.config.ts`, provocando errores de enrutamiento y carga de assets en producción.
- **Efectos colaterales / pendientes:** Ejecutar instalación de dependencias y build de producción.
