import React from 'react'
import { gql, useMutation } from '@apollo/client'
import { AddIngredientInput, GroupDTO, UpdateIngredientInput } from '../../../shared/graphql'
import { GroupItem } from '../../../components/group-item'
import { RecipeSectionHeader } from '../../../components/recipe-section-header'
import { GroupItemTypes } from '../../../shared/constants'

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
      cache.modify({
        id: `GroupDTO:${updateIngredient.groupID}`,
        fields: {
          items(existingItems = []) {
            const ref = cache.writeFragment({
              data: updateIngredient,
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
            return [...existingItems.filter((i: {__ref: string}) => {
              return `IngredientDTO:${updateIngredient.id}` !== i.__ref
            }), ref]
          }
        }
      })
    }
  })

  const [removeIngredient] = useMutation(REMOVE_INGREDIENT, {
    update(cache, { data: { removeIngredient } }) {
      cache.modify({
        id: `GroupDTO:${removeIngredient.groupID}`,
        fields: {
          items(existingItems = []) {
            if (removeIngredient.success) {
              return existingItems.filter((i: {__ref: string}) => `IngredientDTO:${removeIngredient.id}` !== i.__ref)
            }
            return existingItems
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

  function onUpdateIngredientSubmit(updateIngredientInput: UpdateIngredientInput) {
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

  // TODO: Implement in group header?
  function onDeleteGroupSubmit(id: string) {
    return new Promise(() => {})
  }
  return <div>
    <RecipeSectionHeader recipeId={props.recipeId} title={'Ingredients'} itemType={GroupItemTypes.IngredientBE} />
    <div className="mb-4">
      {
        [...props.ingredientGroups]
          .sort((a, b) => a.sortNr - b.sortNr)
          .map((group) =>
                <GroupItem
                    key={group.id}
                    group={group}
                    add={onAddIngredientSubmit}
                    update={onUpdateIngredientSubmit}
                    delete={onDeleteIngredientSubmit}
                    deleteGroup={onDeleteGroupSubmit}
                />
          )
      }
    </div>
  </div>
}
