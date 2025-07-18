# Estructura de Archivos CSS - Plataforma Médica

Los estilos de la plataforma médica han sido organizados en archivos separados por funcionalidad para mejorar la mantenibilidad y organización del código.

## Archivos CSS y su Contenido

### 1. `base.css`
- **Contenido**: Reset CSS, variables CSS personalizadas, tipografía base y layout principal
- **Incluye**: Variables de colores, espaciado, sombras, fuentes y estilos base del body

### 2. `login.css`
- **Contenido**: Estilos específicos para la pantalla de login
- **Incluye**: Contenedor de login, tarjeta de login, logo, títulos y responsive para login

### 3. `forms.css`
- **Contenido**: Estilos para todos los formularios
- **Incluye**: Inputs, textareas, selects, labels, estados de error, file uploads y validaciones

### 4. `buttons.css`
- **Contenido**: Estilos para todos los botones
- **Incluye**: Botones primarios, secundarios, de éxito, advertencia, peligro, tamaños y estados hover

### 5. `dashboard.css`
- **Contenido**: Estilos para el dashboard principal y sidebar
- **Incluye**: Sidebar, navegación, contenido principal, header y responsive para dashboard

### 6. `cards.css`
- **Contenido**: Estilos para tarjetas y estadísticas
- **Incluye**: Tarjetas base, tarjetas de estadísticas, avatares, tarjetas de pacientes y elementos específicos

### 7. `tables.css`
- **Contenido**: Estilos para tablas
- **Incluye**: Contenedores de tabla, headers, filas, celdas y responsive para tablas

### 8. `modals.css`
- **Contenido**: Estilos para modales y overlays
- **Incluye**: Overlay, modales base, headers, body, footer y modales específicos (historias, citas)

### 9. `badges.css`
- **Contenido**: Estilos para badges y notificaciones
- **Incluye**: Badges de diferentes tipos, toasts, notificaciones y estados

### 10. `utilities.css`
- **Contenido**: Clases de utilidad y helpers
- **Incluye**: Espaciado, flexbox, grid, colores de texto, fondos, tamaños y responsive utilities

### 11. `animations.css`
- **Contenido**: Animaciones y transiciones
- **Incluye**: Keyframes, animaciones de entrada, transiciones suaves y efectos hover

### 12. `historias-clinicas.css`
- **Contenido**: Estilos específicos para la sección de historias clínicas
- **Incluye**: Selector de pacientes, tarjetas de pacientes, modal de historias y elementos específicos

### 13. `tratamientos.css`
- **Contenido**: Estilos específicos para tratamientos y citas
- **Incluye**: Tipos de cirugía, calendario, citas, modal de agendar citas y elementos específicos

## Orden de Carga

Los archivos CSS se cargan en el siguiente orden en `index.html`:

1. `base.css` - Variables y estilos base
2. `login.css` - Pantalla de login
3. `forms.css` - Formularios
4. `buttons.css` - Botones
5. `dashboard.css` - Dashboard y sidebar
6. `cards.css` - Tarjetas y estadísticas
7. `tables.css` - Tablas
8. `modals.css` - Modales
9. `badges.css` - Badges y notificaciones
10. `utilities.css` - Utilidades
11. `animations.css` - Animaciones
12. `historias-clinicas.css` - Historias clínicas
13. `tratamientos.css` - Tratamientos

## Ventajas de esta Estructura

- **Mantenibilidad**: Cada archivo tiene un propósito específico
- **Organización**: Fácil localización de estilos específicos
- **Colaboración**: Múltiples desarrolladores pueden trabajar en diferentes secciones
- **Carga selectiva**: Posibilidad de cargar solo los estilos necesarios
- **Debugging**: Más fácil identificar y corregir problemas de estilos

## Notas Importantes

- El archivo original `Genral.css` se mantiene como respaldo
- Todas las variables CSS están centralizadas en `base.css`
- Los estilos responsive están distribuidos en cada archivo según corresponda
- Las animaciones están centralizadas en `animations.css` para mejor control

## Migración

Para volver al archivo único, simplemente:
1. Cambiar la referencia en `index.html` de vuelta a `Genral.css`
2. Los archivos separados pueden mantenerse para futuras modificaciones