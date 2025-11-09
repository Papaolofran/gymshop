# GymShop Backend API

API REST desarrollada con Node.js, TypeScript y Express para el e-commerce GymShop.

## Estructura del Proyecto

```
backend/
├── src/
│   ├── config/          # Configuraciones (BD, etc.)
│   ├── controllers/     # Controladores de rutas
│   ├── services/        # Lógica de negocio
│   ├── repositories/    # Acceso a datos (patrón Repository)
│   ├── routes/          # Definición de rutas
│   ├── middlewares/     # Middlewares personalizados
│   ├── app.js          # Configuración de Express
│   └── index.js        # Punto de entrada
├── .env                # Variables de entorno
├── .gitignore
└── package.json
```

## Instalación

```bash
cd backend
npm install
```

## Ejecución

**Desarrollo (con hot-reload):**
```bash
npm run dev
```

**Compilar TypeScript:**
```bash
npm run build
```

**Producción:**
```bash
npm start
```

## Variables de Entorno

Crear archivo `.env` con:

```
PORT=3000
NODE_ENV=development
SUPABASE_URL=tu_url_supabase
SUPABASE_KEY=tu_key_supabase
```
