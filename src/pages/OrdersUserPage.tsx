import { Link, Navigate } from 'react-router-dom';
import { useUser } from '../hooks/auth/useUser';
import { useOrdersByUser } from '../hooks/useOrders';
import { formatPrice } from '../helpers';
import { LuLoaderCircle } from 'react-icons/lu';
import type { Order } from '../services/orderService';

const statusColors: Record<string, string> = {
	pending: 'bg-yellow-100 text-yellow-800',
	processing: 'bg-blue-100 text-blue-800',
	shipped: 'bg-purple-100 text-purple-800',
	delivered: 'bg-green-100 text-green-800',
	cancelled: 'bg-red-100 text-red-800'
};

const statusLabels: Record<string, string> = {
	pending: 'Pendiente',
	processing: 'Procesando',
	shipped: 'Enviado',
	delivered: 'Entregado',
	cancelled: 'Cancelado'
};

export const OrdersUserPage = () => {
	const { session } = useUser();
	const { data: orders = [], isLoading } = useOrdersByUser(session?.user?.id || '');

	if (!session) {
		return <Navigate to="/login" />;
	}

	if (isLoading) {
		return (
			<div className="flex justify-center items-center h-[60vh]">
				<LuLoaderCircle className="animate-spin" size={60} />
			</div>
		);
	}

	return (
		<div className='flex flex-col gap-6 py-8'>
			<div className='flex gap-2 items-center'>
				<h1 className='text-3xl font-bold'>Mis Pedidos</h1>
				{orders.length > 0 && (
					<span className='w-7 h-7 rounded-full bg-black text-white text-sm flex justify-center items-center'>
						{orders.length}
					</span>
				)}
			</div>

			{orders.length === 0 ? (
				<div className="flex flex-col items-center gap-6 mt-12">
					<p className='text-slate-600'>
						Todavía no has hecho ningún pedido
					</p>
					<Link
						to='/products'
						className='bg-black text-white uppercase font-semibold tracking-widest text-xs py-4 rounded-full px-8 hover:bg-gray-800 transition-colors'
					>
						Empezar a comprar
					</Link>
				</div>
			) : (
				<div className="space-y-4">
					{orders.map((order: Order) => (
						<Link
							key={order.id}
							to={`/orders/${order.id}`}
							className="block bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
						>
							<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
								{/* Info principal */}
								<div className="flex-1">
									<div className="flex items-center gap-3 mb-2">
										<h3 className="font-semibold">
											Orden #{order.id.slice(0, 8)}
										</h3>
										<span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
											{statusLabels[order.status]}
										</span>
									</div>
									
									<p className="text-sm text-gray-600">
										{new Date(order.createdAt).toLocaleDateString('es-ES', {
											year: 'numeric',
											month: 'long',
											day: 'numeric'
										})}
									</p>
									
									<p className="text-sm text-gray-600 mt-1">
										{order.items.length} {order.items.length === 1 ? 'producto' : 'productos'}
									</p>
								</div>

								{/* Total */}
								<div className="text-right">
									<p className="text-sm text-gray-600">Total</p>
									<p className="text-xl font-bold">
										{formatPrice(order.totalAmount)}
									</p>
								</div>
							</div>

							{/* Productos (preview) */}
							<div className="flex gap-2 mt-4 flex-wrap">
								{order.items.slice(0, 3).map((item: Order['items'][0]) => (
									<img
										key={item.id}
										src={item.variant.product.images[0]}
										alt={item.variant.product.name}
										className="w-16 h-16 object-cover rounded-md"
									/>
								))}
								{order.items.length > 3 && (
									<div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center text-sm text-gray-600">
										+{order.items.length - 3}
									</div>
								)}
							</div>
						</Link>
					))}
				</div>
			)}
		</div>
	);
};