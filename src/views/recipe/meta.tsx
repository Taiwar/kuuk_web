import { gql, useMutation } from '@apollo/client';
import React from 'react';
import { useForm } from 'react-hook-form';
import { RecipeDTO, UpdateRecipeInput } from '../../shared/graphql';

const UPDATE_RECIPE = gql`
  mutation UpdateRecipe($updateRecipeInput: UpdateRecipeInput!) {
    updateRecipe(updateRecipeInput: $updateRecipeInput) {
      id
      slug
      servings
      prepTimeMin
      cookTimeMin
      totalTimeMin
    }
  }
`;

type RecipeMetaProps = { recipe: RecipeDTO; editable: boolean };

export function RecipeMeta(props: RecipeMetaProps): JSX.Element {
  const { recipe, editable } = props;
  const { register, handleSubmit } = useForm({
    defaultValues: {
      servings: recipe.servings,
      prepTimeMin: recipe.prepTimeMin ?? 0,
      cookTimeMin: recipe.cookTimeMin ?? 0,
      totalTimeMin: recipe.totalTimeMin ?? 0,
    },
  });
  const [updateRecipe] = useMutation(UPDATE_RECIPE, {
    update(cache, { data: { updateRecipe } }) {
      if (!updateRecipe) return;
      cache.modify({
        fields: {
          recipeBySlug(recipeBySlugRef) {
            cache.modify({
              id: recipeBySlugRef.__ref,
              fields: {
                prepTimeMin() {
                  return updateRecipe.prepTimeMin;
                },
                cookTimeMin() {
                  return updateRecipe.cookTimeMin;
                },
                totalTimeMin() {
                  return updateRecipe.totalTimeMin;
                },
              },
            });
            return recipeBySlugRef;
          },
        },
      });
    },
  });

  function handleOnSubmit(
    data: UpdateRecipeInput & {
      servings: string;
      prepTimeMin: string;
      cookTimeMin: string;
      totalTimeMin: string;
    },
  ) {
    const updateRecipeInput: UpdateRecipeInput = {
      id: recipe.id,
      servings: parseInt(data.servings),
      prepTimeMin: parseInt(data.prepTimeMin),
      cookTimeMin: parseInt(data.cookTimeMin),
      totalTimeMin: parseInt(data.totalTimeMin),
    };
    return updateRecipe({
      variables: { updateRecipeInput },
      optimisticResponse: {
        updateRecipe: {
          __typename: 'RecipeDTO',
          id: recipe.id,
          servings: updateRecipeInput.servings ?? '',
          prepTimeMin: updateRecipeInput.prepTimeMin ?? '',
          cookTimeMin: updateRecipeInput.cookTimeMin ?? '',
          totalTimeMin: updateRecipeInput.totalTimeMin ?? '',
        },
      },
    });
  }

  return (
    <div>
      <form onSubmit={handleSubmit(handleOnSubmit)}>
        <div className="grid grid-cols-4 gap-2 justify-items-center">
          <div>
            <h5 className="mb-0 text-white">
              <b hidden={editable}>{recipe.servings}</b>
              <input
                className="w-20 rounded-md border-gray-300 shadow-sm text-black"
                hidden={!editable}
                type="number"
                placeholder="Servings"
                {...register('servings')}
              />
              &nbsp;servings
            </h5>
          </div>
          <div>
            <h5 className="mb-0 text-white">
              Prep time:&nbsp;
              <b hidden={editable}>{recipe.prepTimeMin}</b>
              <input
                className="w-20 rounded-md border-gray-300 shadow-sm text-black"
                hidden={!editable}
                type="number"
                placeholder="Prep time"
                {...register('prepTimeMin')}
              />
              &nbsp;min
            </h5>
          </div>
          <div>
            <h5 className="mb-0 text-white">
              Cook time:&nbsp;
              <b hidden={editable}>{recipe.cookTimeMin}</b>
              <input
                className="w-20 rounded-md border-gray-300 shadow-sm text-black"
                hidden={!editable}
                type="number"
                placeholder="Cook time"
                {...register('cookTimeMin')}
              />
              &nbsp;min
            </h5>
          </div>
          <div>
            <h5 className="mb-0 text-white">
              Total time:&nbsp;
              <b hidden={editable}>{recipe.totalTimeMin}</b>
              <input
                className="w-20 rounded-md border-gray-300 shadow-sm text-black"
                hidden={!editable}
                type="number"
                placeholder="Total time"
                {...register('totalTimeMin')}
              />
              &nbsp;min
            </h5>
            <button
              className="rounded-md shadow-lg bg-pink-300 p-2 text-white fw-bold float-right mt-2"
              type="submit"
              hidden={!editable}
            >
              Update
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
