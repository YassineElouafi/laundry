import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class InitiatePaymentDto {
  @ApiProperty({ required: true, type: String })
  @IsString()
  @IsNotEmpty()
  orderId: string;
}
