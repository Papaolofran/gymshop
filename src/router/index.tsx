import { createBrowserRouter, Navigate } from "react-router-dom";
import { RootLayout } from "../layouts/RootLayout";
import { AboutPage, HomePage, OrdersUserPage, ProductsPage } from "../pages";
import { ProductPage } from "../pages/ProductPage";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { ClientLayout } from "../layouts/ClientLayout";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <RootLayout/>,
        children: [
            {
                index: true,
                element: <HomePage/>,
            },
            {
                path: "productos",
                element: <ProductsPage/>,
            },
            {
                path: "productos/:slug",
                element: <ProductPage/>,
            },
            {
                path: "nosotros",
                element: <AboutPage/>,
            },
            {
                path: "login",
                element: <LoginPage/>,
            },
            {
                path: "registro",
                element: <RegisterPage/>,
            },
            {
                path: "account",
                element: <ClientLayout/>,
                children: [
                    {
                        path: "",
                        element: <Navigate to="/account/pedidos"/>
                    },
                    {
                        path: "pedidos",
                        element: <OrdersUserPage/>
                    }
                ]
            }
        ]
    },
]);
