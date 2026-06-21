import { OrderDto } from '../../orders/dto/order.dto';

export class CreateOrderEventDto {
  note?: string | null;

  status?: string;

  order?: OrderDto;

  // Don't forget to use the class-validator decorators in the DTO properties.
}
