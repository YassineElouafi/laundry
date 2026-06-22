import { MigrationInterface, QueryRunner } from 'typeorm';

export class OrderDriverSlotsDelivery1782060000000
  implements MigrationInterface
{
  name = 'OrderDriverSlotsDelivery1782060000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."order_deliverytype_enum" AS ENUM('doorstep', 'concierge')`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" ADD "deliveryType" "public"."order_deliverytype_enum" NOT NULL DEFAULT 'doorstep'`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" ADD "deliveryFee" numeric(10,2) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(`ALTER TABLE "order" ADD "pickupSlotId" uuid`);
    await queryRunner.query(`ALTER TABLE "order" ADD "deliverySlotId" uuid`);
    await queryRunner.query(`ALTER TABLE "order" ADD "driverId" integer`);

    await queryRunner.query(
      `ALTER TABLE "order" ADD CONSTRAINT "FK_order_pickup_slot" FOREIGN KEY ("pickupSlotId") REFERENCES "time_slot"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" ADD CONSTRAINT "FK_order_delivery_slot" FOREIGN KEY ("deliverySlotId") REFERENCES "time_slot"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" ADD CONSTRAINT "FK_order_driver" FOREIGN KEY ("driverId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order" DROP CONSTRAINT "FK_order_driver"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" DROP CONSTRAINT "FK_order_delivery_slot"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" DROP CONSTRAINT "FK_order_pickup_slot"`,
    );
    await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "driverId"`);
    await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "deliverySlotId"`);
    await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "pickupSlotId"`);
    await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "deliveryFee"`);
    await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "deliveryType"`);
    await queryRunner.query(
      `DROP TYPE "public"."order_deliverytype_enum"`,
    );
  }
}
