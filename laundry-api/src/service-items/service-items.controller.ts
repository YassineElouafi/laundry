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
import { ServiceItemsService } from './service-items.service';
import { CreateServiceItemDto } from './dto/create-service-item.dto';
import { UpdateServiceItemDto } from './dto/update-service-item.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ServiceItem } from './domain/service-item';
import { AuthGuard } from '@nestjs/passport';
import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '../utils/dto/infinity-pagination-response.dto';
import { infinityPagination } from '../utils/infinity-pagination';
import { FindAllServiceItemsDto } from './dto/find-all-service-items.dto';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { RolesGuard } from '../roles/roles.guard';

@ApiTags('Serviceitems')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'service-items',
  version: '1',
})
export class ServiceItemsController {
  constructor(private readonly serviceItemsService: ServiceItemsService) {}

  @Post()
  @Roles(RoleEnum.admin)
  @UseGuards(RolesGuard)
  @ApiCreatedResponse({
    type: ServiceItem,
  })
  create(@Body() createServiceItemDto: CreateServiceItemDto) {
    return this.serviceItemsService.create(createServiceItemDto);
  }

  @Get()
  @ApiOkResponse({
    type: InfinityPaginationResponse(ServiceItem),
  })
  async findAll(
    @Query() query: FindAllServiceItemsDto,
  ): Promise<InfinityPaginationResponseDto<ServiceItem>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    return infinityPagination(
      await this.serviceItemsService.findAllWithPagination({
        paginationOptions: {
          page,
          limit,
        },
      }),
      { page, limit },
    );
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: ServiceItem,
  })
  findById(@Param('id') id: string) {
    return this.serviceItemsService.findById(id);
  }

  @Patch(':id')
  @Roles(RoleEnum.admin)
  @UseGuards(RolesGuard)
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: ServiceItem,
  })
  update(
    @Param('id') id: string,
    @Body() updateServiceItemDto: UpdateServiceItemDto,
  ) {
    return this.serviceItemsService.update(id, updateServiceItemDto);
  }

  @Delete(':id')
  @Roles(RoleEnum.admin)
  @UseGuards(RolesGuard)
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  remove(@Param('id') id: string) {
    return this.serviceItemsService.remove(id);
  }
}
