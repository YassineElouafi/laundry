import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTimeSlot1782057044914 implements MigrationInterface {
  name = 'CreateTimeSlot1782057044914';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."time_slot_slottype_enum" AS ENUM('pickup', 'delivery')`,
    );
    await queryRunner.query(
      `CREATE TABLE "time_slot" ("active" boolean NOT NULL DEFAULT true, "slotType" "public"."time_slot_slottype_enum" NOT NULL, "booked" integer NOT NULL DEFAULT '0', "capacity" integer NOT NULL, "windowEnd" character varying NOT NULL, "windowStart" character varying NOT NULL, "date" date NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_03f782f8c4af029253f6ad5bacf" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_986ef13f7d164cbe3d4202bb1f" ON "time_slot" ("date", "slotType") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_986ef13f7d164cbe3d4202bb1f"`,
    );
    await queryRunner.query(`DROP TABLE "time_slot"`);
    await queryRunner.query(`DROP TYPE "public"."time_slot_slottype_enum"`);
  }
}
