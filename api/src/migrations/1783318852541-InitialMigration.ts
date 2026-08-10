import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1783318852541 implements MigrationInterface {
    name = 'InitialMigration1783318852541'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "transcription"`);
        await queryRunner.query(`ALTER TABLE "transcription" ADD "project_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "transcription" ADD CONSTRAINT "FK_4e1097699627846d39803231024" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transcription" DROP CONSTRAINT "FK_4e1097699627846d39803231024"`);
        await queryRunner.query(`ALTER TABLE "transcription" DROP COLUMN "project_id"`);
    }

}
