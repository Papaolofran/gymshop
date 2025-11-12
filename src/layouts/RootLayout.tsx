import { Outlet, useLocation } from "react-router-dom"
import { Navbar } from "../components/shared/Navbar"
import { Footer } from "../components/shared/Footer"
import { Banner } from "../components/home/Banner";
import { Newsletter } from "../components/home/Newsletter";
import { Sheet } from "../components/shared/Sheet";
import { useGlobalStore } from "../store/global.store";
import { NavbarMobile } from "../components/shared/NavbarMobile";
import { ConfirmModal } from "../components/shared/ConfirmModal";
import { useModalStore } from "../store/modal.store";

export const RootLayout = () => {
  const {pathname} = useLocation();
  const isSheetOpen = useGlobalStore((state) => state.isSheetOpen);
  const activeNavMobile = useGlobalStore(state => state.activeNavMobile);

  return (
    <div className="h-screen flex flex-col font-montserrat">
      <Navbar/>
      
      {/* Spacer div to push content below the fixed navbar */}
      <div className="h-[60px]"></div>

      {pathname === "/" && 
        <Banner/>
      }

    <main className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 my-8 flex-1">
      <Outlet/>
    </main>

    {pathname === "/" && 
        <Newsletter/>
      }

      {isSheetOpen && <Sheet/>}

      {activeNavMobile && <NavbarMobile />}
      
      <ConfirmModal
        isOpen={useModalStore(state => state.isConfirmModalOpen)}
        {...useModalStore(state => state.confirmModalProps)}
        onConfirm={useModalStore(state => state.confirmModalProps.onConfirm) || (() => {})}
        onCancel={useModalStore(state => state.confirmModalProps.onCancel) || (() => {})}
      />

      <Footer/>
    </div>
  );
};
