import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTechnology1783346269647 implements MigrationInterface {
    name = 'CreateTechnology1783346269647'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "technology" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_0e93116dd895bf20badb82d3ed6" UNIQUE ("name"), CONSTRAINT "PK_89f217a9ebf9b4bc1a0d74883ec" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "technology"`);
    }

}
