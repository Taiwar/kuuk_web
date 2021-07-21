import React, { useEffect, useRef, useState } from 'react'
import { gql, useMutation } from '@apollo/client'
import { Plus, X } from 'react-bootstrap-icons'
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
  const [showForm, setShowForm] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const { register, handleSubmit, reset, setFocus } = useForm()
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
          name: addIngredientInput.name,
          amount: addIngredientInput.amount,
          unit: addIngredientInput.unit
        }
      }
    }).then(() => {
      reset()
    })
  }

  function handleClickAdd() {
    setShowForm(true)
  }

  function handleCancel(e: any) {
    e.preventDefault()
    setShowForm(false)
  }

  useEffect(() => {
    if (showForm) {
      window.scrollTo({ top: formRef.current?.offsetTop })
      setFocus('amount')
    }
  }, [showForm])

  return <div>
    <div className="flex">
      <h4 className="flex text-2xl my-3">Ingredients</h4>
      <div hidden={showForm} className="ml-2 mt-3">
        <button className="rounded-full p-1 shadow bg-pink-400 text-white" onClick={handleClickAdd}>
          <Plus size={24}/>
        </button>
      </div>
    </div>
    <div className="mb-4">
      {
        props.ingredients?.map((ingredient: IngredientDTO) => {
          return <div key={ingredient.id} className="flex">
            <input className="mx-2 mt-1" type="checkbox" />
            <span className="flex-1"><b className="mr-1">{ingredient.amount} {ingredient.unit}</b> {ingredient.name}</span>
          </div>
        })
      }
    </div>
    <form ref={formRef} hidden={!showForm} onSubmit={handleSubmit(onAddIngredientSubmit)}>
      <div className="grid grid-cols-7 gap-1 lg:w-1/2">
        <div className="col-span-2">
          <input required className="block w-full rounded-md border-gray-300 shadow-sm" type="number" placeholder="Amount*" {...register('amount')} />
        </div>
        <div className="col-span-1">
          <input required className="block w-full rounded-md border-gray-300 shadow-sm" type="text" placeholder="Unit*" {...register('unit')}/>
        </div>
        <div className="col-span-3">
          <input required className="block w-full rounded-md border-gray-300 shadow-sm" type="text" placeholder="Name*" {...register('name')} />
        </div>
        <div className="col">
          <button className="rounded-full p-1.5 shadow bg-pink-400 text-white" type="submit">
            <Plus size={32}/>
          </button>
          <button className="rounded-full p-1.5 shadow bg-pink-400 text-white ml-1" onClick={handleCancel}>
            <X size={32}/>
          </button>
        </div>
      </div>
    </form>
  </div>
}
