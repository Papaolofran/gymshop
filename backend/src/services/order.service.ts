import { OrderRepository } from '../repositories/order.repository.js';
import { VariantRepository } from '../repositories/variant.repository.js';
import { AddressRepository } from '../repositories/address.repository.js';
import { ApiError } from '../middlewares/errorHandler.js';

// Interfaces para tipado
interface OrderItem {
  variantId: string;
  quantity: number;
}

interface AddressFromDB {
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

interface VariantFromDB {
  sku: string;
  attributes: Record<string, string>;
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

interface OrderFromDB {
  id: string;
  user_id: string;
  address_id: string;
  total_amount: number;
  status: string;
  created_at: string;
  updated_at: string;
  user?: UserFromDB;
  address?: AddressFromDB;
  items?: OrderItemFromDB[];
}

// Service: Capa de lógica de negocio para órdenes
// Gestiona la creación de órdenes con validación de stock
export class OrderService {
  private orderRepository: OrderRepository;
  private variantRepository: VariantRepository;
  private addressRepository: AddressRepository;

  constructor() {
    this.orderRepository = new OrderRepository();
    this.variantRepository = new VariantRepository();
    this.addressRepository = new AddressRepository();
  }

  // Obtener todas las órdenes (solo admin)
  async getAllOrders() {
    try {
      const orders = await this.orderRepository.findAll();
      return orders.map(this.transformOrder);
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

      const orders = await this.orderRepository.findByUserId(userId);
      return orders.map(this.transformOrder);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Error al obtener órdenes');
    }
  }

  // Obtener una orden específica
  async getOrderById(id: string, requestUserId: string, isAdmin: boolean) {
    try {
      const order = await this.orderRepository.findById(id);

      if (!order) {
        throw new ApiError(404, 'Orden no encontrada');
      }

      if (!isAdmin && order.user_id !== requestUserId) {
        throw new ApiError(403, 'No tienes permisos para ver esta orden');
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
      // 1. Validar que la dirección exista y pertenezca al usuario
      const address = await this.addressRepository.findById(orderData.addressId);
      
      if (!address) {
        throw new ApiError(404, 'Dirección no encontrada');
      }

      if (address.user_id !== userId) {
        throw new ApiError(400, 'La dirección no pertenece a este usuario');
      }

      // 2. Validar items y stock
      const validatedItems = await this.validateOrderItems(orderData.items);

      // 3. Calcular total
      const totalAmount = validatedItems.reduce((sum, item) => 
        sum + (item.price * item.quantity), 0
      );

      // 4. Crear la orden
      const order = await this.orderRepository.create({
        user_id: userId,
        address_id: orderData.addressId,
        total_amount: totalAmount,
        status: 'pending'
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
      throw new ApiError(500, 'Error al crear orden');
    }
  }

  // Actualizar estado de orden (solo admin)
  async updateOrderStatus(id: string, status: string) {
    try {
      const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
      
      if (!validStatuses.includes(status)) {
        throw new ApiError(400, 'Estado de orden inválido');
      }

      const order = await this.orderRepository.findById(id);

      if (!order) {
        throw new ApiError(404, 'Orden no encontrada');
      }

      const updatedOrder = await this.orderRepository.updateStatus(id, status);

      return {
        message: 'Estado de orden actualizado correctamente',
        status: updatedOrder.status
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Error al actualizar estado de orden');
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

      if (!variant.is_active) {
        throw new ApiError(400, `La variante ${variant.sku} no está disponible`);
      }

      if (variant.stock < item.quantity) {
        throw new ApiError(400, `Stock insuficiente para ${variant.sku}. Disponible: ${variant.stock}`);
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
    return {
      id: order.id,
      userId: order.user_id,
      addressId: order.address_id,
      totalAmount: order.total_amount,
      status: order.status,
      address: order.address ? {
        street: order.address.street,
        city: order.address.city,
        state: order.address.state,
        postalCode: order.address.postal_code,
        country: order.address.country
      } : null,
      items: order.items?.map((item: OrderItemFromDB) => ({
        id: item.id,
        variantId: item.variant_id,
        quantity: item.quantity,
        price: item.price,
        variant: item.variant ? {
          sku: item.variant.sku,
          attributes: item.variant.attributes,
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
