import { gql, useMutation } from '@apollo/client'
import React from 'react'
import { AddStepInput, GroupDTO, UpdateStepInput } from '../../../shared/graphql'
import { ItemGroup } from '../../../components/item-group'

const ADD_STEP = gql`
    mutation AddStep($addStepInput: AddStepInput!) {
        addStep(addStepInput: $addStepInput) {
            id
            name
            description
            groupID
            sortNr
        }
    }
`

const UPDATE_STEP = gql`
    mutation UpdateStep($updateStepInput: UpdateStepInput!) {
        updateStep(updateStepInput: $updateStepInput) {
            id
            name
            description
            groupID
            sortNr
        }
    }
`

const REMOVE_STEP = gql`
    mutation RemoveStep($stepId: String!) {
        removeStep(stepID: $stepId) {
            id
            groupID
            success
        }
    }
`

export function RecipeSteps(props: { recipeId: string, stepGroups: GroupDTO[] }) {
  const [addStep] = useMutation(ADD_STEP, {
    update(cache, { data: { addStep } }) {
      cache.modify({
        id: `GroupDTO:${addStep.groupID}`,
        fields: {
          items(existingItems = []) {
            const ref = cache.writeFragment({
              data: addStep,
              fragment: gql`
                              fragment NewStep on StepDTO {
                                  id
                                  name
                                  description
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
  const [updateStep] = useMutation(UPDATE_STEP, {
    update(cache, { data: { updateStep } }) {
      cache.modify({
        id: `GroupDTO:${updateStep.groupID}`,
        fields: {
          items(existingItems = []) {
            const ref = cache.writeFragment({
              data: updateStep,
              fragment: gql`
                              fragment NewStep on StepDTO {
                                  id
                                  name
                                  description
                                  groupID
                                  sortNr
                              }
                          `
            })
            return [...existingItems.filter((i: {__ref: string}) => {
              return `StepDTO:${updateStep.id}` !== i.__ref
            }), ref]
          }
        }
      })
    }
  })
  const [removeStep] = useMutation(REMOVE_STEP, {
    update(cache, { data: { removeStep } }) {
      cache.modify({
        id: `GroupDTO:${removeStep.groupID}`,
        fields: {
          items(existingItems = []) {
            if (removeStep.success) {
              return existingItems.filter((i: {__ref: string}) => `StepDTO:${removeStep.id}` !== i.__ref)
            }
            return existingItems
          }
        }
      })
    }
  })

  function onAddStepSubmit(data: AddStepInput) {
    const addStepInput: AddStepInput = {
      recipeID: props.recipeId,
      name: data.name,
      description: data.description,
      groupID: data.groupID
    }
    return addStep({
      variables: { addStepInput }
      // TODO: Fix optimistic response
      /* optimisticResponse: {
        addStep: {
          id: 'temp-id',
          name: addStepInput.name,
          description: addStepInput.description,
          groupID: addStepInput.groupID,
          sortNr: 1,
          __typename: 'StepDTO'
        }
      } */
    })
  }

  function onUpdateStepSubmit(updateStepInput: UpdateStepInput) {
    return updateStep({
      variables: { updateStepInput },
      optimisticResponse: {
        updateStep: {
          id: updateStepInput.id,
          name: updateStepInput.name,
          description: updateStepInput.description,
          groupID: updateStepInput.groupID,
          sortNr: updateStepInput.sortNr,
          __typename: 'StepDTO'
        }
      }
    })
  }

  function onDeleteStepSubmit(stepId: string, groupId: string) {
    return removeStep({
      variables: { stepId },
      optimisticResponse: {
        removeStep: {
          id: stepId,
          groupID: groupId,
          success: true,
          __typename: 'GroupItemDeletionResponse'
        }
      }
    })
  }

  return <div>
    <div className="flex">
      <h4 className="flex text-2xl my-3">Steps</h4>
    </div>
    <div className="mb-4">
      {
        [...props.stepGroups]
          .sort((a, b) => a.sortNr - b.sortNr)
          .map((group) =>
                <ItemGroup key={group.id} group={group} add={onAddStepSubmit} update={onUpdateStepSubmit} delete={onDeleteStepSubmit}/>)
      }
    </div>
  </div>
}
