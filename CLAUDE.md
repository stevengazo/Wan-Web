# Frontend — reglas

Vite + React 19 + TypeScript. Estilos con Tailwind CSS v4 y animaciones con Motion.

## Mobile first

- Diseñar primero para ~360 px de ancho. Las clases sin prefijo son para móvil; `sm:`/`md:`/`lg:` solo agregan ajustes para pantallas más grandes, nunca al revés.
- Áreas táctiles de al menos 44×44 px (`size-11`) en botones e íconos interactivos.
- Usar `min-h-dvh` (no `h-screen`) y respetar `env(safe-area-inset-*)` en barras fijas.
- Nada de scroll horizontal: tablas y listas anchas se convierten en tarjetas en móvil.
- Navegación principal pensada para el pulgar (barra inferior o menú) en móvil; sidebar desde `md:`.

## Tailwind y tema claro/oscuro

- Tailwind v4 vía `@tailwindcss/vite`; la configuración vive en `src/index.css` (`@theme`, `@custom-variant`), no hay `tailwind.config.js`.
- Dark mode por clase `.dark` en `<html>`. Todo color de fondo, texto y borde lleva su variante `dark:`.
- Preferencia de tema (claro / oscuro / sistema) en `src/lib/theme.ts`. El script inline de `index.html` aplica el tema antes del primer pintado; si cambia la clave de storage, cambiarla en ambos lados.
- Sin CSS a mano salvo lo que Tailwind no cubra; nada de archivos `.css` por componente.

## Identidad visual (estilo savegresoft.com, en violeta)

- Neutros `zinc`, nunca `slate` ni `gray`. Acento: paleta `brand-*` de `src/index.css`; nada de `indigo`/`blue`.
- Esquinas rectas: los `--radius-*` valen 0. Solo `rounded-full` para puntos, avatares y switches.
- Botones: mayúsculas con `tracking-[0.2em]` y `text-xs font-semibold`; principal `bg-brand-600`, secundario con borde fino.
- Títulos con `font-display` (Cormorant Garamond ligera); etiquetas de sección con `eyebrow` y una línea violeta delante.

## Íconos

- Lucide (`lucide-react`), siempre a través de `src/components/atoms/icons.tsx`, que fija tamaño y trazo. No importar `lucide-react` directo en otros componentes ni dibujar SVG a mano.

## Motion

- Importar desde `motion/react`.
- Animaciones cortas (150–300 ms) y con propósito: entrada de contenido, cambios de estado, feedback de interacción. Nada decorativo que retrase al usuario.
- Animar `opacity` y `transform` (x, y, scale); evitar animar tamaño o layout salvo con `layout`/`layoutId`.
- `MotionConfig reducedMotion="user"` en `main.tsx` respeta "reducir movimiento" del sistema operativo; no desactivarlo.

## Generales

- Textos de la interfaz en español; código e identificadores en inglés.
- Nunca poner secretos en variables `VITE_*`: llegan al navegador.
- Verificar con `npm run build` y `npm run lint` antes de dar algo por terminado.
