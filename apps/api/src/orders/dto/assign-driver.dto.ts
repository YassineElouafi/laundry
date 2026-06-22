import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class AssignDriverDto {
  @ApiProperty({ required: true, description: 'User id of a driver-role user' })
  @IsNotEmpty()
  driverId: number | string;
}
