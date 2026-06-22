import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCatalog1782053886762 implements MigrationInterface {
  name = 'CreateCatalog1782053886762';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "service_category" ("sortOrder" integer NOT NULL DEFAULT '0', "active" boolean NOT NULL DEFAULT true, "icon" character varying, "name" jsonb NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_9d513b39d251063f98f2a7b941d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."service_item_pricetype_enum" AS ENUM('per_kilo', 'per_item')`,
    );
    await queryRunner.query(
      `CREATE TABLE "service_item" ("active" boolean NOT NULL DEFAULT true, "unitPrice" numeric(10,2) NOT NULL, "priceType" "public"."service_item_pricetype_enum" NOT NULL, "name" jsonb NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "categoryId" uuid NOT NULL, CONSTRAINT "PK_4b061659545d9cc5d7c1f4805fc" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_item" ADD CONSTRAINT "FK_7b39c3641d80857832acfaf434d" FOREIGN KEY ("categoryId") REFERENCES "service_category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "service_item" DROP CONSTRAINT "FK_7b39c3641d80857832acfaf434d"`,
    );
    await queryRunner.query(`DROP TABLE "service_item"`);
    await queryRunner.query(`DROP TYPE "public"."service_item_pricetype_enum"`);
    await queryRunner.query(`DROP TABLE "service_category"`);
  }
}
