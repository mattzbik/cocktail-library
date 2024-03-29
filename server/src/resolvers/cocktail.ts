import {
  Arg,
  Field,
  FieldResolver,
  Int,
  ObjectType,
  Query,
  Resolver,
  Root,
} from 'type-graphql';
import { postgresDataSource } from '../data-source';
import { Cocktail } from '../entities/Cocktail';
import { Glass } from '../entities/Glass';
import { Ingredient } from '../entities/Ingredient';
import { ingredientLoader } from '../utils/cocktailIngredientLoader';
import { createGlassLoader } from '../utils/glassLoader';
import { userLoader } from '../utils/userLoader';

@ObjectType()
class PaginatedCocktails {
  @Field(() => [Cocktail])
  cocktails: Cocktail[];
  @Field()
  hasMore: boolean;
}

@Resolver(Cocktail)
export class CocktailResolver {
  @FieldResolver(() => Glass)
  async glass(@Root() cocktail: Cocktail) {
    return createGlassLoader().load(cocktail.glassId);
  }

  @FieldResolver(() => [Ingredient])
  async ingredients(@Root() cocktail: Cocktail) {
    return await ingredientLoader().load(cocktail.id);
  }

  @FieldResolver(() => [Ingredient])
  async creator(@Root() cocktail: Cocktail) {
    return await userLoader().load(cocktail.creatorId);
  }

  @Query(() => PaginatedCocktails)
  async cocktails(
    @Arg('limit', () => Int) limit: number,
    @Arg('cursor', () => String, { nullable: true }) cursor: string | null
  ): Promise<PaginatedCocktails> {
    const realLimit = Math.min(50, limit);
    const realLimitPlusOne = Math.min(50, limit) + 1;

    const replacements: (number | Date)[] = [realLimitPlusOne];

    if (cursor) {
      replacements.push(new Date(parseInt(cursor)));
    }

    const cocktails = await postgresDataSource.query(
      `
        select c.*
        from cocktail c
        ${cursor ? 'where c."createdAt" < $2' : ''}
        order by c."createdAt" DESC
        limit $1
      `,
      replacements
    );

    return {
      cocktails: cocktails.slice(0, realLimit),
      hasMore: cocktails.length === realLimitPlusOne,
    };
  }

  @Query(() => Cocktail, { nullable: true })
  async cocktail(@Arg('id') id: string): Promise<Cocktail | null> {
    return await Cocktail.findOne({ where: { id } });
  }
}
