import { gql, useMutation } from '@apollo/client'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { RecipeDTO, UpdateRecipeInput } from '../../shared/graphql'

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
`

export function RecipeMeta(props: { recipe: RecipeDTO }) {
  const { recipe } = props
  const { register, handleSubmit } = useForm({
    defaultValues: {
      servings: recipe.servings,
      prepTimeMin: recipe.prepTimeMin,
      cookTimeMin: recipe.cookTimeMin,
      totalTimeMin: recipe.totalTimeMin
    }
  })
  const [showInputs, setShowInputs] = useState(false)
  const [updateRecipe] = useMutation(UPDATE_RECIPE, {
    update(cache, { data: { updateRecipe } }) {
      if (!updateRecipe) return
      cache.modify({
        fields: {
          recipeBySlug(recipeBySlugRef) {
            cache.modify({
              id: recipeBySlugRef.__ref,
              fields: {
                prepTimeMin() {
                  return updateRecipe.prepTimeMin
                },
                cookTimeMin() {
                  return updateRecipe.cookTimeMin
                },
                totalTimeMin() {
                  return updateRecipe.totalTimeMin
                }
              }
            })
            return recipeBySlugRef
          }
        }
      })
    }
  }
  )

  function handleDoubleClick() {
    setShowInputs(true)
  }

  function handleCancel(e: any) {
    e.preventDefault()
    setShowInputs(false)
  }

  function handleOnSubmit(data: UpdateRecipeInput & { servings: string, prepTimeMin: string, cookTimeMin: string, totalTimeMin: string }) {
    setShowInputs(false)
    const updateRecipeInput: UpdateRecipeInput = {
      id: recipe.id,
      servings: parseInt(data.servings),
      prepTimeMin: parseInt(data.prepTimeMin),
      cookTimeMin: parseInt(data.cookTimeMin),
      totalTimeMin: parseInt(data.totalTimeMin)
    }
    updateRecipe({
      variables: { updateRecipeInput },
      optimisticResponse: {
        updateRecipe: {
          __typename: 'RecipeDTO',
          id: recipe.id,
          servings: updateRecipeInput.servings ?? '',
          prepTimeMin: updateRecipeInput.prepTimeMin ?? '',
          cookTimeMin: updateRecipeInput.cookTimeMin ?? '',
          totalTimeMin: updateRecipeInput.totalTimeMin ?? ''
        }
      }
    })
  }

  return <div className="bg-pink-400 p-4">
    <form onSubmit={handleSubmit(handleOnSubmit)}>
      <div className="grid grid-cols-4" onDoubleClick={handleDoubleClick}>
        <div>
          <h5 className="mb-0 text-white">
            <b hidden={showInputs}>{recipe.servings}</b>
            <input className="w-20 rounded-md border-gray-300 shadow-sm text-black" hidden={!showInputs} type="number" placeholder="Servings" {...register('servings')} />
            &nbsp;servings
          </h5>
        </div>
        <div>
          <h5 className="mb-0 text-white">Prep time:&nbsp;
            <b hidden={showInputs}>{recipe.prepTimeMin}</b>
            <input className="w-20 rounded-md border-gray-300 shadow-sm text-black" hidden={!showInputs} type="number" placeholder="Prep time" {...register('prepTimeMin')} />
            &nbsp;min
          </h5>
        </div>
        <div>
          <h5 className="mb-0 text-white">Cook time:&nbsp;
            <b hidden={showInputs}>{recipe.cookTimeMin}</b>
            <input className="w-20 rounded-md border-gray-300 shadow-sm text-black" hidden={!showInputs} type="number" placeholder="Cook time" {...register('cookTimeMin')} />
            &nbsp;min
          </h5>
        </div>
        <div>
          <h5 className="mb-0 text-white">Total time:&nbsp;
            <b hidden={showInputs}>{recipe.totalTimeMin}</b>
            <input className="w-20 rounded-md border-gray-300 shadow-sm text-black" hidden={!showInputs} type="number" placeholder="Total time" {...register('totalTimeMin')} />
            &nbsp;min
          </h5>
        </div>
      </div>
      <div className="mt-1">
        <button className="rounded-md shadow-lg bg-pink-300 p-2 text-white float-end fw-bold ml-2" hidden={!showInputs} onClick={handleCancel}>Cancel</button>
        <button className="rounded-md shadow-lg bg-pink-300 p-2 text-white float-end fw-bold" type="submit" hidden={!showInputs}>Update</button>
      </div>
    </form>
  </div>
}
