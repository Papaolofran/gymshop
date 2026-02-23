import { useState } from 'react';
import { LuLoaderCircle } from 'react-icons/lu';
import { Link, Navigate } from 'react-router-dom';
import { useLogin, useResetPasswordRequest, useUser } from '../hooks';
import { Loader } from '../components/shared/Loader';

export const LoginPage = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [showResetForm, setShowResetForm] = useState(false);

	const { mutate: loginMutate, isPending: isLoginPending } = useLogin();
	const {
		mutate: resetMutate,
		isPending: isResetPending,
	} = useResetPasswordRequest();
	const { session, isLoading } = useUser();

	const onLogin = (e: React.FormEvent) => {
		e.preventDefault();
		loginMutate({ email, password });
	};

	const onResetPassword = (e: React.FormEvent) => {
		e.preventDefault();
		resetMutate(email);
	};

	if (isLoading) return <Loader />;
	if (session) return <Navigate to='/' />;

	const isPending = isLoginPending || isResetPending;

	return (
		<div className='h-full flex flex-col items-center mt-12 gap-5'>
			<h1 className='text-4xl font-bold capitalize'>
				{showResetForm ? 'Restablecer contraseña' : 'Iniciar sesión'}
			</h1>

			<p className='text-sm font-medium'>
				{showResetForm
					? 'Ingresa tu correo electrónico para enviarte un enlace de recuperación'
					: '¡Que bueno tenerte de vuelta!'}
			</p>

			{isPending ? (
				<div className='w-full h-full flex justify-center mt-20'>
					<LuLoaderCircle className='animate-spin text-blue-600' size={60} />
				</div>
			) : (
				<>
					{!showResetForm ? (
						<form
							className='flex flex-col items-center gap-4 w-full mt-10 sm:w-[400px] lg:w-[500px]'
							onSubmit={onLogin}
						>
							<input
								type='email'
								placeholder='Ingresa tu correo electrónico'
								className='border border-slate-200 text-black px-5 py-4 placeholder:text-black text-sm rounded-full w-full'
								value={email}
								onChange={e => setEmail(e.target.value)}
								required
							/>

							<input
								type='password'
								placeholder='Ingresa tu contraseña'
								className='border border-slate-200 text-black px-5 py-4 placeholder:text-black text-sm rounded-full w-full'
								value={password}
								onChange={e => setPassword(e.target.value)}
								required
							/>

							<button
								type='button'
								onClick={() => setShowResetForm(true)}
								className='text-xs text-stone-500 hover:underline self-end'
							>
								¿Olvidaste tu contraseña?
							</button>

							<button className='bg-black text-white uppercase font-semibold tracking-widest text-xs py-4 rounded-full mt-5 w-full'>
								Iniciar sesión
							</button>
						</form>
					) : (
						<form
							className='flex flex-col items-center gap-4 w-full mt-10 sm:w-[400px] lg:w-[500px]'
							onSubmit={onResetPassword}
						>
							<input
								type='email'
								placeholder='Ingresa tu correo electrónico'
								className='border border-slate-200 text-black px-5 py-4 placeholder:text-black text-sm rounded-full w-full'
								value={email}
								onChange={e => setEmail(e.target.value)}
								required
							/>

							<button className='bg-black text-white uppercase font-semibold tracking-widest text-xs py-4 rounded-full mt-5 w-full'>
								Enviar enlace de recuperación
							</button>

							<button
								type='button'
								onClick={() => setShowResetForm(false)}
								className='text-xs text-stone-800 underline'
							>
								Volver al inicio de sesión
							</button>
						</form>
					)}

					<p className='text-sm text-stone-800'>
						¿No tienes una cuenta?
						<Link to='/registro' className='underline ml-2'>
							Regístrate
						</Link>
					</p>
				</>
			)}
		</div>
	);
};