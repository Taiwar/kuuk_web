import { gql, useMutation } from '@apollo/client'
import React from 'react'
import { Plus } from 'react-bootstrap-icons'
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
  const { register, handleSubmit } = useForm()
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
    }).then()
  }

  return <div>
    <h4 className="text-2xl my-3">Steps</h4>
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
    <form onSubmit={handleSubmit(onAddStepSubmit)}>
      <div className="grid grid-cols-5 gap-1 lg:w-1/2">
        <div className="col-span-1">
          <input className="block w-full rounded-md border-gray-300 shadow-sm" type="text" placeholder="Name" {...register('name')} />
        </div>
        <div className="col-span-3">
          <input className="block w-full rounded-md border-gray-300 shadow-sm" type="text" placeholder="Description" {...register('description')} />
        </div>
        <div className="col-span-1">
          <button className="rounded-full p-1.5 shadow bg-pink-400 text-white" type="submit">
            <Plus size={32}/>
          </button>
        </div>
      </div>
    </form>
  </div>
}
