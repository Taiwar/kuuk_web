import { gql, useMutation } from '@apollo/client'
import React from 'react'
import { Plus } from 'react-bootstrap-icons'
import { useForm } from 'react-hook-form'
import { AddIngredientInput, IngredientDTO } from '../../shared/graphql'

const ADD_INGREDIENT = gql`
    mutation AddIngredient($addIngredientInput: AddIngredientInput!) {
        addIngredient(addIngredientInput: $addIngredientInput) {
            id
            name
            amount
            unit
        }
    }
`

export function RecipeIngredients(props: { recipeId: string, ingredients: IngredientDTO[] }) {
  const { register, handleSubmit } = useForm()
  const [addIngredient] = useMutation(ADD_INGREDIENT, {
    update(cache, { data: { addIngredient } }) {
      cache.modify({
        fields: {
          recipeBySlug(recipeBySlugRef) {
            cache.modify({
              id: recipeBySlugRef.__ref,
              fields: {
                ingredients(existingIngredients = []) {
                  const newIngredientRef = cache.writeFragment({
                    data: addIngredient,
                    fragment: gql`
                                            fragment NewIngredient on IngredientDTO {
                                                id
                                                name
                                                amount
                                                unit
                                            }
                                        `
                  })
                  return [...existingIngredients, newIngredientRef]
                }
              }
            })
            return recipeBySlugRef
          }
        }
      })
    }
  })

  function onAddIngredientSubmit(data: AddIngredientInput & { amount: string }) {
    console.log('submitting', data)
    const addIngredientInput: AddIngredientInput = {
      recipeID: props.recipeId,
      name: data.name,
      amount: parseFloat(data.amount),
      unit: data.unit
    }
    addIngredient({
      variables: { addIngredientInput },
      optimisticResponse: {
        addIngredient: {
          __typename: 'IngredientDTO',
          id: 'temp-id',
          name: data.name,
          amount: parseFloat(data.amount),
          unit: data.unit
        }
      }
    })
  }

  return <div className="p-4">
    <h4 className="mb-3">Ingredients</h4>
    <div className="mb-4">
      {
        props.ingredients?.map((ingredient: IngredientDTO) => {
          return <div key={ingredient.id} className="flex">
            <input className="mx-2" type="checkbox" />
            <span className="flex-1"><b className="mr-1">{ingredient.amount} {ingredient.unit}</b> {ingredient.name}</span>
          </div>
        })
      }
    </div>
    <form onSubmit={handleSubmit(onAddIngredientSubmit)}>
      <div className="grid grid-cols-7 gap-1 lg:w-1/2">
        <div className="col-span-2">
          <input className="block w-full rounded-md border-gray-300 shadow-sm" type="number" placeholder="Amount" {...register('amount')} />
        </div>
        <div className="col-span-1">
          <input className="block w-full rounded-md border-gray-300 shadow-sm" type="text" placeholder="Unit" {...register('unit')}/>
        </div>
        <div className="col-span-3">
          <input className="block w-full rounded-md border-gray-300 shadow-sm" type="text" placeholder="Name" {...register('name')} />
        </div>
        <div className="col">
          <button className="rounded-full p-1.5 shadow bg-pink-400 text-white" type="submit">
            <Plus size={32}/>
          </button>
        </div>
      </div>
    </form>
  </div>
}
