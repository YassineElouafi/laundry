import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class OrderEventDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;
}
