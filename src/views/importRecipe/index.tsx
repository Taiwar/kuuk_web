import { gql, useMutation } from '@apollo/client';
import React from 'react';
import { useHistory } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { SubmitButton } from '../../components/buttons/submit-button';
import { TopBar } from '../../components/top-bar';

const IMPORT_RECIPE = gql`
  mutation ImportRecipe($url: String!) {
    importRecipe(url: $url) {
      id
      name
      servings
      slug
    }
  }
`;

export function ImportRecipe(): JSX.Element {
  const history = useHistory();
  const { register, handleSubmit } = useForm();
  const [importRecipe, result] = useMutation(IMPORT_RECIPE, {
    update(cache, { data: { importRecipe } }) {
      cache.modify({
        fields: {
          recipes(existingRecipes = []) {
            const newRecipeRef = cache.writeFragment({
              data: importRecipe,
              fragment: gql`
                fragment NewRecipe on RecipeDTO {
                  id
                  name
                  servings
                  slug
                }
              `,
            });
            return [...existingRecipes, newRecipeRef];
          },
        },
      });
    },
  });

  console.log('result', result);

  function onSubmit(data: { url: string }) {
    const url = data.url;
    importRecipe({
      variables: { url },
    }).then(() => {
      history.push('/');
    });
  }

  return (
    <div>
      <TopBar />
      <div className="container p-4">
        <div className="shadow rounded-lg p-8 bg-white">
          <form onSubmit={handleSubmit(onSubmit)}>
            <h2 className="text-2xl mb-4">Import a new recipe</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <input
                  className="block w-full rounded-md border-gray-300 shadow-sm"
                  type="text"
                  placeholder="Url"
                  {...register('url')}
                />
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <SubmitButton size={8} />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
