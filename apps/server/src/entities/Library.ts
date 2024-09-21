import { Field, ID, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Book } from "./Book";
import { User } from "./User";

@ObjectType()
@Entity()
export class Library extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Field(() => ID)
  @Column("uuid")
  ownerId!: string;

  @Field(() => [ID])
  @Column({ type: "simple-array", default: [] })
  sharesId!: string[];

  @Field()
  @Column({ default: false })
  shared!: boolean;

  @Field(() => Book)
  @OneToMany(() => Book, (book) => book.library)
  books!: Book[];

  @Field()
  @Column()
  name!: string;

  @ManyToOne(() => User, (user) => user.libraries)
  user: User;
}
