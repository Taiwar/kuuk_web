import React from 'react';
import { Link } from 'react-router-dom';
import { RecipeDTO } from '../shared/graphql';
import { RecipeTag } from './recipe-tag';

type RecipeCardProps = { recipe: RecipeDTO };

export function RecipeCard(props: RecipeCardProps): JSX.Element {
  const { recipe } = props;

  return (
    <div>
      <Link to={`/recipe/${recipe.slug}`}>
        <div className="py-8 px-8 bg-white shadow rounded-lg hover:shadow-lg transition-shadow">
          <div>
            <h2 className="text-gray-800 text-3xl font-semibold">
              {recipe.name}
            </h2>
            <h3>{recipe.servings} servings</h3>
          </div>
          <div className="flex flex-wrap justify-center">
            {recipe.tags.map((tag, i) => (
              <RecipeTag
                key={i}
                tag={tag}
                onRemove={() => null}
                editable={false}
              />
            ))}
          </div>
        </div>
      </Link>
    </div>
  );
}
