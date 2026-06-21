import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOrders1782056382204 implements MigrationInterface {
  name = 'CreateOrders1782056382204';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "order_item" ("lineTotal" numeric(10,2) NOT NULL DEFAULT '0', "unitPrice" numeric(10,2) NOT NULL DEFAULT '0', "quantity" numeric(10,3) NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "serviceItemId" uuid NOT NULL, "orderId" uuid NOT NULL, CONSTRAINT "PK_d01158fe15b1ead5c26fd7f4e90" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."order_event_status_enum" AS ENUM('scheduled', 'driver_assigned', 'picked_up', 'at_facility', 'in_cleaning', 'ready', 'out_for_delivery', 'delivered', 'cancelled')`,
    );
    await queryRunner.query(
      `CREATE TABLE "order_event" ("note" character varying, "status" "public"."order_event_status_enum" NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "orderId" uuid NOT NULL, CONSTRAINT "PK_394b0d7613180ebee9028e9aaa1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."order_paymentmethod_enum" AS ENUM('cod', 'cmi')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."order_status_enum" AS ENUM('scheduled', 'driver_assigned', 'picked_up', 'at_facility', 'in_cleaning', 'ready', 'out_for_delivery', 'delivered', 'cancelled')`,
    );
    await queryRunner.query(
      `CREATE TABLE "order" ("notes" character varying, "total" numeric(10,2) NOT NULL DEFAULT '0', "subtotal" numeric(10,2) NOT NULL DEFAULT '0', "paymentMethod" "public"."order_paymentmethod_enum" NOT NULL, "status" "public"."order_status_enum" NOT NULL DEFAULT 'scheduled', "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deliveryAddressId" uuid NOT NULL, "pickupAddressId" uuid NOT NULL, "userId" integer NOT NULL, CONSTRAINT "PK_1031171c13130102495201e3e20" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item" ADD CONSTRAINT "FK_ecf8d788056eb01b3902b639fd0" FOREIGN KEY ("serviceItemId") REFERENCES "service_item"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item" ADD CONSTRAINT "FK_646bf9ece6f45dbe41c203e06e0" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_event" ADD CONSTRAINT "FK_c7692d881f326d48552256e4f57" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" ADD CONSTRAINT "FK_08fcc4e8c5af1570909f08f5029" FOREIGN KEY ("deliveryAddressId") REFERENCES "address"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" ADD CONSTRAINT "FK_e4ea4e7f610af08341c151e38d5" FOREIGN KEY ("pickupAddressId") REFERENCES "address"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" ADD CONSTRAINT "FK_caabe91507b3379c7ba73637b84" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order" DROP CONSTRAINT "FK_caabe91507b3379c7ba73637b84"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" DROP CONSTRAINT "FK_e4ea4e7f610af08341c151e38d5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" DROP CONSTRAINT "FK_08fcc4e8c5af1570909f08f5029"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_event" DROP CONSTRAINT "FK_c7692d881f326d48552256e4f57"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item" DROP CONSTRAINT "FK_646bf9ece6f45dbe41c203e06e0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item" DROP CONSTRAINT "FK_ecf8d788056eb01b3902b639fd0"`,
    );
    await queryRunner.query(`DROP TABLE "order"`);
    await queryRunner.query(`DROP TYPE "public"."order_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."order_paymentmethod_enum"`);
    await queryRunner.query(`DROP TABLE "order_event"`);
    await queryRunner.query(`DROP TYPE "public"."order_event_status_enum"`);
    await queryRunner.query(`DROP TABLE "order_item"`);
  }
}
