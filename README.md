# GeoPattern Studio 3D

Generador procedural de patrones 2D y mapas de texturas PBR (seamless / tileables) para diseño 2D y motores 3D.

## 🚀 Características

- **Generador de Patrones 2D**: Geométricos, orgánicos, ondas, puntos y grillas con previsualización en tiempo real.
- **Exportación Vectorial**: SVG limpio y escalable + exportación PNG en múltiples resoluciones.
- **Generador de Mapas PBR (3D)**:
  - Mapas de Normales (*Normal Maps*) mediante filtro de convolución Sobel.
  - Mapas de Altura (*Height Maps*) por luminancia.
  - Mapas Alpha (*Alpha/Mask Maps*).
  - Generación sin costuras (*Seamless / Tileable*).

## 🛠️ Tecnologías

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS v4, Framer Motion, Lucide Icons.
- **Procesamiento de Imagen**: Canvas 2D API + ImageData procesado 100% en el cliente.

## 📦 Instalación y Uso

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build
```

## 📁 Estructura del Proyecto

```
src/
├── components/     # Componentes de interfaz (Header, Canvas, Selección, Exportación)
├── hooks/          # Hooks personalizados (tema, optimizaciones)
├── lib/            # Motores de patrones, cálculo PBR y exportación
└── pages/          # Páginas (Landing, Dashboard, Generador)
```

## 📜 Licencia

MIT
