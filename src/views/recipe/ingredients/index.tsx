import React, { useEffect, useRef, useState } from 'react'
import { gql, useMutation } from '@apollo/client'
import { Pencil, PencilFill, Plus, X } from 'react-bootstrap-icons'
import { useForm } from 'react-hook-form'
import {
  AddIngredientInput,
  GroupDTO,
  IngredientDTO,
  IngredientItemDTO, OrderedRecipeItemDTO,
  UpdateIngredientInput
} from '../../../shared/graphql'
import { IngredientItem } from './ingredient-item'

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

const UPDATE_INGREDIENT = gql`
    mutation UpdateIngredient($updateIngredientInput: UpdateIngredientInput!) {
        updateIngredient(updateIngredientInput: $updateIngredientInput) {
            id
            name
            amount
            unit
        }
    }
`

const REMOVE_INGREDIENT = gql`
    mutation RemoveIngredient($ingredientId: String!) {
        removeIngredient(ingredientID: $ingredientId) {
            id
            success
        }
    }
`

export function RecipeIngredients(props: { recipeId: string, ingredients: IngredientItemDTO[] }) {
  const [editable, setEditable] = useState(false)
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
  const [updateIngredient] = useMutation(UPDATE_INGREDIENT, {
    update(cache, { data: { updateIngredient } }) {
      cache.modify({
        fields: {
          recipeBySlug(recipeBySlugRef) {
            cache.modify({
              id: recipeBySlugRef.__ref,
              fields: {
                ingredients(existingIngredients = []) {
                  const updatedIngredientRef = cache.writeFragment({
                    data: updateIngredient,
                    fragment: gql`
                                            fragment NewIngredient on IngredientDTO {
                                                id
                                                name
                                                amount
                                                unit
                                            }
                                        `
                  })
                  return [...existingIngredients.filter((i: {__ref: string}) => {
                    return `IngredientDTO:${updateIngredient.id}` !== i.__ref
                  }), updatedIngredientRef]
                }
              }
            })
            return recipeBySlugRef
          }
        }
      })
    }
  })
  const [removeIngredient] = useMutation(REMOVE_INGREDIENT, {
    update(cache, { data: { removeIngredient } }) {
      cache.modify({
        fields: {
          recipeBySlug(recipeBySlugRef) {
            cache.modify({
              id: recipeBySlugRef.__ref,
              fields: {
                ingredients(existingIngredients = []) {
                  if (removeIngredient.success) {
                    return existingIngredients.filter((i: {__ref: string}) => `IngredientDTO:${removeIngredient.id}` !== i.__ref)
                  }
                  return existingIngredients
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

  function onUpdateIngredientSubmit(updateIngredientInput: UpdateIngredientInput) {
    updateIngredient({
      variables: { updateIngredientInput },
      optimisticResponse: {
        updateIngredient: {
          __typename: 'IngredientDTO',
          id: updateIngredientInput.id,
          name: updateIngredientInput.name,
          amount: updateIngredientInput.amount,
          unit: updateIngredientInput.unit
        }
      }
    })
  }

  function onDeleteIngredientSubmit(ingredientId: string) {
    removeIngredient({
      variables: { ingredientId, recipeId: props.recipeId },
      optimisticResponse: {
        removeIngredient: {
          __typename: 'DeletionResponse',
          id: ingredientId,
          success: true
        }
      }
    })
  }

  function handleClickAdd() {
    setShowForm(true)
  }

  function handleClickEdit() {
    setEditable(!editable)
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
      <div hidden={showForm} className="flex ml-2 mt-3 justify-center">
        <button className="rounded-full p-1.5 h-9 shadow bg-pink-400 text-white hover:shadow-lg" onClick={handleClickAdd}>
          <Plus size={24}/>
        </button>
        <button hidden={props.ingredients.length < 1} className="rounded-full p-3 h-9 shadow bg-pink-400 text-white ml-1 hover:shadow-lg" onClick={handleClickEdit}>
          { editable ? <Pencil size={12} /> : <PencilFill size={12}/> }
        </button>
      </div>
    </div>
    <div className="mb-4">
      {
        [...props.ingredients]
          .sort((a, b) => a.sortNr - b.sortNr)
          .map((item: any) => {
            if (item.__typename === 'IngredientDTO') {
              const ingredient = item as IngredientDTO
              console.log(ingredient)
              return <IngredientItem key={ingredient.id} ingredient={ingredient} editable={editable} updateIngredient={onUpdateIngredientSubmit} deleteIngredient={onDeleteIngredientSubmit}/>
            } else if (item.__typename === 'GroupDTO') {
              const ingredientGroup = item as GroupDTO
              return <div>
              <h4>{ingredientGroup.name}</h4>
              {
                ingredientGroup.items?.map((ingredient: OrderedRecipeItemDTO) =>
                  <IngredientItem key={ingredient.id} ingredient={ingredient as IngredientDTO} editable={editable} updateIngredient={onUpdateIngredientSubmit} deleteIngredient={onDeleteIngredientSubmit}/>
                )
              }
            </div>
            } else {
              return <div>Unknown item</div>
            }
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
