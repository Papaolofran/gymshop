import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { useUser } from '../hooks/auth/useUser';
import { useOrdersByUser, useCancelOrder, useVerifyPayment } from '../hooks/useOrders';
import { formatPrice } from '../helpers';
import toast from 'react-hot-toast';
import { LuLoaderCircle, LuX, LuRefreshCw, LuWifiOff } from 'react-icons/lu';
import { HiPhoto } from 'react-icons/hi2';
import { useState, useMemo, useEffect } from 'react';
import type { Order } from '../services/orderService';
import { useModalStore } from '../store/modal.store';
import { Pagination } from '../components/shared/Pagination';

const statusColors: Record<string, string> = {
	pending: 'bg-yellow-100 text-yellow-800',
	processing: 'bg-blue-100 text-blue-800',
	shipped: 'bg-purple-100 text-purple-800',
	delivered: 'bg-green-100 text-green-800',
	cancelled: 'bg-red-100 text-red-800'
};

const statusLabels: Record<string, string> = {
	pending: 'Orden creada',
	processing: 'Procesando',
	shipped: 'Enviado',
	delivered: 'Entregado',
	cancelled: 'Cancelado'
};

export const OrdersUserPage = () => {
	const { session, isLoading: isLoadingSession } = useUser();
	const { data: orders = [], isLoading, isError, refetch } = useOrdersByUser(session?.user?.id || '');
	const { mutate: cancelOrder, isPending: isCancelling } = useCancelOrder();
	const { mutate: verifyPayment, isPending: isVerifying } = useVerifyPayment();
	const [searchParams, setSearchParams] = useSearchParams();
	const [isRefetching, setIsRefetching] = useState(false);
	
	// Verificar pago si venimos de MercadoPago (fallback dev)
	useEffect(() => {
		const paymentId = searchParams.get('payment_id');
		if (paymentId) {
			console.log('Detectado payment_id de MercadoPago:', paymentId);
			verifyPayment(paymentId, {
				onSuccess: (data) => {
					console.log('Verificación de pago completada:', data);
					// Limpiar parámetros de la URL
					searchParams.delete('payment_id');
					searchParams.delete('status');
					searchParams.delete('preference_id');
					searchParams.delete('collection_id');
					searchParams.delete('collection_status');
					searchParams.delete('external_reference');
					searchParams.delete('payment_type');
					searchParams.delete('merchant_order_id');
					searchParams.delete('site_id');
					searchParams.delete('processing_mode');
					searchParams.delete('merchant_account_id');
					setSearchParams(searchParams);
					
					if (data.success) {
						toast.success('¡Gracias por tu compra! Tu pedido ha sido procesado.');
					}
					refetch();
				},
				onError: (err) => {
					console.error('Error verificando pago:', err);
				}
			});
		}
	}, [searchParams, verifyPayment, setSearchParams, refetch]);
	
	const [statusFilter, setStatusFilter] = useState<string>('all');
	const [currentPage, setCurrentPage] = useState<number>(1);
	const itemsPerPage = 6;
	
	// Function to handle order cancellation
	const askCancelConfirm = (orderId: number) => {
		useModalStore.getState().openConfirmModal({
			title: '¿Cancelar esta orden?',
			message: `¿Estás seguro que deseas cancelar la orden #${orderId}? Esta acción no se puede deshacer.`,
			confirmText: 'Sí, cancelar orden',
			cancelText: 'No, mantener orden',
			onConfirm: () => {
				cancelOrder(orderId.toString(), {
					onSuccess: () => {
						useModalStore.getState().closeConfirmModal();
					}
				});
			}
		});
	};

	const filteredOrders = useMemo(() => {
		if (statusFilter === 'all') return orders;
		return orders.filter((order: Order) => order.status === statusFilter);
	}, [orders, statusFilter]);

	const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

	useEffect(() => {
		if (currentPage > totalPages && totalPages > 0) {
			setCurrentPage(totalPages);
		}
	}, [filteredOrders, totalPages, currentPage]);

	const paginatedOrders = useMemo(() => {
		const startIndex = (currentPage - 1) * itemsPerPage;
		return filteredOrders.slice(startIndex, startIndex + itemsPerPage);
	}, [filteredOrders, currentPage]);

	if (isLoadingSession) {
		return (
			<div className="flex justify-center items-center h-[60vh] flex-col gap-4">
				<LuLoaderCircle className="animate-spin text-blue-600" size={60} />
			</div>
		);
	}

	if (!session) {
		return <Navigate to="/login" />;
	}

	// Función para reintentar cargar los datos
	const handleRefetch = async () => {
		setIsRefetching(true);
		try {
			await refetch();
			setCurrentPage(1);
		} catch (error) {
			console.error('Error al recargar pedidos:', error);
		} finally {
			setIsRefetching(false);
		}
	};

	// Pantalla de carga
	if (isLoading || isVerifying) {
		return (
			<div className="flex justify-center items-center h-[60vh] flex-col gap-4">
				<LuLoaderCircle className="animate-spin text-blue-600" size={60} />
				<p className="text-gray-500">{isVerifying ? 'Verificando tu pago...' : 'Cargando tus pedidos...'}</p>
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
			<div className='flex flex-col gap-6 py-8 md:pr-4'>
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
					<div className="flex flex-col items-center gap-6 mt-12 w-full">
						<p className='text-slate-600 text-center'>
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
					<div className="w-full">
						{/* Filters */}
						<div className="flex w-full mb-6 overflow-x-auto pb-4 custom-scrollbar gap-2">
							<button
								onClick={() => { setStatusFilter('all'); setCurrentPage(1); }}
								className={`px-5 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${statusFilter === 'all' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
							>
								Todos
							</button>
							{Object.entries(statusLabels).map(([status, label]) => (
								<button
									key={status}
									onClick={() => { setStatusFilter(status); setCurrentPage(1); }}
									className={`px-5 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${statusFilter === status ? statusColors[status] : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
								>
									{label}
								</button>
							))}
						</div>

						{filteredOrders.length === 0 ? (
							<div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl">
								No hay pedidos con este estado.
							</div>
						) : (
							<>
								<div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full">
									{paginatedOrders.map((order: Order) => (
										<div
											key={order.id}
											className="relative bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow h-full flex flex-col justify-between"
										>
											<div className="flex-1">
												{/* Cancel button for pending or processing orders */}
												{['pending', 'processing'].includes(order.status) && (
													<button
														onClick={(e) => {
															e.preventDefault();
															askCancelConfirm(order.id);
														}}
														className="absolute top-4 right-4 bg-red-50 text-red-600 px-3 py-1 rounded-full hover:bg-red-100 transition-colors flex items-center gap-1 text-xs z-10"
														disabled={isCancelling}
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
													<div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
														{/* Info principal */}
														<div className="flex-1 pr-24">
															<div className="flex flex-wrap items-center gap-3 mb-2">
																<h3 className="font-bold text-lg">
																	Orden #{order.id}
																</h3>
																<span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusColors[order.status]}`}>
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
															
															<p className="text-sm font-medium text-gray-800 mt-2">
																{order.items.length} {order.items.length === 1 ? 'producto' : 'productos'}
															</p>
														</div>

														{/* Total */}
														<div className="text-left md:text-right pt-4 md:pt-0">
															<p className="text-sm text-gray-500 uppercase tracking-widest font-semibold">Total</p>
															<p className="text-2xl font-black text-black">
																{formatPrice(order.totalAmount)}
															</p>
														</div>
													</div>

													{/* Productos (preview) */}
													<div className="flex gap-2 mt-6 flex-wrap">
														{order.items.slice(0, 4).map((item: Order['items'][0]) => (
															<div key={item.id} className="w-16 h-16 rounded-lg overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center">
																{item.variant.product.images && item.variant.product.images.length > 0 ? (
																	<img
																		src={item.variant.product.images[0]}
																		alt={item.variant.product.name}
																		className="w-full h-full object-cover"
																	/>
																) : (
																	<HiPhoto className="text-gray-300" size={24} />
																)}
															</div>
														))}
														{order.items.length > 4 && (
															<div className="w-16 h-16 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center text-sm font-semibold text-gray-600">
																+{order.items.length - 4}
															</div>
														)}
													</div>
												</Link>
											</div>
										</div>
									))}
								</div>
								
								{/* Paginación */}
								<Pagination totalItems={filteredOrders.length} page={currentPage} setPage={setCurrentPage} itemsPerPage={itemsPerPage} />
							</>
						)}
					</div>
				)}
			</div>
		</>
	);
};