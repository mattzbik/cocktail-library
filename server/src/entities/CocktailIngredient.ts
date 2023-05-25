import { Field, ObjectType } from 'type-graphql';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Cocktail } from './Cocktail';
import { Ingredient } from './Ingredient';

@ObjectType()
@Entity()
export class CocktailIngredient extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => Cocktail)
  @ManyToOne(() => Cocktail)
  cocktail: Cocktail;

  @Field({ description: 'Ingredient' })
  @ManyToOne(() => Ingredient)
  ingredient: Ingredient;

  @Field({ description: 'Quantity of ingredient' })
  @Column()
  quantity: number;

  @Field({ description: 'Measurement of ingredient' })
  @Column()
  measure: string;

  @Field(() => String)
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
