# Chrome Autofill Extension

Extension de Chrome (Manifest V3) para autocompletar formularios y recuperar OTP desde Mailinator.

## Funcionalidades

- Boton flotante ("Auto + OTP") para ejecutar autofill.
- Generacion de nombres y apellidos aleatorios en cada clic del paso inicial (salvo apellido fijo configurado).
- Continuidad del perfil en los pasos siguientes, mediante una sesion por pestaña de 30 minutos de inactividad. Volver al paso inicial genera otro perfil; el paso se identifica por URL y campos presentes, incluidos formularios SPA.
- Recuperacion de PIN/OTP (4 a 8 digitos) desde inbox publico de Mailinator, sin cambiar el email en la pantalla de validacion.
- Preferencias por host guardadas en `chrome.storage.local`:
  - Posicion del boton.
  - Last name fijo opcional.
  - Estado de sugerencias ZIP.
- Aviso de nueva version disponible comparando la version instalada con la latest release.

## Requisitos

- Node.js 20+
- npm
- Google Chrome

## Instalacion y desarrollo local

1. Instala dependencias:

```bash
npm install
```

2. Compila la extension:

```bash
npm run build
```

3. Carga en Chrome:
- Abre `chrome://extensions/`
- Activa **Developer mode**
- Haz click en **Load unpacked**
- Selecciona la carpeta del proyecto

## Scripts disponibles

- `npm run build`: compila `src/content.ts` y `src/background.ts` en `dist/`.
- `npm run watch`: compila en modo watch.
- `npm run typecheck`: validacion TypeScript sin emitir archivos.
- `npm run package`: genera artefactos de distribucion en `artifacts/`.
- `npm run release:patch|minor|major`: incrementa version, crea commit, crea tag y hace push con tags.

## Empaquetado

`npm run package` genera:

- `artifacts/unpacked-v<version>/`: carpeta lista para `Load unpacked`.
- `artifacts/chrome-autofill-extension-v<version>.zip`: ZIP versionado.

## Release y descarga

El workflow de release publica assets en GitHub Releases.

Archivo recomendado para usuarios:

- `autofill-otp-chrome-latest.zip` (asset estable para "ultima version").

URL estable:

- `https://github.com/sroncall/chrome-autofill-extension/releases/latest/download/autofill-otp-chrome-latest.zip`

## OTP con Mailinator

La extension consulta el API publico v2 de Mailinator desde background script y busca el codigo OTP en los mensajes mas recientes del inbox. Realiza hasta 8 intentos separados por 5 segundos, reintenta fallos temporales y permite volver a consultar sin cooldown. Reconoce codigos en texto, HTML, quoted-printable y base64, incluidos codigos separados como `123 456`.

La continuidad es heuristica: los sitios no exponen un identificador de flujo comun. Se mantiene en el mismo origen/pestaña y no se comparte entre dominios. Para iniciar otra prueba, vuelve al formulario inicial o abre una pestaña nueva.

## Hosts soportados

La extension se inyecta segun `content_scripts.matches` y validaciones runtime.

Incluye, entre otros:

- `genmobile.com` y subdominios
- `emerios.com` y subdominios
- `.vmbc.com` y subdominios
- `localhost` y `127.0.0.1`
- Hosts con prefijo `fluxor-public.` y `fluxor-fe.`

## Estructura principal

- `manifest.json`: configuracion Manifest V3.
- `src/content.ts`: inicializacion del content script.
- `src/background.ts`: logica de OTP y mensajeria.
- `src/content/`: modulos de autofill, UI y storage.
- `scripts/packageExtension.ps1`: empaquetado local.

## Notas

- Se recomienda publicar para usuarios finales mediante Chrome Web Store.
- Mantener el formato de tags de release como `vX.Y.Z`.
