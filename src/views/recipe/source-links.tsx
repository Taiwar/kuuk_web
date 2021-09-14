import { gql, useMutation } from '@apollo/client';
import React, { SyntheticEvent, useRef, useState } from 'react';
import { AddButton } from '../../components/buttons/add-button';
import { CancelButton } from '../../components/buttons/cancel-button';
import { DeleteButton } from '../../components/buttons/delete-button';
import { EditButton } from '../../components/buttons/edit-button';
import { RecipeDTO, UpdateRecipeInput } from '../../shared/graphql';

const UPDATE_RECIPE = gql`
  mutation UpdateRecipe($updateRecipeInput: UpdateRecipeInput!) {
    updateRecipe(updateRecipeInput: $updateRecipeInput) {
      id
      slug
      sourceLinks
    }
  }
`;

type RecipeSourceLinksProps = { recipe: RecipeDTO };

export function RecipeSourceLinks(props: RecipeSourceLinksProps): JSX.Element {
  const { recipe } = props;
  const inputRef = useRef<HTMLInputElement>(null);
  const [editable, setEditable] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newSourceLink, setNewSourceLink] = useState('');
  const [updateRecipe] = useMutation(UPDATE_RECIPE, {
    update(cache, { data: { updateRecipe } }) {
      if (!updateRecipe) return;
      cache.modify({
        fields: {
          recipeBySlug(recipeBySlugRef) {
            cache.modify({
              id: recipeBySlugRef.__ref,
              fields: {
                sourceLinks() {
                  return updateRecipe.sourceLinks;
                },
              },
            });
            return recipeBySlugRef;
          },
        },
      });
    },
  });

  function handleCancel(e: SyntheticEvent) {
    e.preventDefault();
    setShowForm(false);
  }

  function handleClickAdd() {
    setShowForm(true);
  }

  function handleClickRemove(sourceLink: string) {
    const updateRecipeInput: UpdateRecipeInput = {
      id: recipe.id,
      sourceLinks: recipe.sourceLinks.filter((s) => s !== sourceLink),
    };
    return updateRecipe({
      variables: { updateRecipeInput },
      optimisticResponse: {
        updateRecipe: {
          __typename: 'RecipeDTO',
          id: recipe.id,
          sourceLinks: updateRecipeInput.sourceLinks,
        },
      },
    });
  }

  function handleAddSourceLink(sourceLink: string) {
    const updateRecipeInput: UpdateRecipeInput = {
      id: recipe.id,
      sourceLinks: [...recipe.sourceLinks, sourceLink],
    };
    updateRecipe({
      variables: { updateRecipeInput },
      optimisticResponse: {
        updateRecipe: {
          __typename: 'RecipeDTO',
          id: recipe.id,
          sourceLinks: updateRecipeInput.sourceLinks ?? [],
        },
      },
    }).then(() => {
      setShowForm(false);
      setNewSourceLink('');
    });
  }

  function handleSubmit() {
    if (newSourceLink) {
      handleAddSourceLink(newSourceLink);
    }
  }

  function handleClickEdit() {
    setEditable(!editable);
  }

  return (
    <div>
      <div className="flex">
        <h4 className="flex text-xl my-3">{`Source${
          recipe.sourceLinks.length === 1 ? '' : 's'
        }`}</h4>
        <div hidden={showForm} className="flex ml-2 mt-3 justify-center">
          <AddButton onClick={handleClickAdd} />
          <EditButton
            className="ml-1"
            editable={editable}
            onClick={handleClickEdit}
          />
        </div>
      </div>
      <div className="mb-4">
        {recipe.sourceLinks.map((sourceLink, i) => (
          <div key={i} className="flex mt-1">
            <span
              className={`inline-block bg-pink-400 rounded-full mb-1 mr-2 w-3 h-3 my-auto ${
                editable ? 'hidden' : ''
              }`}
            />
            <DeleteButton
              hidden={!editable}
              className="ml-1"
              onClick={() => handleClickRemove(sourceLink)}
            />
            <a className="col-span-6 inline ml-1" href={sourceLink}>
              {sourceLink}
            </a>
          </div>
        ))}
      </div>
      <div className={`flex lg:w-1/2 ${showForm ? '' : 'hidden'}`}>
        <div className="flex-1">
          <input
            value={newSourceLink}
            onChange={(e) => setNewSourceLink(e.target.value)}
            ref={inputRef}
            required
            className="block w-full rounded-md border-gray-300 shadow-sm"
            type="text"
            placeholder="Source*"
            onKeyPress={(e) => (e.key === 'Enter' ? handleSubmit() : null)}
          />
        </div>
        <div className="flex-initial ml-1 mt-1">
          <AddButton onClick={handleSubmit} />
        </div>
        <div className="flex-initial mt-1">
          <CancelButton className="ml-1" onClick={handleCancel} />
        </div>
      </div>
    </div>
  );
}
