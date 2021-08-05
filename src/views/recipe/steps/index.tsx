import { gql, useMutation } from '@apollo/client'
import React from 'react'
import { AddStepInput, GroupDTO, UpdateStepInput } from '../../../shared/graphql'
import { GroupItemTypes } from '../../../shared/constants'
import { RecipeItemsSection } from '../items-section'
import CacheHelper from '../../../shared/cache-helper'
import { LoadingSpinner } from '../../../components/loading-spinner'

const ADD_STEP = gql`
    mutation AddStep($addStepInput: AddStepInput!) {
        addStep(addStepInput: $addStepInput) {
            id
            name
            description
            picture
            groupID
            sortNr
        }
    }
`

const UPDATE_STEP = gql`
    mutation UpdateStep($updateStepInput: UpdateStepInput!) {
        updateStep(updateStepInput: $updateStepInput) {
            item {
                ... on StepDTO {
                    id
                    name
                    description
                    groupID
                    sortNr
                }
            }
            prevSortNr
            prevGroupID
        }
    }
`

const REMOVE_STEP = gql`
    mutation RemoveStep($stepId: String!) {
        removeStep(stepID: $stepId) {
            id
            groupID
            success
            sortNr
        }
    }
`

export function RecipeSteps(props: { recipeId: string, stepGroups: GroupDTO[] }) {
  const [addStep, addResult] = useMutation(ADD_STEP, {
    update(cache, { data: { addStep } }) {
      CacheHelper.addItem(cache, addStep, GroupItemTypes.StepBE)
    }
  })
  const [updateStep, updateResult] = useMutation(UPDATE_STEP, {
    update(cache, { data: { updateStep } }) {
      CacheHelper.updateItem(cache, updateStep, GroupItemTypes.StepBE)
    }
  })
  const [removeStep, removeResult] = useMutation(REMOVE_STEP, {
    update(cache, { data: { removeStep } }) {
      CacheHelper.removeItem(cache, removeStep, GroupItemTypes.StepBE)
    }
  })

  if (addResult.loading || updateResult.loading || removeResult.loading) return <LoadingSpinner />
  if (addResult.error || updateResult.error || removeResult.error) {
    const error = addResult.error ?? updateResult.error ?? removeResult.error ?? ''
    return <p>Error {error.toString()}</p>
  }

  function onAddStepSubmit(data: AddStepInput) {
    const addStepInput: AddStepInput = {
      recipeID: props.recipeId,
      name: data.name,
      description: data.description,
      groupID: data.groupID
    }
    return addStep({
      variables: { addStepInput },
      optimisticResponse: {
        addStep: {
          id: 'temp-id',
          name: addStepInput.name,
          description: addStepInput.description,
          picture: addStepInput.picture ?? '',
          sortNr: props.stepGroups.filter((g) => g.id === data.groupID)[0].items.length,
          groupID: addStepInput.groupID,
          __typename: 'StepDTO'
        }
      }
    })
  }

  function onUpdateStepSubmit(updateStepInput: UpdateStepInput, prevGroupId: string, prevSortNr?: number) {
    return updateStep({
      variables: { updateStepInput },
      optimisticResponse: {
        updateStep: {
          item: {
            id: updateStepInput.id,
            name: updateStepInput.name,
            description: updateStepInput.description,
            groupID: updateStepInput.groupID,
            sortNr: updateStepInput.sortNr
          },
          prevGroupId,
          prevSortNr,
          __typename: 'GroupItemUpdateResponse'
        }
      }
    })
  }

  function onDeleteStepSubmit(stepId: string, groupId: string, sortNr: number) {
    return removeStep({
      variables: { stepId },
      optimisticResponse: {
        removeStep: {
          id: stepId,
          groupID: groupId,
          success: true,
          sortNr,
          __typename: 'GroupItemDeletionResponse'
        }
      }
    })
  }

  return <RecipeItemsSection
      recipeId={props.recipeId}
      title={'Steps'}
      groups={props.stepGroups}
      itemType={GroupItemTypes.StepBE}
      add={onAddStepSubmit}
      update={onUpdateStepSubmit}
      delete={onDeleteStepSubmit}
  />
}
