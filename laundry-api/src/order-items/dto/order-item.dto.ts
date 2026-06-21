import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class OrderItemDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;
}
