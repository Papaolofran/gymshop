import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form'; // react hook form permite crear formularios de una manera mas eficiente, ya que no necesita renderizar el formulario cada vez que se cambia un valor
import { Link, Navigate } from 'react-router-dom';
import { z } from 'zod';
import { useRegister, useUser } from '../hooks';
import { LuLoaderCircle } from 'react-icons/lu';
import { Loader } from '../components/shared/Loader';

// zod es un validador de esquemas
// sirve para validar los datos que vienen de un formulario
export const userRegisterSchema = z.object({
	email: z.string().email('El correo electrónico no es válido'),
	password: z
		.string()
		.min(6, 'La contraseña debe tener al menos 6 caracteres'),
	fullName: z.string().min(1, 'El nombre completo es requerido'),
	phone: z.string().optional(),
});

export type UserRegisterFormValues = z.infer<
	typeof userRegisterSchema
>;

export const RegisterPage = () => {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<UserRegisterFormValues>({
		defaultValues: {
			fullName: '',
			email: '',
			password: '',
			phone: '',
		},
		resolver: zodResolver(userRegisterSchema),
	});

	const { mutate, isPending } = useRegister();
	const { session, isLoading } = useUser();

	const onRegister = handleSubmit(data => {
		const { email, password, fullName, phone } = data;

		mutate({ email, password, fullName, phone });
	});

	if (isLoading) return <Loader />;

	if (session) return <Navigate to='/' />;

	return (
		<div className='h-full flex flex-col items-center mt-12 gap-5'>
			<h1 className='text-4xl font-bold capitalize'>Regístrate</h1>

			<p className='text-sm font-medium'>
				Por favor, rellene los siguientes campos:
			</p>

			{isPending ? (
				<div className='w-full h-full flex justify-center mt-20'>
					<LuLoaderCircle className='animate-spin' size={60} />
				</div>
			) : (
				<>
					<form
						className='flex flex-col items-center gap-4 w-full mt-10 sm:w-[400px] lg:w-[500px]'
						onSubmit={onRegister}
					>
						<input
							type='text'
							placeholder='Nombre Completo'
							className='border border-slate-200 text-black px-5 py-4 placeholder:text-black text-sm rounded-full w-full'
							{...register('fullName')}
						/>
						{errors.fullName && (
							<p className='text-red-500'>{errors.fullName.message}</p>
						)}

						<input
							type='text'
							placeholder='Celular'
							className='border border-slate-200 text-black px-5 py-4 placeholder:text-black text-sm rounded-full w-full'
							{...register('phone')}
						/>
						{errors.phone && (
							<p className='text-red-500'>{errors.phone.message}</p> 
						)} {/* Mensaje de error cuando el campo no es válido */}

						<input
							type='email'
							placeholder='Ingresa tu correo electrónico'
							className='border border-slate-200 text-black px-5 py-4 placeholder:text-black text-sm rounded-full w-full'
							{...register('email')}
						/>
						{errors.email && (
							<p className='text-red-500'>{errors.email.message}</p> 
						)} {/* Mensaje de error cuando el campo no es válido */}

						<input
							type='password'
							placeholder='Ingresa tu contraseña'
							className='border border-slate-200 text-black px-5 py-4 placeholder:text-black text-sm rounded-full w-full'
							{...register('password')}
						/>
						{errors.password && (
							<p className='text-red-500'>
								{errors.password.message}
							</p>
						)} {/* Mensaje de error cuando el campo no es válido */}

						<button className='bg-black text-white uppercase font-semibold tracking-widest text-xs py-4 rounded-full mt-5 w-full'>
							Registrarme
						</button>
					</form>

					<p className='text-sm text-stone-800'>
						¿Ya tienes una cuenta?
						<Link to='/login' className='underline ml-2'>
							Inicia sesión
						</Link>
					</p>
				</>
			)}
		</div>
	);
};