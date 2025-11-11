import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { signOut } from '../actions';
import { useUser } from '../hooks';
import { useEffect } from 'react';
import { supabase } from '../supabase/client';
import { Loader } from '../components/shared/Loader';
import { useUserProfile } from '../hooks/useUsers';

export const ClientLayout = () => {
	const { isLoading: isLoadingSession } = useUser();
	const { data: userData } = useUserProfile();

	const navigate = useNavigate();


  // Evitar que un usuario esté en ClientLayout sin estar con la sesión abierta
	useEffect(() => {
		supabase.auth.onAuthStateChange(async (event, session) => {
			if (event === 'SIGNED_OUT' || !session) {
				navigate('/login');
			}
		});
	}, [navigate]);

	if (isLoadingSession) return <Loader />;

	const handleLogout = async () => {
		await signOut();
	};

	return (
		<div className='flex flex-col min-h-screen'>
			{/* Menú de cuenta del usuario */}
			<div className='bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200'>
				<nav className='container mx-auto px-4 py-4 sm:py-6'>
					<div className='grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center gap-2 sm:gap-3 md:gap-4'>
						<NavLink
							to='/account/perfil'
							className={({ isActive }) =>
								`px-4 sm:px-6 py-2.5 rounded-lg font-medium text-xs sm:text-sm transition-all duration-200 text-center ${
									isActive 
										? 'bg-cyan-600 text-white shadow-md' 
										: 'bg-white text-slate-700 hover:bg-slate-200 hover:shadow-sm'
								}`
							}
						>
							Mi Perfil
						</NavLink>
						<NavLink
							to='/account/pedidos'
							className={({ isActive }) =>
								`px-4 sm:px-6 py-2.5 rounded-lg font-medium text-xs sm:text-sm transition-all duration-200 text-center ${
									isActive 
										? 'bg-cyan-600 text-white shadow-md' 
										: 'bg-white text-slate-700 hover:bg-slate-200 hover:shadow-sm'
								}`
							}
						>
							Mis Pedidos
						</NavLink>
						<NavLink
							to='/account/direcciones'
							className={({ isActive }) =>
								`px-4 sm:px-6 py-2.5 rounded-lg font-medium text-xs sm:text-sm transition-all duration-200 text-center ${
									isActive 
										? 'bg-cyan-600 text-white shadow-md' 
										: 'bg-white text-slate-700 hover:bg-slate-200 hover:shadow-sm'
								}`
							}
						>
							Direcciones
						</NavLink>
						
						{userData?.role === 'admin' && (
							<NavLink
								to='/admin/products'
								className='px-4 sm:px-6 py-2.5 rounded-lg font-medium text-xs sm:text-sm transition-all duration-200 text-center bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-lg hover:from-purple-700 hover:to-indigo-700'
							>
								Panel Admin
							</NavLink>
						)}
						
						<button 
							className='px-4 sm:px-6 py-2.5 rounded-lg font-medium text-xs sm:text-sm bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-200 hover:shadow-md text-center col-span-2 sm:col-span-1'
							onClick={handleLogout}
						>
							Cerrar Sesión
						</button>
					</div>
				</nav>
			</div>

			<main className='container mx-auto px-4 py-6 sm:py-8 flex-1'>
				<Outlet />
			</main>
		</div>
	);
};