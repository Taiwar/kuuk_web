import { gql, useMutation } from '@apollo/client'
import React, { useEffect, useRef, useState } from 'react'
import { Pencil, PencilFill, Plus, X } from 'react-bootstrap-icons'
import { useForm } from 'react-hook-form'
import { AddStepInput, StepDTO, UpdateStepInput } from '../../../shared/graphql'
import { StepItem } from './step-item'

const ADD_STEP = gql`
    mutation AddStep($addStepInput: AddStepInput!) {
        addStep(addStepInput: $addStepInput) {
            id
            name
            description
        }
    }
`

const UPDATE_STEP = gql`
    mutation UpdateStep($updateStepInput: UpdateStepInput!) {
        updateStep(updateStepInput: $updateStepInput) {
            id
            name
            description
        }
    }
`

const REMOVE_STEP = gql`
    mutation RemoveStep($stepId: String!, $recipeId: String!) {
        removeStep(stepID: $stepId, recipeID: $recipeId) {
            id
            success
        }
    }
`

export function RecipeSteps(props: { recipeId: string, steps: StepDTO[] }) {
  const [editable, setEditable] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const { register, handleSubmit, reset, setFocus } = useForm()
  const [addStep] = useMutation(ADD_STEP, {
    update(cache, { data: { addStep } }) {
      cache.modify({
        fields: {
          recipeBySlug(recipeBySlugRef) {
            cache.modify({
              id: recipeBySlugRef.__ref,
              fields: {
                steps(existingSteps = []) {
                  const newStepRef = cache.writeFragment({
                    data: addStep,
                    fragment: gql`
                                            fragment NewStep on StepDTO {
                                                id
                                                name
                                                description
                                            }
                                        `
                  })
                  return [...existingSteps, newStepRef]
                }
              }
            })
            return recipeBySlugRef
          }
        }
      })
    }
  })
  const [updateStep] = useMutation(UPDATE_STEP, {
    update(cache, { data: { updateStep } }) {
      cache.modify({
        fields: {
          recipeBySlug(recipeBySlugRef) {
            cache.modify({
              id: recipeBySlugRef.__ref,
              fields: {
                steps(existingSteps = []) {
                  const updatedStepRef = cache.writeFragment({
                    data: updateStep,
                    fragment: gql`
                                            fragment NewStep on StepDTO {
                                                id
                                                name
                                                description
                                            }
                                        `
                  })
                  return [...existingSteps.filter((i: {__ref: string}) => {
                    return `StepDTO:${updateStep.id}` !== i.__ref
                  }), updatedStepRef]
                }
              }
            })
            return recipeBySlugRef
          }
        }
      })
    }
  })
  const [removeStep] = useMutation(REMOVE_STEP, {
    update(cache, { data: { removeStep } }) {
      cache.modify({
        fields: {
          recipeBySlug(recipeBySlugRef) {
            cache.modify({
              id: recipeBySlugRef.__ref,
              fields: {
                steps(existingSteps = []) {
                  if (removeStep.success) {
                    return existingSteps.filter((i: {__ref: string}) => `StepDTO:${removeStep.id}` !== i.__ref)
                  }
                  return existingSteps
                }
              }
            })
            return recipeBySlugRef
          }
        }
      })
    }
  })

  function onAddStepSubmit(data: AddStepInput) {
    const addStepInput: AddStepInput = {
      recipeID: props.recipeId,
      name: data.name,
      description: data.description
    }
    // TODO: Adding an optimistic response leads to a series of errors here for some reason
    addStep({
      variables: { addStepInput }
    }).then(() => {
      reset()
    })
  }

  function onUpdateStepSubmit(updateStepInput: UpdateStepInput) {
    updateStep({
      variables: { updateStepInput },
      optimisticResponse: {
        updateStep: {
          __typename: 'StepDTO',
          id: updateStepInput.id,
          name: updateStepInput.name,
          description: updateStepInput.description
        }
      }
    })
  }

  function onDeleteStepSubmit(stepId: string) {
    removeStep({
      variables: { stepId, recipeId: props.recipeId },
      optimisticResponse: {
        removeStep: {
          __typename: 'DeletionResponse',
          id: stepId,
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
      setFocus('name')
    }
  }, [showForm])

  return <div>
    <div className="flex">
      <h4 className="flex text-2xl my-3">Steps</h4>
      <div hidden={showForm} className="flex ml-2 mt-3 justify-center">
        <button className="rounded-full p-1.5 h-9 shadow bg-pink-400 text-white hover:shadow-lg" onClick={handleClickAdd}>
          <Plus size={24}/>
        </button>
        <button hidden={props.steps.length < 1} className="rounded-full p-3 h-9 shadow bg-pink-400 text-white ml-1 hover:shadow-lg" onClick={handleClickEdit}>
          { editable ? <Pencil size={12} /> : <PencilFill size={12}/> }
        </button>
      </div>
    </div>
    <div className="mb-4">
      {
        props.steps?.map((step: StepDTO, i) => {
          return <StepItem i={i} key={step.id} step={step} editable={editable} updateStep={onUpdateStepSubmit} deleteStep={onDeleteStepSubmit}/>
        })
      }
    </div>
    <form ref={formRef} hidden={!showForm} onSubmit={handleSubmit(onAddStepSubmit)}>
      <div className="grid grid-cols-5 gap-1 lg:w-1/2">
        <div className="col-span-1">
          <input required className="block w-full rounded-md border-gray-300 shadow-sm" type="text" placeholder="Name*" {...register('name')} />
        </div>
        <div className="col-span-3">
          <textarea className="block w-full rounded-md border-gray-300 shadow-sm" placeholder="Description" {...register('description')} />
        </div>
        <div className="col-span-1">
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
