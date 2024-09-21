import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1726931263631 implements MigrationInterface {
    name = 'Initial1726931263631'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "stats" ("id" SERIAL NOT NULL, "readBooks" integer NOT NULL DEFAULT '0', "unreadBooks" integer NOT NULL DEFAULT '0', "ownedLibraries" integer NOT NULL DEFAULT '0', "sharedLibraries" integer NOT NULL DEFAULT '0', "readPages" integer NOT NULL DEFAULT '0', "totalPages" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_c76e93dfef28ba9b6942f578ab1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "githubId" character varying NOT NULL, "statsId" integer, CONSTRAINT "UQ_0d84cc6a830f0e4ebbfcd6381dd" UNIQUE ("githubId"), CONSTRAINT "REL_79bb3ba7b87fbfdf3772c96fd8" UNIQUE ("statsId"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "library" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "ownerId" uuid NOT NULL, "sharesId" text NOT NULL DEFAULT '[]', "shared" boolean NOT NULL DEFAULT false, "name" character varying NOT NULL, "userId" uuid, CONSTRAINT "PK_3a61ae2e897d9b5a59a64e91aa4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "personal_score" ("id" SERIAL NOT NULL, "rating" double precision NOT NULL DEFAULT '0', "userId" uuid NOT NULL, "bookId" integer, CONSTRAINT "UQ_ecc09663c44860369cfdfe68399" UNIQUE ("userId", "bookId"), CONSTRAINT "PK_e11ce88eb386605681f6c08d6d5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "read_check" ("id" SERIAL NOT NULL, "read" boolean NOT NULL DEFAULT false, "userId" uuid NOT NULL, "bookId" integer, CONSTRAINT "UQ_c2b72862e5736e8b6a3800be32b" UNIQUE ("userId", "bookId"), CONSTRAINT "PK_258ba2c369086bd8731be01e78b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "book_position" ("id" SERIAL NOT NULL, "libraryName" character varying, "libraryNumber" integer, "shelf" integer, "row" integer, CONSTRAINT "PK_765bbf01213ce3f90e5590c3306" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."book_tag_enum" AS ENUM('[object Object]')`);
        await queryRunner.query(`CREATE TABLE "book" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "author" character varying NOT NULL DEFAULT '', "publisher" character varying NOT NULL DEFAULT '', "thumbnail" character varying NOT NULL DEFAULT '', "pages" integer, "ISBN" character varying NOT NULL DEFAULT '', "description" character varying NOT NULL DEFAULT '', "tag" "public"."book_tag_enum", "lang" character varying NOT NULL DEFAULT '', "positionId" integer, "userId" uuid, "libraryId" uuid, CONSTRAINT "REL_5c2bf7a68d9f2843aba90dfcc4" UNIQUE ("positionId"), CONSTRAINT "PK_a3afef72ec8f80e6e5c310b28a4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_79bb3ba7b87fbfdf3772c96fd87" FOREIGN KEY ("statsId") REFERENCES "stats"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "library" ADD CONSTRAINT "FK_60959da3c7fbc7f148fcbcbc9ea" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "personal_score" ADD CONSTRAINT "FK_18911d5e53f13bf3e26f76bcad6" FOREIGN KEY ("bookId") REFERENCES "book"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "read_check" ADD CONSTRAINT "FK_5e58136eb2f2717afb24ab6b5b0" FOREIGN KEY ("bookId") REFERENCES "book"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "book" ADD CONSTRAINT "FK_5c2bf7a68d9f2843aba90dfcc40" FOREIGN KEY ("positionId") REFERENCES "book_position"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "book" ADD CONSTRAINT "FK_04f66cf2a34f8efc5dcd9803693" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "book" ADD CONSTRAINT "FK_da052b08a5b50d4601bb0f15ac0" FOREIGN KEY ("libraryId") REFERENCES "library"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "book" DROP CONSTRAINT "FK_da052b08a5b50d4601bb0f15ac0"`);
        await queryRunner.query(`ALTER TABLE "book" DROP CONSTRAINT "FK_04f66cf2a34f8efc5dcd9803693"`);
        await queryRunner.query(`ALTER TABLE "book" DROP CONSTRAINT "FK_5c2bf7a68d9f2843aba90dfcc40"`);
        await queryRunner.query(`ALTER TABLE "read_check" DROP CONSTRAINT "FK_5e58136eb2f2717afb24ab6b5b0"`);
        await queryRunner.query(`ALTER TABLE "personal_score" DROP CONSTRAINT "FK_18911d5e53f13bf3e26f76bcad6"`);
        await queryRunner.query(`ALTER TABLE "library" DROP CONSTRAINT "FK_60959da3c7fbc7f148fcbcbc9ea"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_79bb3ba7b87fbfdf3772c96fd87"`);
        await queryRunner.query(`DROP TABLE "book"`);
        await queryRunner.query(`DROP TYPE "public"."book_tag_enum"`);
        await queryRunner.query(`DROP TABLE "book_position"`);
        await queryRunner.query(`DROP TABLE "read_check"`);
        await queryRunner.query(`DROP TABLE "personal_score"`);
        await queryRunner.query(`DROP TABLE "library"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "stats"`);
    }

}
