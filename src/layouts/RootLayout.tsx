import { Outlet, useLocation } from "react-router-dom"
import { Navbar } from "../components/shared/Navbar"
import { Footer } from "../components/shared/Footer"
import { Banner } from "../components/home/Banner";
import { Newsletter } from "../components/home/Newsletter";
import { Sheet } from "../components/shared/Sheet";
import { useGlobalStore } from "../store/global.store";

export const RootLayout = () => {

  const {pathname} = useLocation();
  const isSheetOpen = useGlobalStore((state) => state.isSheetOpen);

  return (
    <div className="h-screen flex flex-col font-montserrat">
      <Navbar/>

      {pathname === "/" && 
        <Banner/>
      }

    <main className="w-full my-8 flex-1 px-4 md:px-8">
      <Outlet/>
    </main>

    {pathname === "/" && 
        <Newsletter/>
      }

      {isSheetOpen && <Sheet/>}

      <Footer/>
    </div>
  );
};
