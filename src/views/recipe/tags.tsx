import { gql, useMutation } from '@apollo/client';
import React, { useRef, useState } from 'react';
import { CancelButton } from '../../components/buttons/cancel-button';
import { SubmitButton } from '../../components/buttons/submit-button';
import { RecipeTag } from '../../components/recipes/recipe-tag';
import { RecipeDTO, UpdateRecipeInput } from '../../shared/graphql';

const UPDATE_RECIPE = gql`
  mutation UpdateRecipe($updateRecipeInput: UpdateRecipeInput!) {
    updateRecipe(updateRecipeInput: $updateRecipeInput) {
      id
      slug
      tags
    }
  }
`;

type RecipeTagsProps = {
  recipe: RecipeDTO;
  editable: boolean;
};

export function RecipeTags(props: RecipeTagsProps): JSX.Element {
  const { recipe, editable } = props;
  const inputRef = useRef<HTMLInputElement>(null);
  const [newTag, setNewTag] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [updateRecipe] = useMutation(UPDATE_RECIPE, {
    update(cache, { data: { updateRecipe } }) {
      if (!updateRecipe) return;
      cache.modify({
        fields: {
          recipeBySlug(recipeBySlugRef) {
            cache.modify({
              id: recipeBySlugRef.__ref,
              fields: {
                tags() {
                  return updateRecipe.tags;
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

  function handleClickRemove(tag: string) {
    const updateRecipeInput: UpdateRecipeInput = {
      id: recipe.id,
      tags: recipe.tags.filter((t) => t !== tag),
    };
    updateRecipe({
      variables: { updateRecipeInput },
      optimisticResponse: {
        updateRecipe: {
          __typename: 'RecipeDTO',
          id: recipe.id,
          tags: updateRecipeInput.tags,
        },
      },
    });
  }

  function handleCancel() {
    setShowForm(false);
  }

  function handleAddTag(tag: string) {
    const updateRecipeInput: UpdateRecipeInput = {
      id: recipe.id,
      tags: [...recipe.tags, tag],
    };
    updateRecipe({
      variables: { updateRecipeInput },
      optimisticResponse: {
        updateRecipe: {
          __typename: 'RecipeDTO',
          id: recipe.id,
          tags: updateRecipeInput.tags,
        },
      },
    }).then(() => setNewTag(''));
  }

  function handleSubmit() {
    if (newTag) {
      handleAddTag(newTag);
    }
  }

  return (
    <div className="mt-2 flex justify-center">
      <div className="flex justify-center">
        {recipe.tags.map((tag, i) => (
          <RecipeTag
            key={i}
            tag={tag}
            onRemove={handleClickRemove}
            editable={editable}
          />
        ))}
        <span
          className={`${
            editable && !showForm ? '' : 'hidden'
          } bg-gray-100 hover:bg-gray-200 rounded-full px-2 font-bold text-sm leading-loose cursor-pointer py-1`}
          onClick={handleClickAdd}
        >
          + Add tag
        </span>
      </div>
      <div className={`flex gap-2 ${showForm ? '' : 'hidden'}`}>
        <input
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          ref={inputRef}
          type="text"
          required
          className="flex-initial rounded-md border-gray-300 shadow-sm"
          placeholder="Tag name*"
          onKeyPress={(e) => (e.key === 'Enter' ? handleSubmit() : null)}
        />
        <div className="flex-initial ml-1">
          <SubmitButton size={8} />
        </div>
        <div className="flex-initial">
          <CancelButton onClick={handleCancel} />
        </div>
      </div>
    </div>
  );
}
