import { OrderDto } from '../../orders/dto/order.dto';

export class CreatePaymentDto {
  ref?: string | null;

  amount?: number;

  status?: string;

  method?: string;

  order?: OrderDto;

  // Don't forget to use the class-validator decorators in the DTO properties.
}
