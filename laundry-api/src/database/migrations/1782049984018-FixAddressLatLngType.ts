import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixAddressLatLngType1782049984018 implements MigrationInterface {
  name = 'FixAddressLatLngType1782049984018';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "address" DROP COLUMN "lng"`);
    await queryRunner.query(`ALTER TABLE "address" ADD "lng" double precision`);
    await queryRunner.query(`ALTER TABLE "address" DROP COLUMN "lat"`);
    await queryRunner.query(`ALTER TABLE "address" ADD "lat" double precision`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "address" DROP COLUMN "lat"`);
    await queryRunner.query(`ALTER TABLE "address" ADD "lat" integer`);
    await queryRunner.query(`ALTER TABLE "address" DROP COLUMN "lng"`);
    await queryRunner.query(`ALTER TABLE "address" ADD "lng" integer`);
  }
}
