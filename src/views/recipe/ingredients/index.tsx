import React from 'react'
import { gql, useMutation } from '@apollo/client'
import { AddIngredientInput, GroupDTO, UpdateIngredientInput } from '../../../shared/graphql'
import { RecipeItemsSection } from '../items-section'
import { GroupItemTypes } from '../../../shared/constants'
import CacheHelper from '../../../shared/cache-helper'

const ADD_INGREDIENT = gql`
    mutation AddIngredient($addIngredientInput: AddIngredientInput!) {
        addIngredient(addIngredientInput: $addIngredientInput) {
            id
            name
            amount
            unit
            groupID
            sortNr
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
            groupID
            sortNr
            prevGroupID
            prevSortNr
        }
    }
`

const REMOVE_INGREDIENT = gql`
    mutation RemoveIngredient($ingredientId: String!) {
        removeIngredient(ingredientID: $ingredientId) {
            id
            groupID
            success
        }
    }
`

export function RecipeIngredients(props: { recipeId: string, ingredientGroups: GroupDTO[] }) {
  const [addIngredient] = useMutation(ADD_INGREDIENT, {
    update(cache, { data: { addIngredient } }) {
      cache.modify({
        id: `GroupDTO:${addIngredient.groupID}`,
        fields: {
          items(existingItems = []) {
            const ref = cache.writeFragment({
              data: addIngredient,
              fragment: gql`
                                fragment NewIngredient on IngredientDTO {
                                    id
                                    name
                                    amount
                                    unit
                                    groupID
                                    sortNr
                                }
                            `
            })
            return [...existingItems, ref]
          }
        }
      })
    }
  })

  const [updateIngredient] = useMutation(UPDATE_INGREDIENT, {
    update(cache, { data: { updateIngredient } }) {
      CacheHelper.updateIngredient(cache, updateIngredient)
    }
  })

  const [removeIngredient] = useMutation(REMOVE_INGREDIENT, {
    update(cache, { data: { removeIngredient } }) {
      CacheHelper.removeIngredient(cache, removeIngredient)
    }
  })

  function onAddIngredientSubmit(data: AddIngredientInput & { amount: string }) {
    const addIngredientInput: AddIngredientInput = {
      recipeID: props.recipeId,
      name: data.name,
      amount: parseFloat(data.amount),
      unit: data.unit,
      groupID: data.groupID
    }
    return addIngredient({
      variables: { addIngredientInput },
      optimisticResponse: {
        addIngredient: {
          id: 'temp-id',
          name: addIngredientInput.name,
          amount: addIngredientInput.amount,
          unit: addIngredientInput.unit,
          sortNr: 1,
          groupID: addIngredientInput.groupID,
          __typename: 'IngredientDTO'
        }
      }
    })
  }

  function onUpdateIngredientSubmit(updateIngredientInput: UpdateIngredientInput, prevGroupId: string, prevSortNr?: number) {
    return updateIngredient({
      variables: { updateIngredientInput },
      optimisticResponse: {
        updateIngredient: {
          id: updateIngredientInput.id,
          name: updateIngredientInput.name,
          amount: updateIngredientInput.amount,
          unit: updateIngredientInput.unit,
          groupID: updateIngredientInput.groupID,
          sortNr: updateIngredientInput.sortNr,
          prevGroupID: prevGroupId,
          prevSortNr,
          __typename: 'IngredientDTO'
        }
      }
    })
  }

  function onDeleteIngredientSubmit(ingredientId: string, groupId: string) {
    return removeIngredient({
      variables: { ingredientId },
      optimisticResponse: {
        removeIngredient: {
          id: ingredientId,
          groupID: groupId,
          success: true,
          __typename: 'GroupItemDeletionResponse'
        }
      }
    })
  }

  return <RecipeItemsSection
      recipeId={props.recipeId}
      title={'Ingredients'}
      groups={props.ingredientGroups}
      itemType={GroupItemTypes.IngredientBE}
      add={onAddIngredientSubmit}
      update={onUpdateIngredientSubmit}
      delete={onDeleteIngredientSubmit}
  />
}
