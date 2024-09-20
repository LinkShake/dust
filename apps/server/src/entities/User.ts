import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Field, ID, Int, ObjectType } from "type-graphql";
import { Library } from "./Library";
import { Book } from "./Book";

@ObjectType()
@Entity()
export class Stats extends BaseEntity {
  @PrimaryGeneratedColumn("increment")
  id!: number;

  @Field(() => Int)
  @Column({ type: "int", default: 0 })
  readBooks!: number;

  @Field(() => Int)
  @Column({ type: "int", default: 0 })
  unreadBooks!: number;

  @Field(() => Int)
  @Column({ type: "int", default: 0 })
  ownedLibraries!: number;

  @Field(() => Int)
  @Column({ type: "int", default: 0 })
  sharedLibraries!: number;

  @Field(() => Int)
  @Column({ type: "int", default: 0 })
  readPages!: number;

  @Field(() => Int)
  @Column({ type: "int", default: 0 })
  totalPages!: number;
}

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Field(() => ID)
  @Column({ unique: true })
  githubId!: string;

  @Field(() => [Library])
  @OneToMany(() => Library, (library) => library.user)
  library: Library;

  @Field(() => [Book])
  @OneToMany(() => Book, (book) => book.user)
  favorites: Book[];

  @Field(() => Stats)
  @OneToOne(() => Stats)
  @JoinColumn()
  stats: Stats;
}
