import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { TimeSlotsService } from './time-slots.service';
import { CreateTimeSlotDto } from './dto/create-time-slot.dto';
import { UpdateTimeSlotDto } from './dto/update-time-slot.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { TimeSlot } from './domain/time-slot';
import { AuthGuard } from '@nestjs/passport';
import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '../utils/dto/infinity-pagination-response.dto';
import { infinityPagination } from '../utils/infinity-pagination';
import { FindAllTimeSlotsDto } from './dto/find-all-time-slots.dto';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { RolesGuard } from '../roles/roles.guard';
import { SlotTypeEnum } from './slot-type.enum';

@ApiTags('Timeslots')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'time-slots',
  version: '1',
})
export class TimeSlotsController {
  constructor(private readonly timeSlotsService: TimeSlotsService) {}

  @Post()
  @Roles(RoleEnum.admin)
  @UseGuards(RolesGuard)
  @ApiCreatedResponse({ type: TimeSlot })
  create(@Body() createTimeSlotDto: CreateTimeSlotDto) {
    return this.timeSlotsService.create(createTimeSlotDto);
  }

  @Get('availability')
  @ApiQuery({
    name: 'date',
    required: false,
    type: String,
    example: '2026-07-01',
  })
  @ApiQuery({ name: 'slotType', required: false, enum: SlotTypeEnum })
  @ApiOkResponse({ type: [TimeSlot] })
  findAvailable(
    @Query('date') date?: string,
    @Query('slotType') slotType?: SlotTypeEnum,
  ) {
    return this.timeSlotsService.findAvailable({ date, slotType });
  }

  @Get()
  @Roles(RoleEnum.admin)
  @UseGuards(RolesGuard)
  @ApiOkResponse({ type: InfinityPaginationResponse(TimeSlot) })
  async findAll(
    @Query() query: FindAllTimeSlotsDto,
  ): Promise<InfinityPaginationResponseDto<TimeSlot>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    return infinityPagination(
      await this.timeSlotsService.findAllWithPagination({
        paginationOptions: { page, limit },
      }),
      { page, limit },
    );
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: String, required: true })
  @ApiOkResponse({ type: TimeSlot })
  findById(@Param('id') id: string) {
    return this.timeSlotsService.findById(id);
  }

  @Post(':id/book')
  @ApiParam({ name: 'id', type: String, required: true })
  @ApiOkResponse({ type: TimeSlot })
  book(@Param('id') id: string) {
    return this.timeSlotsService.book(id);
  }

  @Patch(':id')
  @Roles(RoleEnum.admin)
  @UseGuards(RolesGuard)
  @ApiParam({ name: 'id', type: String, required: true })
  @ApiOkResponse({ type: TimeSlot })
  update(
    @Param('id') id: string,
    @Body() updateTimeSlotDto: UpdateTimeSlotDto,
  ) {
    return this.timeSlotsService.update(id, updateTimeSlotDto);
  }

  @Delete(':id')
  @Roles(RoleEnum.admin)
  @UseGuards(RolesGuard)
  @ApiParam({ name: 'id', type: String, required: true })
  remove(@Param('id') id: string) {
    return this.timeSlotsService.remove(id);
  }
}
