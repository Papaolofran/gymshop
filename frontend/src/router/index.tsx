import { createBrowserRouter, Navigate } from "react-router-dom";
import { RootLayout } from "../layouts/RootLayout";
import { AboutPage, HomePage, OrdersUserPage, ProductsPage, ResetPasswordPage } from "../pages";
import { ProductPage } from "../pages/ProductPage";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { ClientLayout } from "../layouts/ClientLayout";
import { CheckoutPage } from "../pages/CheckoutPage";
import { AddressesPage } from "../pages/AddressesPage";
import { OrderDetailPage } from "../pages/OrderDetailPage";
import { ProfilePage } from "../pages/ProfilePage";
import { AdminUsersPage } from "../pages/AdminUsersPage";
import { AdminProductsPage } from "../pages/AdminProductsPage";
import { AdminOrdersPage } from "../pages/AdminOrdersPage";
import { ProductFormPage } from "../pages/ProductFormPage";
import { ProductVariantsPage } from "../pages/ProductVariantsPage";

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
                path: "reestablecer-password",
                element: <ResetPasswordPage/>,
            },
            {
                path: "checkout",
                element: <CheckoutPage/>,
            },
            {
                path: "orders/:orderId",
                element: <OrderDetailPage/>,
            },
            {
                path: "admin/users",
                element: <AdminUsersPage/>,
            },
            {
                path: "admin/products",
                element: <AdminProductsPage/>,
            },
            {
                path: "admin/orders",
                element: <AdminOrdersPage/>,
            },
            {
                path: "admin/products/new",
                element: <ProductFormPage/>,
            },
            {
                path: "admin/products/edit/:productId",
                element: <ProductFormPage/>,
            },
            {
                path: "admin/products/:productId/variants",
                element: <ProductVariantsPage/>,
            },
            {
                path: "account",
                element: <ClientLayout/>,
                children: [
                    {
                        path: "",
                        element: <Navigate to="/account/perfil"/>
                    },
                    {
                        path: "perfil",
                        element: <ProfilePage/>
                    },
                    {
                        path: "pedidos",
                        element: <OrdersUserPage/>
                    },
                    {
                        path: "direcciones",
                        element: <AddressesPage/>
                    }
                ]
            }
        ]
    },
]);
