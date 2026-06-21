import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
  HttpStatus,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { CreateOrderDto } from './dto/create-order.dto';
import { OrderRepository } from './infrastructure/persistence/order.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { Order } from './domain/order';
import { User } from '../users/domain/user';
import { UsersService } from '../users/users.service';
import { AddressesService } from '../addresses/addresses.service';
import { ServiceItemsService } from '../service-items/service-items.service';
import { OrderEventRepository } from '../order-events/infrastructure/persistence/order-event.repository';
import { OrderItem } from '../order-items/domain/order-item';
import { OrderStatusEnum, ORDER_TRANSITIONS } from './order-status.enum';
import {
  ORDER_CREATED_EVENT,
  ORDER_STATUS_CHANGED_EVENT,
  OrderCreatedEvent,
  OrderStatusChangedEvent,
} from './events/order.events';

const round2 = (value: number): number => Math.round(value * 100) / 100;

@Injectable()
export class OrdersService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly orderEventRepository: OrderEventRepository,
    private readonly userService: UsersService,
    private readonly addressesService: AddressesService,
    private readonly serviceItemsService: ServiceItemsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(userId: User['id'], createOrderDto: CreateOrderDto) {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: { user: 'notExists' },
      });
    }

    // Addresses must belong to the requesting user.
    const pickupAddress = await this.addressesService.findByIdForUser(
      createOrderDto.pickupAddress.id,
      userId,
    );
    const deliveryAddress = await this.addressesService.findByIdForUser(
      createOrderDto.deliveryAddress.id,
      userId,
    );

    // Build itemized lines with a price snapshot taken at order time.
    const items: OrderItem[] = [];
    let subtotal = 0;
    for (const line of createOrderDto.items) {
      const serviceItem = await this.serviceItemsService.findById(
        line.serviceItem.id,
      );
      if (!serviceItem) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: { serviceItem: 'notExists' },
        });
      }

      const unitPrice = serviceItem.unitPrice;
      const lineTotal = round2(unitPrice * line.quantity);
      subtotal = round2(subtotal + lineTotal);

      const orderItem = new OrderItem();
      orderItem.serviceItem = serviceItem;
      orderItem.quantity = line.quantity;
      orderItem.unitPrice = unitPrice;
      orderItem.lineTotal = lineTotal;
      items.push(orderItem);
    }

    const order = await this.orderRepository.create({
      user,
      pickupAddress,
      deliveryAddress,
      paymentMethod: createOrderDto.paymentMethod,
      notes: createOrderDto.notes,
      status: OrderStatusEnum.scheduled,
      subtotal,
      total: subtotal,
      items,
    });

    await this.recordEvent(order, OrderStatusEnum.scheduled, 'Order created');

    const created = (await this.orderRepository.findById(order.id)) ?? order;
    this.eventEmitter.emit(ORDER_CREATED_EVENT, new OrderCreatedEvent(created));
    this.eventEmitter.emit(
      ORDER_STATUS_CHANGED_EVENT,
      new OrderStatusChangedEvent(
        created,
        undefined,
        OrderStatusEnum.scheduled,
        'Order created',
      ),
    );

    return created;
  }

  findAllByUserWithPagination({
    userId,
    paginationOptions,
  }: {
    userId: User['id'];
    paginationOptions: IPaginationOptions;
  }) {
    return this.orderRepository.findAllByUserWithPagination({
      userId,
      paginationOptions: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      },
    });
  }

  findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }) {
    return this.orderRepository.findAllWithPagination({
      paginationOptions: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      },
    });
  }

  findById(id: Order['id']) {
    return this.orderRepository.findById(id);
  }

  async findByIdOrFail(id: Order['id']) {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new NotFoundException('orderNotFound');
    }
    return order;
  }

  async findByIdForUser(id: Order['id'], userId: User['id']) {
    const order = await this.orderRepository.findByIdForUser(id, userId);
    if (!order) {
      throw new NotFoundException('orderNotFound');
    }
    return order;
  }

  /**
   * Move an order to a new status, enforcing the allowed transition graph.
   * Writes an OrderEvent to the timeline and emits a domain event.
   */
  async transition(
    id: Order['id'],
    newStatus: OrderStatusEnum,
    note?: string,
  ): Promise<Order> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new NotFoundException('orderNotFound');
    }

    const currentStatus = order.status as OrderStatusEnum;
    const allowed = ORDER_TRANSITIONS[currentStatus] ?? [];
    if (!allowed.includes(newStatus)) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          status: `Cannot transition from ${currentStatus} to ${newStatus}`,
        },
      });
    }

    await this.orderRepository.update(id, { status: newStatus });
    const updated = (await this.orderRepository.findById(id)) as Order;

    await this.recordEvent(updated, newStatus, note);

    const reloaded = (await this.orderRepository.findById(id)) as Order;
    this.eventEmitter.emit(
      ORDER_STATUS_CHANGED_EVENT,
      new OrderStatusChangedEvent(reloaded, currentStatus, newStatus, note),
    );

    return reloaded;
  }

  async remove(id: Order['id']) {
    await this.orderRepository.remove(id);
  }

  private async recordEvent(
    order: Order,
    status: OrderStatusEnum,
    note?: string,
  ): Promise<void> {
    await this.orderEventRepository.create({
      status,
      note: note ?? null,
      order: { id: order.id } as Order,
    });
  }
}
