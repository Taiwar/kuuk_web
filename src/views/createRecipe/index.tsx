import { gql, useMutation } from '@apollo/client'
import React from 'react'
import { useHistory } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { TopBar } from '../../components/top-bar'
import { CreateRecipeInput } from '../../shared/graphql'

const CREATE_RECIPE = gql`
    mutation CreateRecipe($createRecipeInput: CreateRecipeInput!) {
        createRecipe(createRecipeInput: $createRecipeInput) {
            id
            name
            servings
        }
    }
`

export function CreateRecipe() {
  const history = useHistory()
  const { register, handleSubmit } = useForm()
  const [createRecipe] = useMutation(CREATE_RECIPE, {
    update(cache, { data: { createRecipe } }) {
      cache.modify({
        fields: {
          recipes(existingRecipes = []) {
            const newRecipeRef = cache.writeFragment({
              data: createRecipe,
              fragment: gql`
                            fragment NewRecipe on RecipeDTO {
                                id
                                name
                                servings
                            }
                        `
            })
            return [...existingRecipes, newRecipeRef]
          }
        }
      })
    }
  })

  function onSubmit(data: CreateRecipeInput & { servings: string }) {
    console.log('submitting', data)
    const createRecipeInput: CreateRecipeInput = {
      name: data.name,
      servings: parseInt(data.servings)
    }
    createRecipe({
      variables: { createRecipeInput },
      optimisticResponse: {
        addIngredient: {
          __typename: 'RecipeDTO',
          id: 'temp-id',
          name: createRecipeInput.name,
          servings: createRecipeInput.servings
        }
      }
    }).then(() => {
      history.push('/')
    })
  }

  return <div>
    <TopBar />
    <div className="container p-4">
      <div className="shadow rounded-lg p-8 bg-white">
        <form onSubmit={handleSubmit(onSubmit)}>
          <h2 className="text-2xl mb-4">Create a new recipe</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <input className="block w-full rounded-md border-gray-300 shadow-sm" type="text" placeholder="Name" {...register('name')} />
            </div>
            <div className="col-span-2">
              <input className="block w-full rounded-md border-gray-300 shadow-sm" type="number" placeholder="Servings" {...register('servings')} />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button className="rounded p-1.5 shadow bg-pink-400 text-white" type="submit">
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
}
