import { Field, Float, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Library } from "./Library";
import { Tag } from "./enum/Tag";
import { User } from "./User";
import { PersonalScore, ReadCheck, BookPosition } from "./BookRelations";

@ObjectType()
@Entity()
export class Book extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn("increment")
  id!: number;

  @Field()
  @Column()
  title!: string;

  @Field()
  @Column({ default: "" })
  author: string;

  @Field()
  @Column({ default: "" })
  publisher: string;

  @Field()
  @Column({ default: "" })
  thumbnail: string;

  @Field(() => Int, { nullable: true })
  @Column({ type: "int", nullable: true })
  pages: number;

  @Field()
  @Column({ default: "" })
  ISBN: string;

  @Field()
  @Column({ default: "" })
  description: string;

  @Field(() => [Tag], { nullable: true })
  @Column({ type: "enum", enum: [Tag], nullable: true })
  tag: Tag[];

  @OneToMany(() => PersonalScore, (personal_score) => personal_score.book)
  scoreRelation: PersonalScore[];

  @Field(() => Float)
  personalScore: number;

  @OneToMany(() => ReadCheck, (readCheck) => readCheck.book)
  readCheckRelation: ReadCheck[];

  @Field()
  read: boolean;

  @Field(() => BookPosition)
  @OneToOne(() => BookPosition)
  @JoinColumn()
  position: BookPosition;

  @Field()
  @Column({ default: "" })
  lang!: string;

  @ManyToOne(() => User, (user) => user.favorites)
  user: User;

  @ManyToOne(() => Library, (library) => library.books)
  library: Library;
}
