import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Payment } from './domain/payment';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { RolesGuard } from '../roles/roles.guard';
import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '../utils/dto/infinity-pagination-response.dto';
import { infinityPagination } from '../utils/infinity-pagination';

@ApiTags('Payments')
@Controller({
  path: 'payments',
  version: '1',
})
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('initiate')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiCreatedResponse({ type: Payment })
  initiate(@Request() request, @Body() dto: InitiatePaymentDto) {
    return this.paymentsService.initiate(request.user.id, dto.orderId);
  }

  @Get()
  @ApiBearerAuth()
  @Roles(RoleEnum.admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOkResponse({ type: InfinityPaginationResponse(Payment) })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<InfinityPaginationResponseDto<Payment>> {
    const p = Number(page) || 1;
    let l = Number(limit) || 20;
    if (l > 50) l = 50;
    return infinityPagination(
      await this.paymentsService.findAllWithPagination({
        paginationOptions: { page: p, limit: l },
      }),
      { page: p, limit: l },
    );
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiParam({ name: 'id', type: String, required: true })
  @ApiOkResponse({ type: Payment })
  findById(@Request() request, @Param('id') id: string) {
    return this.paymentsService.findByIdForUser(id, request.user.id);
  }

  @Post(':id/cod-paid')
  @ApiBearerAuth()
  @Roles(RoleEnum.admin, RoleEnum.driver)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiParam({ name: 'id', type: String, required: true })
  @ApiOkResponse({ type: Payment })
  markCodPaid(@Param('id') id: string) {
    return this.paymentsService.markCodPaid(id);
  }

  // CMI hosted-page callback (server-to-server / browser redirect). Public:
  // authenticated by the signed HASH, not a JWT.
  @Post('cmi/callback')
  @HttpCode(HttpStatus.OK)
  cmiCallback(@Body() body: Record<string, string>) {
    return this.paymentsService.handleCmiCallback(body);
  }
}
