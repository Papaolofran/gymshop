import { OrderRepository } from '../repositories/order.repository.js';
import { VariantRepository } from '../repositories/variant.repository.js';
import { AddressRepository } from '../repositories/address.repository.js';
import { UserRepository } from '../repositories/user.repository.js';
import { ApiError } from '../middlewares/errorHandler.js';

// Interfaces para tipado
interface OrderItem {
  variantId: string;
  quantity: number;
}

interface AddressFromDB {
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

interface VariantFromDB {
  id: string;
  price: number;
  stock: number;
  color?: string | null;
  color_name?: string | null;
  size?: string | null;
  flavor?: string | null;
  weight?: string | null;
  product?: {
    name: string;
    images: string[];
  };
}

interface OrderItemFromDB {
  id: string;
  variant_id: string;
  quantity: number;
  price: number;
  variant?: VariantFromDB;
}

interface UserFromDB {
  id: string;
  email: string;
  full_name: string;
}

// Interfaz para los datos de dirección almacenados directamente en la orden
interface AddressDataFromDB {
  address_line1: string;
  address_line2?: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  address_id?: string; // Referencia al ID original de la dirección
}

interface OrderFromDB {
  id: number;
  user_id: string;
  direction_id?: string; // Ahora es opcional porque podría ser null
  shipping_address_id?: string; // Nombre alternativo que se pueda usar
  delivery_date: string;
  shipping_cost: number;
  state: string;
  created_at: string;
  updated_at: string;
  user?: UserFromDB;
  address?: AddressFromDB;
  address_data?: AddressDataFromDB; // Datos de dirección almacenados cuando la dirección original fue eliminada
  items?: OrderItemFromDB[];
}

// Service: Capa de lógica de negocio para órdenes
// Gestiona la creación de órdenes con validación de stock
export class OrderService {
  private orderRepository: OrderRepository;
  private variantRepository: VariantRepository;
  private addressRepository: AddressRepository;
  private userRepository: UserRepository;

  constructor() {
    this.orderRepository = new OrderRepository();
    this.variantRepository = new VariantRepository();
    this.addressRepository = new AddressRepository();
    this.userRepository = new UserRepository();
  }

  // Obtener todas las órdenes (solo admin)
  async getAllOrders() {
    try {
      const orders = await this.orderRepository.findAll();
      return orders.map((o) => this.transformOrder(o));
    } catch {
      throw new ApiError(500, 'Error al obtener órdenes');
    }
  }

  // Obtener órdenes de un usuario
  async getOrdersByUser(userId: string, requestUserId: string, isAdmin: boolean) {
    try {
      if (!isAdmin && userId !== requestUserId) {
        throw new ApiError(403, 'No tienes permisos para ver estas órdenes');
      }

      // Obtener el ID de la tabla users
      const user = await this.userRepository.findByUserId(userId);
      
      if (!user) {
        throw new ApiError(404, 'Usuario no encontrado');
      }

      const orders = await this.orderRepository.findByUserId(user.id);
      return orders.map((o) => this.transformOrder(o));
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Error al obtener órdenes');
    }
  }

  // Obtener una orden específica
  async getOrderById(id: number, requestUserId: string, isAdmin: boolean) {
    try {
      const order = await this.orderRepository.findById(id);

      if (!order) {
        throw new ApiError(404, 'Orden no encontrada');
      }

      // Para verificar permisos, obtener el user_id de Supabase Auth del usuario de la orden
      if (!isAdmin) {
        const orderUser = await this.userRepository.findById(order.user_id);
        if (!orderUser || orderUser.user_id !== requestUserId) {
          throw new ApiError(403, 'No tienes permisos para ver esta orden');
        }
      }

      return this.transformOrder(order);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Error al obtener orden');
    }
  }

  // Crear nueva orden
  async createOrder(userId: string, orderData: {
    addressId: string;
    items: OrderItem[];
  }) {
    try {
      // 1. Obtener el usuario de la tabla users
      const user = await this.userRepository.findByUserId(userId);
      
      if (!user) {
        throw new ApiError(404, 'Usuario no encontrado');
      }

      // 2. Validar que la dirección exista y pertenezca al usuario
      const address = await this.addressRepository.findById(orderData.addressId);
      
      if (!address) {
        throw new ApiError(404, 'Dirección no encontrada');
      }

      if (address.user_id !== user.id) {
        throw new ApiError(400, 'La dirección no pertenece a este usuario');
      }

      // 3. Validar items y stock
      const validatedItems = await this.validateOrderItems(orderData.items);

      // 4. Crear la orden
      // Fecha de entrega: 7 días desde hoy
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + 7);

      const order = await this.orderRepository.create({
        user_id: user.id,
        direction_id: orderData.addressId,
        delivery_date: deliveryDate.toISOString(),
        shipping_cost: 0, // Gratis por ahora
        state: 'pending'
      });

      // 5. Crear items de la orden
      const orderItems = validatedItems.map(item => ({
        order_id: order.id,
        variant_id: item.variantId,
        quantity: item.quantity,
        price: item.price
      }));

      await this.orderRepository.createOrderItems(orderItems);

      // 6. Actualizar stock de variantes
      await this.updateVariantsStock(validatedItems);

      // 7. Obtener orden completa
      const fullOrder = await this.orderRepository.findById(order.id);

      return this.transformOrder(fullOrder);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      console.error('Error detallado al crear orden:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new ApiError(500, `Error al crear orden: ${errorMessage}`);
    }
  }

  // Actualizar estado de orden (solo admin)
  async updateOrderStatus(id: number, status: string) {
    try {
      const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
      
      if (!validStatuses.includes(status)) {
        throw new ApiError(400, 'Estado de orden inválido');
      }

      const order = await this.orderRepository.findById(id);

      if (!order) {
        throw new ApiError(404, 'Orden no encontrada');
      }
      
      // Check if order is being cancelled
      if (status === 'cancelled' && order.state !== 'cancelled') {
        // Restore stock for all items in the order
        await this.restoreStockForCancelledOrder(id);
      }

      const updatedOrder = await this.orderRepository.updateStatus(id, status);

      return {
        message: 'Estado de orden actualizado correctamente',
        status: updatedOrder.state
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Error al actualizar estado de orden');
    }
  }
  
  // Restaurar stock cuando una orden es cancelada
  private async restoreStockForCancelledOrder(orderId: number) {
    try {
      console.log(`Restaurando stock para la orden cancelada ${orderId}`);
      
      // Get all items in the order with their quantities
      const order = await this.orderRepository.findById(orderId);
      
      if (!order || !order.items || order.items.length === 0) {
        console.log(`No se encontraron items para la orden ${orderId}`);
        return;
      }
      
      console.log(`Encontrados ${order.items.length} items para restaurar stock`);
      
      // For each item, increase the variant's stock by the quantity ordered
      for (const item of order.items) {
        // Get current stock
        const variant = await this.variantRepository.findById(item.variant_id);
        
        if (!variant) {
          console.log(`Variante ${item.variant_id} no encontrada, no se puede restaurar stock`);
          continue;
        }
        
        // Calculate new stock
        const newStock = variant.stock + item.quantity;
        console.log(`Restaurando ${item.quantity} unidades para variante ${item.variant_id}. Stock actual: ${variant.stock}, Nuevo stock: ${newStock}`);
        
        // Update stock
        await this.variantRepository.updateStock(item.variant_id, newStock);
      }
      
      console.log(`Stock restaurado exitosamente para orden ${orderId}`);
    } catch (error) {
      console.error(`Error al restaurar stock para la orden ${orderId}:`, error);
      throw new ApiError(500, 'Error al restaurar stock para orden cancelada');
    }
  }

  // Validar items de orden y verificar stock
  private async validateOrderItems(items: OrderItem[]) {
    if (!items || items.length === 0) {
      throw new ApiError(400, 'La orden debe tener al menos un item');
    }

    const validatedItems = [];

    for (const item of items) {
      if (item.quantity <= 0) {
        throw new ApiError(400, 'La cantidad debe ser mayor a 0');
      }

      const variant = await this.variantRepository.findById(item.variantId);

      if (!variant) {
        throw new ApiError(404, `Variante ${item.variantId} no encontrada`);
      }

      if (variant.stock < item.quantity) {
        throw new ApiError(400, `Stock insuficiente. Disponible: ${variant.stock}`);
      }

      validatedItems.push({
        variantId: variant.id,
        quantity: item.quantity,
        price: variant.price,
        currentStock: variant.stock
      });
    }

    return validatedItems;
  }

  // Actualizar stock de variantes después de crear orden
  private async updateVariantsStock(items: Array<{
    variantId: string;
    quantity: number;
    currentStock: number;
  }>) {
    for (const item of items) {
      const newStock = item.currentStock - item.quantity;
      await this.variantRepository.updateStock(item.variantId, newStock);
    }
  }

  // Transformar orden de BD a formato del frontend
  private transformOrder(order: OrderFromDB) {
    // Calcular total desde los items
    const totalAmount = order.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;

    return {
      id: order.id,
      userId: order.user_id,
      addressId: order.direction_id,
      totalAmount: totalAmount,
      status: order.state,
      deliveryDate: order.delivery_date,
      shippingCost: order.shipping_cost,
      address: order.address ? {
        street: order.address.address_line1,
        city: order.address.city,
        state: order.address.state,
        postalCode: order.address.postal_code,
        country: order.address.country
      } : order.address_data ? {
        // Usar datos almacenados si la dirección ya no existe
        street: order.address_data.address_line1,
        city: order.address_data.city,
        state: order.address_data.state,
        postalCode: order.address_data.postal_code,
        country: order.address_data.country
      } : null,
      items: order.items?.map((item: OrderItemFromDB) => ({
        id: item.id,
        variantId: item.variant_id,
        quantity: item.quantity,
        price: item.price,
        variant: item.variant ? {
          id: item.variant.id,
          price: item.variant.price,
          color: item.variant.color,
          colorName: item.variant.color_name,
          size: item.variant.size,
          flavor: item.variant.flavor,
          weight: item.variant.weight,
          product: item.variant.product ? {
            name: item.variant.product.name,
            images: item.variant.product.images
          } : null
        } : null
      })) || [],
      createdAt: order.created_at,
      updatedAt: order.updated_at
    };
  }
}
