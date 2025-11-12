import { Link, Navigate } from 'react-router-dom';
import { useUser } from '../hooks/auth/useUser';
import { useOrdersByUser, useCancelOrder } from '../hooks/useOrders';
import { formatPrice } from '../helpers';
import { LuLoaderCircle, LuX, LuRefreshCw, LuWifiOff } from 'react-icons/lu';
import { HiPhoto } from 'react-icons/hi2';
import type { Order } from '../services/orderService';
import { useState } from 'react';

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
	const { data: orders = [], isLoading, isError, refetch } = useOrdersByUser(session?.user?.id || '');
	const { mutate: cancelOrder, isPending: isCancelling } = useCancelOrder();
	const [orderToCancel, setOrderToCancel] = useState<number | null>(null);
	const [isRefetching, setIsRefetching] = useState(false);
	
	// Function to handle order cancellation
	const handleCancelOrder = (orderId: number | null) => {
		if (!orderId) return;
		
		cancelOrder(orderId.toString(), {
			onSuccess: () => {
				setOrderToCancel(null);
			}
		});
	};

	if (!session) {
		return <Navigate to="/login" />;
	}

	// Función para reintentar cargar los datos
	const handleRefetch = async () => {
		setIsRefetching(true);
		try {
			await refetch();
		} catch (error) {
			console.error('Error al recargar pedidos:', error);
		} finally {
			setIsRefetching(false);
		}
	};

	// Pantalla de carga
	if (isLoading) {
		return (
			<div className="flex justify-center items-center h-[60vh] flex-col gap-4">
				<LuLoaderCircle className="animate-spin text-gray-500" size={60} />
				<p className="text-gray-500">Cargando tus pedidos...</p>
			</div>
		);
	}
	
	// Pantalla de error
	if (isError) {
		return (
			<div className="flex justify-center items-center h-[60vh] flex-col gap-4">
				<LuWifiOff className="text-red-500" size={60} />
				<p className="text-gray-700 text-lg font-medium">No se pudieron cargar tus pedidos</p>
				<p className="text-gray-500">Hubo un problema al conectarse con el servidor</p>
				<button
					onClick={handleRefetch}
					className="flex items-center gap-2 bg-gray-800 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors mt-2"
					disabled={isRefetching}
				>
					{isRefetching ? (
						<>
							<LuLoaderCircle className="animate-spin" size={18} />
							Reintentando...
						</>
					) : (
						<>
							<LuRefreshCw size={18} />
							Reintentar
						</>
					)}
				</button>
			</div>
		);
	}

	return (
		<>
			<div className='flex flex-col gap-6 py-8'>
				<div className='flex justify-between items-center'>
					<div className='flex gap-2 items-center'>
						<h1 className='text-3xl font-bold'>Mis Pedidos</h1>
						{orders.length > 0 && (
							<span className='w-7 h-7 rounded-full bg-black text-white text-sm flex justify-center items-center'>
								{orders.length}
							</span>
						)}
					</div>
					
					{/* Botón de recargar */}
					<button
						onClick={handleRefetch}
						className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm"
						disabled={isRefetching || isLoading}
						title="Recargar pedidos"
					>
						{isRefetching ? (
							<LuLoaderCircle className="animate-spin" size={16} />
						) : (
							<LuRefreshCw size={16} />
						)}
						<span className="hidden sm:inline">Actualizar</span>
					</button>
				</div>

				{orders.length === 0 ? (
					<div className="flex flex-col items-center gap-6 mt-12">
						<p className='text-slate-600'>
							Todavía no has hecho ningún pedido
						</p>
						<Link
							to='/productos'
							className='bg-black text-white uppercase font-semibold tracking-widest text-xs py-4 rounded-full px-8 hover:bg-gray-800 transition-colors'
						>
							Empezar a comprar
						</Link>
					</div>
				) : (
					<div className="space-y-4">
						{orders.map((order: Order) => (
							<div
								key={order.id}
								className="relative bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
							>
								{/* Cancel button for pending or processing orders */}
								{['pending', 'processing'].includes(order.status) && (
									<button
										onClick={(e) => {
											e.preventDefault();
											setOrderToCancel(order.id);
										}}
										className="absolute top-4 right-4 bg-red-50 text-red-600 px-3 py-1 rounded-full hover:bg-red-100 transition-colors flex items-center gap-1 text-xs"
										disabled={isCancelling && orderToCancel === order.id}
										title="Cancelar orden"
									>
										<LuX size={14} />
										Cancelar
									</button>
								)}
								
								<Link
									to={`/orders/${order.id.toString()}`}
									className="block"
								>
									<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
										{/* Info principal */}
										<div className="flex-1">
											<div className="flex items-center gap-3 mb-2">
												<h3 className="font-semibold">
													Orden #{order.id}
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
										<div className="text-right pt-8 md:pt-0">
											<p className="text-sm text-gray-600">Total</p>
											<p className="text-xl font-bold">
												{formatPrice(order.totalAmount)}
											</p>
										</div>
									</div>

									{/* Productos (preview) */}
									<div className="flex gap-2 mt-4 flex-wrap">
										{order.items.slice(0, 3).map((item: Order['items'][0]) => (
											<div key={item.id} className="w-16 h-16 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
												{item.variant.product.images && item.variant.product.images.length > 0 ? (
													<img
														src={item.variant.product.images[0]}
														alt={item.variant.product.name}
														className="w-full h-full object-cover"
													/>
												) : (
													<HiPhoto className="text-gray-400" size={30} />
												)}
											</div>
										))}
										{order.items.length > 3 && (
											<div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center text-sm text-gray-600">
												+{order.items.length - 3}
											</div>
										)}
									</div>
								</Link>
							</div>
						))}
					</div>
				)}
			</div>
			
			{/* Confirmation Dialog */}
			{orderToCancel && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
						<h3 className="text-xl font-bold mb-4">¿Cancelar esta orden?</h3>
						<p className="mb-6 text-gray-600">
							¿Estás seguro que deseas cancelar la orden #{orderToCancel}? Esta acción no se puede deshacer.
						</p>
						<div className="flex justify-end gap-3">
							<button
								onClick={() => setOrderToCancel(null)}
								className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
								disabled={isCancelling}
							>
								No, mantener orden
							</button>
							<button
								onClick={() => handleCancelOrder(orderToCancel)}
								className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-1"
								disabled={isCancelling}
							>
								{isCancelling ? 'Cancelando...' : 'Sí, cancelar orden'}
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
};