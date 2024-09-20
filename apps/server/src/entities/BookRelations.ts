import { ObjectType, Field, Float, ID, Int } from "type-graphql";
import {
  Entity,
  Unique,
  BaseEntity,
  Column,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Book } from "./Book";

@ObjectType()
@Entity()
@Unique(["userId", "book"])
export class PersonalScore extends BaseEntity {
  @PrimaryGeneratedColumn("increment")
  id!: number;

  @Field((_) => Float)
  @Column({ type: "float", default: 0.0 })
  rating!: number;

  @Field((_) => ID)
  @Column("uuid")
  userId!: string;

  @ManyToOne(() => Book, (book) => book.scoreRelation)
  book: Book;
}

@ObjectType()
@Entity()
@Unique(["userId", "book"])
export class ReadCheck extends BaseEntity {
  @PrimaryGeneratedColumn("increment")
  id!: number;

  @Field()
  @Column({ default: false })
  read!: boolean;

  @Field(() => ID)
  @Column("uuid")
  userId!: string;

  @ManyToOne(() => Book, (book) => book.readCheckRelation)
  book: Book;
}

@ObjectType()
@Entity()
export class BookPosition extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn("increment")
  id!: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  libraryName: string;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  libraryNumber: number;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  shelf: number;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  row: number;
}
