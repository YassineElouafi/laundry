import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
  HttpStatus,
} from '@nestjs/common';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { AddressRepository } from './infrastructure/persistence/address.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { Address } from './domain/address';
import { User } from '../users/domain/user';
import { UsersService } from '../users/users.service';

@Injectable()
export class AddressesService {
  constructor(
    private readonly userService: UsersService,
    private readonly addressRepository: AddressRepository,
  ) {}

  async create(userId: User['id'], createAddressDto: CreateAddressDto) {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: { user: 'notExists' },
      });
    }

    const isDefault = createAddressDto.isDefault ?? false;
    if (isDefault) {
      await this.addressRepository.clearDefaultForUser(userId);
    }

    return this.addressRepository.create({
      user,
      isDefault,
      notes: createAddressDto.notes,
      lng: createAddressDto.lng,
      lat: createAddressDto.lat,
      city: createAddressDto.city,
      line1: createAddressDto.line1,
      label: createAddressDto.label,
    });
  }

  findAllByUserWithPagination({
    userId,
    paginationOptions,
  }: {
    userId: User['id'];
    paginationOptions: IPaginationOptions;
  }) {
    return this.addressRepository.findAllByUserWithPagination({
      userId,
      paginationOptions: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      },
    });
  }

  async findByIdForUser(id: Address['id'], userId: User['id']) {
    const address = await this.addressRepository.findByIdForUser(id, userId);
    if (!address) {
      throw new NotFoundException('addressNotFound');
    }
    return address;
  }

  findByIds(ids: Address['id'][]) {
    return this.addressRepository.findByIds(ids);
  }

  async update(
    id: Address['id'],
    userId: User['id'],
    updateAddressDto: UpdateAddressDto,
  ) {
    // ensure the address belongs to the requesting user
    await this.findByIdForUser(id, userId);

    if (updateAddressDto.isDefault === true) {
      await this.addressRepository.clearDefaultForUser(userId);
    }

    return this.addressRepository.update(id, {
      isDefault: updateAddressDto.isDefault,
      notes: updateAddressDto.notes,
      lng: updateAddressDto.lng,
      lat: updateAddressDto.lat,
      city: updateAddressDto.city,
      line1: updateAddressDto.line1,
      label: updateAddressDto.label,
    });
  }

  async remove(id: Address['id'], userId: User['id']) {
    await this.findByIdForUser(id, userId);
    return this.addressRepository.remove(id);
  }
}
