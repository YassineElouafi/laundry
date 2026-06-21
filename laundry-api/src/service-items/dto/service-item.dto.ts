import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ServiceItemDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;
}
