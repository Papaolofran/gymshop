import { useState, useEffect } from 'react';
import { LuLoaderCircle } from 'react-icons/lu';
import { useUpdatePassword, useUser } from '../hooks';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const ResetPasswordPage = () => {
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [isWaitingForSession, setIsWaitingForSession] = useState(true);
	const [updateSuccess, setUpdateSuccess] = useState(false);

	const navigate = useNavigate();
	const { mutate, isPending } = useUpdatePassword();
	const { session, isLoading: isUserLoading } = useUser();

	// Efecto para dar tiempo a la sincronización de sesión entre pestañas
	useEffect(() => {
		let timeout: NodeJS.Timeout;

		if (!isUserLoading) {
			if (session) {
				setIsWaitingForSession(false);
			} else {
				timeout = setTimeout(() => {
					setIsWaitingForSession(false);
				}, 5000); // Aumentamos a 5 segundos para dar margen en móviles/redes lentas
			}
		}

		return () => {
			if (timeout) clearTimeout(timeout);
		};
	}, [isUserLoading, session]);

	// Manejo de la redirección por falta de sesión
	useEffect(() => {
		// Solo mostramos error si:
		// 1. Ya terminamos de cargar y esperar
		// 2. No hay sesión
		// 3. NO hemos tenido éxito recientemente (para evitar el error tras el signOut)
		if (!isUserLoading && !isWaitingForSession && !session && !updateSuccess) {
			toast.error('La sesión de recuperación ha expirado o es inválida.');
			navigate('/login');
		}
	}, [isUserLoading, isWaitingForSession, session, navigate, updateSuccess]);

	const onUpdatePassword = (e: React.FormEvent) => {
		e.preventDefault();

		if (password !== confirmPassword) {
			toast.error('Las contraseñas no coinciden');
			return;
		}

		if (password.length < 6) {
			toast.error('La contraseña debe tener al menos 6 caracteres');
			return;
		}

		mutate(password, {
			onSuccess: () => {
				setUpdateSuccess(true);
			},
		});
	};

	if (isUserLoading || (isWaitingForSession && !session)) {
		return (
			<div className='w-full h-full flex flex-col items-center justify-center mt-20 gap-4'>
				<LuLoaderCircle className='animate-spin text-blue-600' size={60} />
				<p className='text-sm text-stone-500 animate-pulse'>
					Verificando sesión de recuperación...
				</p>
			</div>
		);
	}

	if (!session && !updateSuccess) return null;

	return (
		<div className='h-full flex flex-col items-center mt-12 gap-5'>
			<h1 className='text-4xl font-bold capitalize'>Nueva contraseña</h1>

			<p className='text-sm font-medium'>
				Ingresa tu nueva contraseña a continuación
			</p>

			{isPending ? (
				<div className='w-full h-full flex justify-center mt-20'>
					<LuLoaderCircle className='animate-spin text-blue-600' size={60} />
				</div>
			) : (
				<form
					className='flex flex-col items-center gap-4 w-full mt-10 sm:w-[400px] lg:w-[500px]'
					onSubmit={onUpdatePassword}
				>
					<input
						type='password'
						placeholder='Ingresa tu nueva contraseña'
						className='border border-slate-200 text-black px-5 py-4 placeholder:text-black text-sm rounded-full w-full'
						value={password}
						onChange={e => setPassword(e.target.value)}
						required
						minLength={6}
					/>

					<input
						type='password'
						placeholder='Confirma tu nueva contraseña'
						className='border border-slate-200 text-black px-5 py-4 placeholder:text-black text-sm rounded-full w-full'
						value={confirmPassword}
						onChange={e => setConfirmPassword(e.target.value)}
						required
						minLength={6}
					/>

					<button className='bg-black text-white uppercase font-semibold tracking-widest text-xs py-4 rounded-full mt-5 w-full'>
						Actualizar contraseña
					</button>
				</form>
			)}
		</div>
	);
};
