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
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Address } from './domain/address';
import { AuthGuard } from '@nestjs/passport';
import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '../utils/dto/infinity-pagination-response.dto';
import { infinityPagination } from '../utils/infinity-pagination';
import { FindAllAddressesDto } from './dto/find-all-addresses.dto';

@ApiTags('Addresses')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'addresses',
  version: '1',
})
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  @ApiCreatedResponse({
    type: Address,
  })
  create(@Request() request, @Body() createAddressDto: CreateAddressDto) {
    return this.addressesService.create(request.user.id, createAddressDto);
  }

  @Get()
  @ApiOkResponse({
    type: InfinityPaginationResponse(Address),
  })
  async findAll(
    @Request() request,
    @Query() query: FindAllAddressesDto,
  ): Promise<InfinityPaginationResponseDto<Address>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    return infinityPagination(
      await this.addressesService.findAllByUserWithPagination({
        userId: request.user.id,
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
    type: Address,
  })
  findById(@Request() request, @Param('id') id: string) {
    return this.addressesService.findByIdForUser(id, request.user.id);
  }

  @Patch(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: Address,
  })
  update(
    @Request() request,
    @Param('id') id: string,
    @Body() updateAddressDto: UpdateAddressDto,
  ) {
    return this.addressesService.update(id, request.user.id, updateAddressDto);
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  remove(@Request() request, @Param('id') id: string) {
    return this.addressesService.remove(id, request.user.id);
  }
}
