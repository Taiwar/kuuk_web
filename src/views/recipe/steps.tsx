import { gql, useMutation } from '@apollo/client'
import React, { useEffect, useRef, useState } from 'react'
import { Plus, X } from 'react-bootstrap-icons'
import { useForm } from 'react-hook-form'
import { AddStepInput, StepDTO } from '../../shared/graphql'

const ADD_STEP = gql`
    mutation AddStep($addStepInput: AddStepInput!) {
        addStep(addStepInput: $addStepInput) {
            id
            name
            description
        }
    }
`

export function RecipeSteps(props: { recipeId: string, steps: StepDTO[] }) {
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

  function onAddStepSubmit(data: AddStepInput) {
    const addStepInput: AddStepInput = {
      recipeID: props.recipeId,
      name: data.name,
      description: data.description
    }
    addStep({
      variables: { addStepInput },
      optimisticResponse: {
        addStep: {
          __typename: 'StepDTO',
          id: 'temp-id',
          name: addStepInput.name,
          description: addStepInput.description
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
      setFocus('name')
    }
  }, [showForm])

  return <div>
    <div className="flex">
      <h4 className="flex text-2xl my-3">Steps</h4>
      <div hidden={showForm} className="ml-2 mt-3">
        <button className="rounded-full p-1 shadow bg-pink-400 text-white" onClick={handleClickAdd}>
          <Plus size={24}/>
        </button>
      </div>
    </div>
    <div className="mb-4">
      {
        props.steps.map((step: StepDTO, i) => {
          return <div key={step.id} className="flex pb-2">
            <span className="bg-pink-400 text-white w-7 h-7 text-center pb-0.5 rounded-full mr-2">{i + 1}</span>
            <span className="flex-1"><b>{step.name}</b> {step.description}</span>
          </div>
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
