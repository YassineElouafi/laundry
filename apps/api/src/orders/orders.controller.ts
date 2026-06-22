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
  Request,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { AssignDriverDto } from './dto/assign-driver.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Order } from './domain/order';
import { AuthGuard } from '@nestjs/passport';
import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '../utils/dto/infinity-pagination-response.dto';
import { infinityPagination } from '../utils/infinity-pagination';
import { FindAllOrdersDto } from './dto/find-all-orders.dto';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { RolesGuard } from '../roles/roles.guard';

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'orders',
  version: '1',
})
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiCreatedResponse({ type: Order })
  create(@Request() request, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(request.user.id, createOrderDto);
  }

  @Get()
  @ApiOkResponse({ type: InfinityPaginationResponse(Order) })
  async findAll(
    @Request() request,
    @Query() query: FindAllOrdersDto,
  ): Promise<InfinityPaginationResponseDto<Order>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    return infinityPagination(
      await this.ordersService.findAllByUserWithPagination({
        userId: request.user.id,
        paginationOptions: { page, limit },
      }),
      { page, limit },
    );
  }

  @Get('admin/all')
  @Roles(RoleEnum.admin, RoleEnum.driver)
  @UseGuards(RolesGuard)
  @ApiOkResponse({ type: InfinityPaginationResponse(Order) })
  async adminFindAll(
    @Query() query: FindAllOrdersDto,
  ): Promise<InfinityPaginationResponseDto<Order>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    return infinityPagination(
      await this.ordersService.findAllWithPagination({
        paginationOptions: { page, limit },
      }),
      { page, limit },
    );
  }

  @Get('driver/mine')
  @Roles(RoleEnum.driver, RoleEnum.admin)
  @UseGuards(RolesGuard)
  @ApiOkResponse({ type: InfinityPaginationResponse(Order) })
  async driverFindMine(
    @Request() request,
    @Query() query: FindAllOrdersDto,
  ): Promise<InfinityPaginationResponseDto<Order>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    return infinityPagination(
      await this.ordersService.findAllByDriverWithPagination({
        driverId: request.user.id,
        paginationOptions: { page, limit },
      }),
      { page, limit },
    );
  }

  @Get('admin/:id')
  @Roles(RoleEnum.admin, RoleEnum.driver)
  @UseGuards(RolesGuard)
  @ApiParam({ name: 'id', type: String, required: true })
  @ApiOkResponse({ type: Order })
  adminFindOne(@Param('id') id: string) {
    return this.ordersService.findByIdOrFail(id);
  }

  @Patch('admin/:id/assign-driver')
  @Roles(RoleEnum.admin)
  @UseGuards(RolesGuard)
  @ApiParam({ name: 'id', type: String, required: true })
  @ApiOkResponse({ type: Order })
  assignDriver(
    @Param('id') id: string,
    @Body() assignDriverDto: AssignDriverDto,
  ) {
    return this.ordersService.assignDriver(id, assignDriverDto.driverId);
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: String, required: true })
  @ApiOkResponse({ type: Order })
  findOne(@Request() request, @Param('id') id: string) {
    return this.ordersService.findByIdForUser(id, request.user.id);
  }

  @Patch(':id/status')
  @Roles(RoleEnum.admin, RoleEnum.driver)
  @UseGuards(RolesGuard)
  @ApiParam({ name: 'id', type: String, required: true })
  @ApiOkResponse({ type: Order })
  updateStatus(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.transition(
      id,
      updateOrderStatusDto.status,
      updateOrderStatusDto.note,
    );
  }

  @Delete(':id')
  @Roles(RoleEnum.admin)
  @UseGuards(RolesGuard)
  @ApiParam({ name: 'id', type: String, required: true })
  remove(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }
}
