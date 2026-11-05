# AGENTS.md — Convenciones del Proyecto

## 🎯 Descripción del proyecto

Aplicación web para la **generación de patrones procedurales** y **texturas PBR** orientada al diseño 2D y al flujo de trabajo 3D. El proyecto cubre dos grandes capacidades:

1. **Generador de patrones 2D**
   - Generación procedural y/o paramétrica de patrones (geométricos, orgánicos, teselados, ruido, etc.).
   - Previsualización en tiempo real en el navegador.
   - **Exportación / descarga en SVG** (vectorial, escalable, editable en Illustrator, Figma, Inkscape, etc.).

2. **Generador de texturas para 3D (tileables / seamless)**
   - Generación de **mapas de normales (normal maps)**.
   - Generación de **mapas de altura (height maps)**.
   - Generación de **mapas alpha (alpha maps)**.
   - Todas las texturas deben ser **sin costuras (seamless / tileables)** para poder usarse en motores 3D (Unity, Unreal, Blender, Three.js, Godot, etc.) sin artefactos en los bordes.

---

## ⚠️ Reglas obligatorias para cualquier agente

### 1. Leer `memory.md` antes de empezar

**Antes de realizar cualquier acción** (leer código, proponer cambios, escribir archivos, ejecutar comandos), **DEBES**:

1. Leer el archivo `memory.md` ubicado en la raíz del proyecto.
2. Usar su contenido como contexto inicial: estado actual del proyecto, decisiones previas, deuda técnica conocida, convenciones y cualquier nota dejada por agentes o desarrolladores anteriores.

Si `memory.md` no existe, créalo con una cabecera inicial (`# Memoria del proyecto`) antes de continuar.

### 2. Actualizar `memory.md` después de cada cambio

**Después de realizar cualquier modificación** (crear, editar o eliminar archivos; añadir features; corregir bugs; cambiar dependencias; modificar configuración), **DEBES**:

1. Abrir `memory.md`.
2. Añadir una nueva entrada bajo la sección **`## Historial de cambios`** con el siguiente formato:

   ```markdown
   ### [YYYY-MM-DD HH:MM] — <título breve del cambio>
   - **Agente:** <id del agente>
   - **Feature / módulo:** <p. ej. `normal-map-generator`, `svg-export`>
   - **Archivos tocados:**
     - `ruta/al/archivo1`
     - `ruta/al/archivo2`
   - **Qué se hizo:** descripción breve y verificable.
   - **Motivo:** por qué se hizo el cambio.
   - **Efectos colaterales / pendientes:** (si aplica).
   ```
