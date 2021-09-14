import React, { useState } from 'react';
import { gql, useQuery } from '@apollo/client';
import { Pencil, PencilFill } from 'react-bootstrap-icons';
import { useParams } from 'react-router-dom';
import { LoadingSpinner } from '../../components/loading-spinner';
import { TopBar } from '../../components/top-bar';
import { RecipeDTO } from '../../shared/graphql';
import { RecipeDescription } from './description';
import { RecipeIngredients } from './ingredients';
import { RecipeMeta } from './meta';
import { RecipeNotes } from './notes';
import { RecipeRating } from './rating';
import { RecipeSourceLinks } from './source-links';
import { RecipeSteps } from './steps';
import { RecipeTags } from './tags';

const FETCH_RECIPE = gql`
  query getRecipeBySlug($slug: String!) {
    recipeBySlug(slug: $slug) {
      id
      name
      slug
      author
      prepTimeMin
      cookTimeMin
      totalTimeMin
      servings
      rating
      description
      sourceLinks
      tags
      pictures
      ingredients {
        id
        recipeID
        sortNr
        name
        itemType
        items {
          __typename
          ... on IngredientDTO {
            id
            sortNr
            name
            amount
            unit
          }
        }
      }
      steps {
        id
        recipeID
        sortNr
        name
        itemType
        items {
          __typename
          ... on StepDTO {
            id
            sortNr
            name
            description
            picture
          }
        }
      }
      notes {
        id
        recipeID
        sortNr
        name
        itemType
        items {
          __typename
          ... on NoteDTO {
            id
            sortNr
            name
            description
          }
        }
      }
    }
  }
`;

export function RecipePage(): JSX.Element {
  const { slug } = useParams() as { slug: string };
  const [heroEditable, setHeroEditable] = useState(false);
  const { loading, error, data } = useQuery(FETCH_RECIPE, {
    variables: { slug },
    pollInterval: 20000,
  });

  if (loading) return <LoadingSpinner />;
  if (error) {
    return <p>Error {error.toString()}</p>;
  }

  const recipe = data.recipeBySlug as RecipeDTO;

  function handleClickHeroEdit() {
    setHeroEditable(!heroEditable);
  }

  return (
    <div>
      <TopBar />
      <div className="mx-4">
        <div className="shadow rounded">
          <div className="bg-pink-300 p-4 rounded-t-lg">
            <h2 className="mb-0 text-white font-bold text-3xl">
              {recipe.name}
            </h2>
            <RecipeRating size="3xl" recipe={recipe} />
          </div>
          <div className="bg-pink-400 p-4">
            <RecipeMeta recipe={recipe} editable={heroEditable} />
            <RecipeTags recipe={recipe} editable={heroEditable} />
            <button
              className="block rounded-full p-2 shadow bg-pink-300 text-white ml-1 hover:shadow-lg float-right"
              onClick={handleClickHeroEdit}
            >
              {heroEditable ? <Pencil size={24} /> : <PencilFill size={24} />}
            </button>
          </div>
          <div className="bg-white px-8 py-4 rounded-b-lg">
            <RecipeDescription recipe={recipe} />
            <RecipeIngredients
              recipeId={recipe.id}
              ingredientGroups={recipe.ingredients || []}
            />
            <RecipeSteps recipeId={recipe.id} stepGroups={recipe.steps || []} />
            <RecipeNotes recipeId={recipe.id} noteGroups={recipe.notes || []} />
            <RecipeSourceLinks recipe={recipe} />
          </div>
        </div>
      </div>
    </div>
  );
}
