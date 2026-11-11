# Inventario y diagnóstico de aulas — La Metro

Prototipo web para registrar la inspección de espacios académicos. El formulario de ejemplo corresponde al **Bloque A · Aula 3A**.

## Uso

Abre la página publicada por GitHub Pages o abre `index.html` localmente en un navegador. Permite registrar mobiliario, equipos, condiciones físicas, prioridades, acciones sugeridas y fotografías. La ficha puede descargarse como JSON.

## Publicación

El repositorio incluye un flujo de GitHub Actions que publica automáticamente el contenido de la rama `main` en GitHub Pages. Revisa **Settings → Pages** o la pestaña **Actions** para consultar el estado de publicación y el enlace asignado.

## Alcance actual

- Esta es una página estática; no requiere compilación.
- Los borradores se guardan en el almacenamiento local del navegador. No se comparten entre personas ni dispositivos.
- Las fotos seleccionadas se incorporan al JSON descargado, no se suben a una carpeta compartida.
- La app aún no cuenta con cuentas de responsables, permisos por aula, base de datos compartida, historial de cambios ni consolidado Excel.

## Protección de información

Este repositorio es público. No subas aquí fichas llenas, fotografías de inspección, datos personales ni archivos exportados. El `.gitignore` excluye exportaciones locales comunes, pero revisa siempre los archivos antes de publicarlos.

Para el uso institucional compartido, hará falta conectar el formulario a un almacenamiento con acceso controlado —por ejemplo Google Sheets y Drive— e implementar autenticación, permisos e historial.
