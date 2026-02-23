import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/shared/Navbar';
import { Footer } from '../components/shared/Footer';
import { Banner } from '../components/home/Banner';
import { Newsletter } from '../components/home/Newsletter';
import { Sheet } from '../components/shared/Sheet';
import { useGlobalStore } from '../store/global.store';
import { NavbarMobile } from '../components/shared/NavbarMobile';
import { ConfirmModal } from '../components/shared/ConfirmModal';
import { useModalStore } from '../store/modal.store';
import { supabase } from '../supabase/client';

export const RootLayout = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isSheetOpen = useGlobalStore((state) => state.isSheetOpen);
  const activeNavMobile = useGlobalStore((state) => state.activeNavMobile);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        navigate('/reestablecer-password');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const isResetPassword = pathname === '/reestablecer-password';
  const isAboutPage = pathname === '/nosotros';

  return (
    <div className="h-screen flex flex-col font-montserrat">
      {!isResetPassword && <Navbar />}
      {!isResetPassword && <div className="h-[80px]"></div>}

      {pathname === '/' && <Banner />}

      <main
        className={`w-full flex-1 mb-8 ${!isResetPassword ? 'mt-14' : 'mt-20'} ${!isAboutPage ? 'max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8' : ''}`}
      >
        <Outlet />
      </main>

      {pathname === '/' && <Newsletter />}

      {isSheetOpen && <Sheet />}

      {activeNavMobile && <NavbarMobile />}

      <ConfirmModal
        isOpen={useModalStore((state) => state.isConfirmModalOpen)}
        {...useModalStore((state) => state.confirmModalProps)}
        onConfirm={
          useModalStore((state) => state.confirmModalProps.onConfirm) ||
          (() => {})
        }
        onCancel={
          useModalStore((state) => state.confirmModalProps.onCancel) ||
          (() => {})
        }
      />

      {!isResetPassword && <Footer />}
    </div>
  );
};
