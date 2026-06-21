import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { AddressEntity } from '../entities/address.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { Address } from '../../../../domain/address';
import { AddressRepository } from '../../address.repository';
import { AddressMapper } from '../mappers/address.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';
import { User } from '../../../../../users/domain/user';

@Injectable()
export class AddressRelationalRepository implements AddressRepository {
  constructor(
    @InjectRepository(AddressEntity)
    private readonly addressRepository: Repository<AddressEntity>,
  ) {}

  async create(data: Address): Promise<Address> {
    const persistenceModel = AddressMapper.toPersistence(data);
    const newEntity = await this.addressRepository.save(
      this.addressRepository.create(persistenceModel),
    );
    return AddressMapper.toDomain(newEntity);
  }

  async findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<Address[]> {
    const entities = await this.addressRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });

    return entities.map((entity) => AddressMapper.toDomain(entity));
  }

  async findAllByUserWithPagination({
    userId,
    paginationOptions,
  }: {
    userId: User['id'];
    paginationOptions: IPaginationOptions;
  }): Promise<Address[]> {
    const entities = await this.addressRepository.find({
      where: { user: { id: Number(userId) } },
      order: { isDefault: 'DESC', id: 'DESC' },
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });

    return entities.map((entity) => AddressMapper.toDomain(entity));
  }

  async findById(id: Address['id']): Promise<NullableType<Address>> {
    const entity = await this.addressRepository.findOne({
      where: { id: String(id) },
    });

    return entity ? AddressMapper.toDomain(entity) : null;
  }

  async findByIdForUser(
    id: Address['id'],
    userId: User['id'],
  ): Promise<NullableType<Address>> {
    const entity = await this.addressRepository.findOne({
      where: { id: String(id), user: { id: Number(userId) } },
    });

    return entity ? AddressMapper.toDomain(entity) : null;
  }

  async clearDefaultForUser(userId: User['id']): Promise<void> {
    await this.addressRepository.update(
      { user: { id: Number(userId) } },
      { isDefault: false },
    );
  }

  async findByIds(ids: Address['id'][]): Promise<Address[]> {
    const entities = await this.addressRepository.find({
      where: { id: In(ids) },
    });

    return entities.map((entity) => AddressMapper.toDomain(entity));
  }

  async update(id: Address['id'], payload: Partial<Address>): Promise<Address> {
    const entity = await this.addressRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new Error('Record not found');
    }

    const updatedEntity = await this.addressRepository.save(
      this.addressRepository.create(
        AddressMapper.toPersistence({
          ...AddressMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return AddressMapper.toDomain(updatedEntity);
  }

  async remove(id: Address['id']): Promise<void> {
    await this.addressRepository.delete(id);
  }
}
