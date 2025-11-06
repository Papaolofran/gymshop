import { createBrowserRouter } from "react-router-dom";
import { RootLayout } from "../layouts/RootLayout";
import { AboutPage, HomePage, ProductsPage } from "../pages";
import { ProductPage } from "../pages/ProductPage";

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
        ]
    },
]);
