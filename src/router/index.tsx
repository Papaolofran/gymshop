import { createBrowserRouter } from "react-router-dom";
import { RootLayout } from "../layouts/RootLayout";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <RootLayout/>,
        children: [
            {
                index: true,
                element: <p>Inicio</p>,
            },
            {
                path: "productos",
                element: <p>Productos</p>,
            },
            {
                path: "nosotros",
                element: <p>Sobre Nosotros</p>,
            },
        ]
    },
]);
