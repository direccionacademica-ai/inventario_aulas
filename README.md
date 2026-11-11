# Inventario y diagnóstico de aulas — La Metro

Prototipo web para registrar la inspección de un espacio académico. La versión incluida usa como ejemplo el **Bloque A · Aula 3A**.

## Abrir el prototipo

Abre `index.html` en un navegador. El formulario permite registrar identificación del espacio, mobiliario y equipos, condiciones físicas, prioridad, acción sugerida y fotografías. También puede descargar una ficha JSON.

## Publicar en GitHub Pages

1. Crea un repositorio en GitHub y sube el contenido de esta carpeta.
2. En el repositorio, abre **Settings → Pages**.
3. En **Build and deployment**, selecciona **Deploy from a branch**.
4. Elige la rama `main` y la carpeta `/(root)`; guarda los cambios.
5. Cuando termine la publicación, GitHub mostrará el enlace de la página en la sección Pages.

## Alcance y limitaciones de esta versión

- Es un prototipo estático: no requiere servidor ni proceso de compilación.
- El borrador se guarda en el almacenamiento local del navegador y no se comparte entre responsables ni dispositivos.
- Las fotografías seleccionadas se agregan a la ficha JSON al descargarla. No se guardan como archivos compartidos en GitHub.
- GitHub Pages publica una página estática; por sí solo no proporciona cuentas de responsables, permisos por aula, base de datos compartida, historial de modificaciones ni un Excel consolidado.
- No registrar información sensible ni usar esta versión como registro institucional compartido. Para el uso operativo habrá que incorporar autenticación, almacenamiento compartido, permisos e historial, y después construir la exportación consolidada.

## Estructura

```text
inventario-aulas-github/
├── index.html
├── README.md
├── .gitignore
└── apps-script/
    ├── Code.gs
    ├── Index.html
    └── appsscript.json
```

## Guardado compartido en Google Drive (Apps Script)

Se incluye una segunda versión en `apps-script/`. Esta app registra las 35 ubicaciones confirmadas, guarda cada envío como una fila en Google Sheets, crea una ficha JSON en Drive y almacena las fotos en una carpeta de evidencias. Cada envío se conserva como registro nuevo en el historial.

### Preparación en tu cuenta de Google

1. Abre [script.google.com](https://script.google.com/) e inicia un proyecto nuevo.
2. Copia `apps-script/Code.gs` en el archivo de servidor `Code.gs` y crea un archivo HTML llamado `Index` con el contenido de `apps-script/Index.html`.
3. En **Project Settings**, activa la opción para mostrar el archivo de manifiesto `appsscript.json` y reemplaza su contenido con `apps-script/appsscript.json`.
4. En el editor, selecciona y ejecuta `setupStorage`. Autoriza a Apps Script a crear una hoja y carpetas de Drive. La hoja se llamará **La Metro - Consolidado de inspecciones de aulas**.
5. Selecciona **Deploy → New deployment → Web app**. Elige **Execute as: Me** y limita **Who has access** a las cuentas del dominio institucional. Comparte la URL de la aplicación con los responsables.

Los responsables usarán la URL de Apps Script para llenar las fichas y guardar inspecciones y fotos. La página de GitHub Pages seguirá siendo una demostración local y no sincronizará datos con Google. No publiques credenciales, fotos ni fichas en este repositorio.

