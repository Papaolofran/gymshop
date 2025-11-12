# GymShop - E-commerce de Productos Fitness

![GymShop Logo](src/assets/logo.png)

## Descripción del Proyecto

GymShop es una aplicación web de e-commerce completa para la venta de productos fitness, incluyendo suplementos deportivos y ropa deportiva. La plataforma ofrece a los usuarios la posibilidad de navegar por productos, ver detalles, añadir al carrito, gestionar direcciones de envío y realizar pedidos. Además, cuenta con un panel de administración para gestionar productos, variantes, usuarios y pedidos.

## Tecnologías Utilizadas

### Frontend
- **React 18** con **TypeScript**
- **Vite** como bundler
- **React Router** para navegación
- **TanStack Query** (React Query) para gestión de estado servidor
- **Zustand** para gestión de estado cliente
- **TailwindCSS** para estilos
- **React Icons** para iconografía
- **React Hot Toast** para notificaciones
- **Axios** para peticiones HTTP

### Backend
- **Node.js** con **TypeScript**
- **Express** como framework de servidor
- **Supabase** como base de datos (PostgreSQL)
- **JWT** para autenticación
- **Cors, Dotenv, Express-Validator**

## Requisitos Previos

Antes de instalar el proyecto, asegúrate de tener instalado:

- **Node.js** (v16.0.0 o superior)
- **npm** (v7.0.0 o superior) o **pnpm** (v6.0.0 o superior)
- Una cuenta en **Supabase** con un proyecto activo

## Instrucciones de Instalación

### Clonar el Repositorio

```bash
git clone https://github.com/yourusername/gymshop.git
cd gymshop
```

### Instalar Dependencias del Frontend

```bash
pnpm install
```

### Instalar Dependencias del Backend

```bash
cd backend
pnpm install
cd ..
```

## Configuración de Variables de Entorno

### Frontend
Crea un archivo `.env` en la raíz del proyecto con:

```env
VITE_API_URL=http://localhost:3000/api
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anónima_de_supabase
```

### Backend
Crea un archivo `.env` en la carpeta `backend` con:

```env
PORT=3000
NODE_ENV=development
SUPABASE_URL=tu_url_de_supabase
SUPABASE_KEY=tu_clave_de_servicio_de_supabase
SUPABASE_SERVICE_KEY=tu_clave_de_servicio_de_supabase
```

## Instrucciones de Ejecución

### Ejecutar el Frontend

```bash
pnpm run dev
```
El frontend estará disponible en `http://localhost:5173`

### Ejecutar el Backend

```bash
cd backend
pnpm run dev
```
El servidor API estará disponible en `http://localhost:3000`

## Estructura del Proyecto

```bash
gymshop/
├── src/                  # Código fuente del frontend
│   ├── actions/          # Funciones para hacer peticiones a la API
│   ├── assets/           # Recursos estáticos (imágenes, etc.)
│   ├── components/       # Componentes React
│   │   ├── home/         # Componentes específicos para la página principal
│   │   ├── products/     # Componentes relacionados con productos
│   │   ├── shared/       # Componentes compartidos (navbar, footer, etc.)
│   │   └── skeletons/    # Componentes de carga
│   ├── constants/        # Constantes y valores por defecto
│   ├── helpers/          # Funciones auxiliares
│   ├── hooks/            # Custom hooks de React
│   │   ├── auth/         # Hooks de autenticación
│   │   └── products/     # Hooks relacionados con productos
│   ├── interfaces/       # Interfaces y tipos TypeScript
│   ├── layouts/          # Layouts de la aplicación
│   ├── pages/            # Páginas de la aplicación
│   ├── services/         # Servicios para comunicación con la API
│   ├── store/            # Store global (Zustand)
│   ├── supabase/         # Configuración de Supabase
│   ├── App.tsx           # Componente principal
│   └── main.tsx          # Punto de entrada
│
├── backend/              # Código fuente del backend
│   ├── src/
│   │   ├── config/       # Configuraciones (BD, etc.)
│   │   ├── controllers/  # Controladores de rutas
│   │   ├── middlewares/  # Middlewares personalizados
│   │   ├── repositories/ # Acceso a datos (patrón Repository)
│   │   ├── routes/       # Definición de rutas
│   │   ├── services/     # Lógica de negocio
│   │   ├── app.ts        # Configuración de Express
│   │   └── index.ts      # Punto de entrada
│   └── package.json
│
├── public/               # Archivos públicos
├── .gitignore
├── index.html
├── package.json
├── README.md
├── tsconfig.json
└── vite.config.ts
```

## Endpoints de la API

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `GET /api/auth/verify` - Verificar token

### Usuarios
- `GET /api/users` - Listar usuarios (admin)
- `GET /api/users/:id` - Obtener usuario por ID
- `PUT /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Eliminar usuario (admin)
- `PUT /api/users/:userId/role` - Cambiar rol (admin)

### Productos
- `GET /api/products` - Listar productos con paginación
- `GET /api/products/slug/:slug` - Obtener producto por slug
- `GET /api/products/search?q=query` - Buscar productos
- `GET /api/products/filter?category=id&brand=name` - Filtrar productos
- `GET /api/products/featured` - Productos destacados
- `POST /api/products` - Crear producto (admin)
- `GET /api/products/:id` - Obtener producto por ID (admin)
- `PUT /api/products/:id` - Actualizar producto (admin)
- `DELETE /api/products/:id` - Eliminar producto (admin)

### Variantes
- `GET /api/products/:productId/variants` - Listar variantes de producto
- `GET /api/products/:productId/variants/:id` - Obtener variante
- `POST /api/products/:productId/variants` - Crear variante (admin)
- `PUT /api/products/:productId/variants/:id` - Actualizar variante (admin)
- `DELETE /api/products/:productId/variants/:id` - Eliminar variante (admin)

### Direcciones
- `GET /api/users/:userId/addresses` - Listar direcciones
- `GET /api/users/:userId/addresses/:id` - Obtener dirección
- `POST /api/users/:userId/addresses` - Crear dirección
- `PUT /api/users/:userId/addresses/:id` - Actualizar dirección
- `DELETE /api/users/:userId/addresses/:id` - Eliminar dirección

### Órdenes
- `POST /api/orders` - Crear orden
- `GET /api/users/:userId/orders` - Órdenes del usuario
- `GET /api/orders/:id` - Detalle de orden
- `PUT /api/orders/:id/status` - Actualizar estado (admin)

## Autores

- [Tu Nombre](https://github.com/yourusername)

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para detalles
