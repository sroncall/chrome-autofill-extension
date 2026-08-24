# Chrome Autofill Extension (Aislada)

Esta carpeta contiene una extension de Chrome independiente para:

- Inyectar un boton fijo en la esquina inferior derecha.
- Autocompletar nombre, apellido, email y telefono con FakerJS.
- Leer el OTP mas reciente (6 digitos) desde un inbox publico de Mailinator.

## Estructura

- `manifest.json`: permisos y registro del content script.
- `src/content.ts`: logica principal.
- `dist/content.js`: archivo generado para Chrome.

## Instalacion

1. En esta carpeta, instala dependencias:

```bash
npm install
```

2. Compila el content script:

```bash
npm run build
```

3. Abre `chrome://extensions/`.
4. Activa **Developer mode**.
5. Haz click en **Load unpacked** y selecciona esta carpeta `chrome-autofill-extension`.

## Uso

1. Navega a una pagina con formulario.
2. Presiona el boton **Autocompletar + OTP**.
3. La extension llenara campos comunes y tratara de buscar OTP en Mailinator.

## Nota sobre Mailinator

El script usa scraping directo sobre la web publica de Mailinator:

- `GET https://www.mailinator.com/v4/public/inboxes.jsp?to={inbox}`
- `GET https://www.mailinator.com/v4/public/msg.jsp?...`

Si una pagina requiere una direccion de correo especifica, puedes editar el inbox en `src/content.ts`.

## Icono de la extension

La extension ahora usa iconos en:

- `icons/icon16.png`
- `icons/icon32.png`
- `icons/icon48.png`
- `icons/icon128.png`

Estos archivos estan referenciados en `manifest.json` en `icons` y `action.default_icon`.

## Empaquetado y distribucion

No necesitas usar siempre **Developer mode**.

- Para desarrollo local: si, se usa `Load unpacked` en `chrome://extensions`.
- Para distribucion real a usuarios: lo formal es publicar en **Chrome Web Store**.

### Opcion recomendada (formal): Chrome Web Store

1. Genera el paquete ZIP listo para subir:

```bash
npm run package
```

Este comando:

- Compila la extension.
- Crea carpeta minima para desarrollo local: `artifacts/unpacked-v<version>/`.
- Crea un ZIP en `artifacts/` con la version actual de `package.json` (ej. `chrome-autofill-extension-v1.0.0.zip`).
- Mantiene artefactos de empaquetado (`.crx`, `.pem`) dentro de `artifacts/` para no mezclar con el proyecto principal.

Para `Load unpacked`, usa la carpeta `artifacts/unpacked-v<version>/`.

2. Si prefieres manual, ejecuta el build:

```bash
npm run build
```

3. Crea un ZIP del contenido de esta carpeta `chrome-autofill-extension` incluyendo al menos:

- `manifest.json`
- carpeta `dist/`
- carpeta `icons/`

4. Ve a Chrome Web Store Developer Dashboard y sube ese ZIP.
5. Completa ficha, screenshots, privacidad y publica.
6. Luego cualquier usuario instala desde la tienda sin Developer mode.

### Opcion no recomendada para publico general

Empaquetar como `.crx` fuera de la tienda puede funcionar en contextos controlados, pero Chrome suele restringir instalacion externa en usuarios finales. Para algo "formal y autentico", usa Web Store.

## En que paginas aparece el boton

Ya no aparece en todas las paginas. Se limita por `content_scripts.matches` en `manifest.json`.

Para soportar hosts tipo `fluxor-public.*` y `fluxor-fe.*` (que no se pueden expresar directamente con match patterns de Chrome), tambien hay un filtro en runtime en `src/content.ts`.

Actualmente esta habilitado para:

- `https://genmobile.com/*`
- `https://*.genmobile.com/*`
- `https://fluxor-public.*` (via filtro runtime por prefijo de host)
- `https://fluxor-fe.*` (via filtro runtime por prefijo de host)
- Ejemplos validos:
	- `https://fluxor-fe.master.stg.emerios.com/en/login?vertical=dish`
	- `https://fluxor-fe.develop.stg.emerios.com/en/login`
	- `https://fluxor-public.develop.stg.emerios.com/en/flow/dish/home`
- `http://localhost/*`
- `https://localhost/*`
- `http://127.0.0.1/*`
- `https://127.0.0.1/*`

Si quieres agregar o quitar sitios, edita ese arreglo y vuelve a compilar.
