# Sigo Seguros — Asistente de Rapport

Herramienta interna para agentes de ventas. Ingresan código postal y obtienen
clima, datos curiosos y rompehielos para construir rapport con clientes.

## Desarrollo local

```bash
npm install
npm run dev
```

Para probar la función localmente necesitas Netlify CLI:

```bash
npm install -g netlify-cli
netlify dev
```

Y crear un archivo `.env` con:

```
ANTHROPIC_API_KEY=sk-ant-...
```

## Desplegar en Netlify

### Opción A — Desde GitHub (recomendado)

1. Sube el proyecto a un repositorio de GitHub.
2. En Netlify: **Add new site → Import an existing project**.
3. Conecta el repo. Netlify detecta `netlify.toml` automáticamente.
4. En **Site settings → Environment variables**, agrega:
   - `ANTHROPIC_API_KEY` con tu clave de Anthropic.
5. Deploy.

### Opción B — Drag & drop (más rápido para probar)

1. `npm install`
2. `npm run build` (genera la carpeta `dist`)
3. En Netlify, arrastra la carpeta `dist` a la zona de deploy.
4. **Importante:** este método NO incluye la función serverless. Para que
   funcione el llamado a la API debes usar la Opción A o subir el proyecto
   completo con Netlify CLI: `netlify deploy --prod`.

## Estructura

```
/
├── index.html              ← entry point
├── package.json            ← dependencias
├── vite.config.js          ← config Vite
├── tailwind.config.js      ← config Tailwind
├── netlify.toml            ← config Netlify (build + redirects)
├── src/
│   ├── main.jsx            ← React entry
│   ├── RapportBuilder.jsx  ← componente principal
│   └── index.css           ← Tailwind
└── netlify/
    └── functions/
        └── rapport.js      ← serverless function (oculta API key)
```

## Seguridad

La API key NUNCA debe ir en el frontend. La función `rapport.js` corre en
el servidor de Netlify y lee la key de variables de entorno.
