import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserPhoneLocale1782046801300 implements MigrationInterface {
  name = 'AddUserPhoneLocale1782046801300';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" ADD "phone" character varying`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "UQ_8e1f623798118e629b46a9e6299" UNIQUE ("phone")`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "locale" character varying`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8e1f623798118e629b46a9e629" ON "user" ("phone") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8e1f623798118e629b46a9e629"`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "locale"`);
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "UQ_8e1f623798118e629b46a9e6299"`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "phone"`);
  }
}
