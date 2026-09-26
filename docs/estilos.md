# 🎨 Estilos

## Principios

| | |
|---|---|
| 📱 **Mobile first** | Se diseña para ~360 px. Las clases sin prefijo son para el teléfono; `sm:`, `md:` y `lg:` solo agregan. |
| 🌗 **Claro y oscuro** | Todo color de fondo, texto y borde lleva su variante `dark:`. |
| ✋ **Táctil** | Áreas de toque de al menos 44×44 px (`min-h-11`, `size-11`). |
| 🧘 **Sobrio** | El estilo de [savegresoft.com](https://savegresoft.com): grises `zinc`, serif ligera en los títulos, esquinas rectas y un solo acento violeta. |
| ⚡ **Movimiento con propósito** | Animaciones de 150 a 300 ms, respetando "reducir movimiento". |

## Tailwind CSS v4

- Plugin `@tailwindcss/vite`; **no hay `tailwind.config.js`**: la configuración vive en `src/index.css` (`@theme`, `@custom-variant`).
- Sin archivos `.css` por componente; solo clases de Tailwind.

## Identidad visual

Sigue el lenguaje de [savegresoft.com](https://savegresoft.com), con violeta en lugar de azul.

| Elemento | Regla |
|----------|-------|
| Neutros | `zinc` (fondo oscuro `zinc-950` = `#09090b`). No usar `slate` ni `gray`. |
| Acento | `brand-*` (violeta, definido en `@theme`): botones principales, indicadores, avatar, logo, foco. Rosa (`pink`) solo en degradados de fondo. |
| Esquinas | Rectas: `--radius-*` vale 0, así `rounded-lg` o `rounded-xl` no redondean. Solo `rounded-full` para puntos, avatares y switches. |
| Botones | Mayúsculas, `text-xs font-semibold tracking-[0.2em]`. Principal violeta sólido; secundario con borde fino. |
| Etiquetas de sección | Utilidad `eyebrow` (10 px, mayúsculas, espaciado 0,25em) con una línea `h-px w-6 bg-brand-500` delante. |
| Logo | Onda en un cuadrado violeta y "Wan" en serif con punto violeta. |

| Token | Valor |
|-------|-------|
| `brand-400` | `#c084fc` |
| `brand-500` | `#a855f7` |
| `brand-600` | `#9333ea` (botones) |
| `brand-700` | `#7e22ce` |

## Tipografía

| Uso | Fuente |
|-----|--------|
| Texto e interfaz | **Instrument Sans** variable (`@fontsource-variable/instrument-sans`) |
| Títulos de página y login | **Cormorant Garamond** 300 (`@fontsource/cormorant-garamond`); `.font-display` fija el peso ligero |

Las fuentes se empaquetan con la app: no se piden a Google Fonts en tiempo de ejecución.

## Tema claro / oscuro

```mermaid
flowchart LR
    I["index.html<br/>script inline"] -- "antes del primer pintado" --> C{"wan.theme"}
    C -- "light" --> L["sin .dark"]
    C -- "dark" --> D["html.dark"]
    C -- "vacío" --> S["prefers-color-scheme"]
```

- El modo oscuro es por clase: `.dark` en `<html>`.
- `lib/theme.ts` guarda la preferencia (`light`, `dark` o ninguna = sistema) en `localStorage` bajo `wan.theme`.
- El script inline de `index.html` aplica el tema **antes** de que React cargue, así no hay parpadeo. Si cambia la clave de storage, cámbiala en los dos lugares.
- Con "sistema", el tema sigue los cambios del sistema operativo en vivo.

## Layout

| Pantalla | Navegación |
|----------|------------|
| Teléfono | Barra superior compacta + barra inferior (Inicio, Recados, Formularios, Más), respetando `env(safe-area-inset-*)` |
| `md:` y más | Sidebar fijo, colapsable a solo íconos (se recuerda en `localStorage`) |

- `min-h-dvh`, no `h-screen` (las barras del navegador móvil cambian el alto).
- Sin scroll horizontal: las tablas se vuelven tarjetas en el teléfono.

## Formularios de configuración

`FormSections` + `FormSection` dan el patrón de las pantallas de ajustes: título y descripción a la izquierda y campos a la derecha en escritorio; apilados en el teléfono.

## Motion

- Importa desde `motion/react`.
- Entrada de contenido, hojas de confirmación (`ConfirmSheet` con `AnimatePresence`) y feedback. Nada decorativo que retrase.
- `MotionConfig reducedMotion="user"` respeta la preferencia del sistema.

## Alertas

`<Toaster />` (átomo) configura react-hot-toast con los colores del tema. Cómo se disparan está en [datos.md](datos.md#alertas-con-react-hot-toast).
