import { gql, useMutation } from '@apollo/client';
import React, { SyntheticEvent, useEffect, useRef, useState } from 'react';
import { Plus } from 'react-bootstrap-icons';
import { useForm } from 'react-hook-form';
import { RecipeDTO, UpdateRecipeInput } from '../../shared/graphql';

const UPDATE_RECIPE = gql`
  mutation UpdateRecipe($updateRecipeInput: UpdateRecipeInput!) {
    updateRecipe(updateRecipeInput: $updateRecipeInput) {
      id
      slug
      description
    }
  }
`;

export function RecipeDescription(props: { recipe: RecipeDTO }): JSX.Element {
  const { recipe } = props;
  const [showForm, setShowForm] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const { register, handleSubmit, setFocus } = useForm({
    defaultValues: {
      description: recipe.description ?? '',
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
                description() {
                  return updateRecipe.description;
                },
              },
            });
            return recipeBySlugRef;
          },
        },
      });
    },
  });

  function handleClickAdd() {
    setShowForm(true);
  }

  useEffect(() => {
    if (showForm) {
      setFocus('description');
    }
  }, [showForm]);

  function handleCancel(e: SyntheticEvent) {
    e.preventDefault();
    setShowForm(false);
  }

  function handleOnSubmit(data: UpdateRecipeInput) {
    const updateRecipeInput: UpdateRecipeInput = {
      id: recipe.id,
      description: data.description,
    };
    updateRecipe({
      variables: { updateRecipeInput },
      optimisticResponse: {
        updateRecipe: {
          __typename: 'RecipeDTO',
          id: recipe.id,
          description: updateRecipeInput.description ?? '',
        },
      },
    }).then(() => setShowForm(false));
  }

  return (
    <div>
      <div className="flex">
        <h4 className="flex text-2xl my-3">Description</h4>
        <div
          hidden={showForm || recipe.description !== null}
          className="ml-2 mt-3"
        >
          <button
            className="rounded-full p-1 shadow bg-pink-400 text-white"
            onClick={handleClickAdd}
          >
            <Plus size={24} />
          </button>
        </div>
      </div>
      <div
        className="mb-4"
        hidden={showForm}
        onDoubleClick={() => setShowForm(true)}
      >
        <p>{recipe.description}</p>
      </div>
      <form
        ref={formRef}
        hidden={!showForm}
        onSubmit={handleSubmit(handleOnSubmit)}
      >
        <div className="grid grid-cols-4 gap-1 lg:w-1/2">
          <div className="col-span-3">
            <textarea
              required
              className="block w-full rounded-md border-gray-300 shadow-sm"
              placeholder="Description*"
              {...register('description')}
            />
          </div>
          <div className="col-span-1">
            <button
              className="rounded-md shadow-lg bg-pink-300 p-2 text-white fw-bold"
              type="submit"
            >
              Update
            </button>
            <button
              className="rounded-md shadow-lg bg-pink-100 p-2 text-gray-600 fw-bold ml-2"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
