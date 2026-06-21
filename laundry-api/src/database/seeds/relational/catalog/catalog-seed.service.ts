import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceCategoryEntity } from '../../../../service-categories/infrastructure/persistence/relational/entities/service-category.entity';
import { ServiceItemEntity } from '../../../../service-items/infrastructure/persistence/relational/entities/service-item.entity';
import { PriceTypeEnum } from '../../../../service-items/price-type.enum';

type SeedItem = {
  name: Record<string, string>;
  priceType: PriceTypeEnum;
  unitPrice: number;
};

type SeedCategory = {
  name: Record<string, string>;
  icon: string;
  sortOrder: number;
  items: SeedItem[];
};

const CATALOG: SeedCategory[] = [
  {
    name: { en: 'Wash & Fold', fr: 'Lavage & Pliage', ar: 'غسل وطي' },
    icon: 'washing-machine',
    sortOrder: 1,
    items: [
      {
        name: { en: 'Mixed laundry', fr: 'Linge mélangé', ar: 'غسيل مختلط' },
        priceType: PriceTypeEnum.perKilo,
        unitPrice: 25,
      },
      {
        name: { en: 'Delicates', fr: 'Délicats', ar: 'أقمشة رقيقة' },
        priceType: PriceTypeEnum.perKilo,
        unitPrice: 40,
      },
    ],
  },
  {
    name: { en: 'Dry Cleaning', fr: 'Nettoyage à sec', ar: 'تنظيف جاف' },
    icon: 'hanger',
    sortOrder: 2,
    items: [
      {
        name: { en: 'Suit (2 pieces)', fr: 'Costume (2 pièces)', ar: 'بدلة' },
        priceType: PriceTypeEnum.perItem,
        unitPrice: 80,
      },
      {
        name: { en: 'Dress', fr: 'Robe', ar: 'فستان' },
        priceType: PriceTypeEnum.perItem,
        unitPrice: 60,
      },
      {
        name: { en: 'Jacket', fr: 'Veste', ar: 'سترة' },
        priceType: PriceTypeEnum.perItem,
        unitPrice: 50,
      },
    ],
  },
  {
    name: { en: 'Ironing', fr: 'Repassage', ar: 'كي' },
    icon: 'iron',
    sortOrder: 3,
    items: [
      {
        name: { en: 'Shirt', fr: 'Chemise', ar: 'قميص' },
        priceType: PriceTypeEnum.perItem,
        unitPrice: 10,
      },
      {
        name: { en: 'Trousers', fr: 'Pantalon', ar: 'سروال' },
        priceType: PriceTypeEnum.perItem,
        unitPrice: 12,
      },
    ],
  },
  {
    name: { en: 'Shoes', fr: 'Chaussures', ar: 'أحذية' },
    icon: 'shoe',
    sortOrder: 4,
    items: [
      {
        name: {
          en: 'Sneakers cleaning',
          fr: 'Nettoyage baskets',
          ar: 'تنظيف أحذية رياضية',
        },
        priceType: PriceTypeEnum.perItem,
        unitPrice: 70,
      },
    ],
  },
  {
    name: { en: 'Carpets', fr: 'Tapis', ar: 'سجاد' },
    icon: 'rug',
    sortOrder: 5,
    items: [
      {
        name: {
          en: 'Carpet cleaning',
          fr: 'Nettoyage tapis',
          ar: 'تنظيف السجاد',
        },
        priceType: PriceTypeEnum.perKilo,
        unitPrice: 35,
      },
    ],
  },
];

@Injectable()
export class CatalogSeedService {
  constructor(
    @InjectRepository(ServiceCategoryEntity)
    private readonly categoryRepository: Repository<ServiceCategoryEntity>,
    @InjectRepository(ServiceItemEntity)
    private readonly itemRepository: Repository<ServiceItemEntity>,
  ) {}

  async run() {
    const existing = await this.categoryRepository.count();
    if (existing > 0) {
      return;
    }

    for (const category of CATALOG) {
      const savedCategory = await this.categoryRepository.save(
        this.categoryRepository.create({
          name: category.name,
          icon: category.icon,
          sortOrder: category.sortOrder,
          active: true,
        }),
      );

      for (const item of category.items) {
        await this.itemRepository.save(
          this.itemRepository.create({
            name: item.name,
            priceType: item.priceType,
            unitPrice: item.unitPrice,
            active: true,
            category: savedCategory,
          }),
        );
      }
    }
  }
}
