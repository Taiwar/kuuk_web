import React from 'react'
import { gql, useMutation, useQuery } from '@apollo/client'
import { Col, Container, Row } from 'react-bootstrap'
import { Plus } from 'react-bootstrap-icons'
import { useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { AddIngredientInput, AddStepInput, IngredientDTO, RecipeDTO, StepDTO } from '../../shared/graphql'

const FETCH_RECIPE = gql`
    query getRecipeBySlug($slug: String!) {
        recipeBySlug(slug: $slug) {
            id
            name
            slug
            author
            prepTimeMin
            cookTimeMin
            totalTimeMin
            servings
            rating
            description
            notes
            sourceLinks
            tags
            pictures
            ingredients {
                id
                name
                amount
                unit
            }
            steps {
                id
                name
                description
            }
        }
    }
`

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

const ADD_STEP = gql`
    mutation AddStep($addStepInput: AddStepInput!) {
        addStep(addStepInput: $addStepInput) {
            id
            name
            description
        }
    }
`

// TODO: Split this into components
export function RecipePage() {
  const { slug } = useParams() as any
  const recipeResult = useQuery(FETCH_RECIPE, {
    variables: { slug },
    pollInterval: 20000
  })
  const [addIngredient, ingredientResult] = useMutation(ADD_INGREDIENT, {
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
  const [addStep, stepResult] = useMutation(ADD_STEP, {
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
  const { register, handleSubmit } = useForm()
  if (recipeResult.loading) return <p>Loading...</p>
  if (recipeResult.error) return <p>Error :(</p>

  const recipe = recipeResult.data.recipeBySlug as RecipeDTO

  function onIngredientSubmit(data: any) {
    console.log('submitting', data)
    const addIngredientInput: AddIngredientInput = {
      recipeID: recipe.id,
      name: data.ingredientName,
      amount: parseFloat(data.ingredientAmount),
      unit: data.ingredientUnit
    }
    addIngredient({
      variables: { addIngredientInput },
      optimisticResponse: {
        addIngredient: {
          __typename: 'IngredientDTO',
          id: 'temp-id',
          name: data.ingredientName,
          amount: parseFloat(data.ingredientAmount),
          unit: data.ingredientUnit
        }
      }
    })
  }

  function onStepSubmit(data: any) {
    console.log('submitting', data)
    const addStepInput: AddStepInput = {
      recipeID: recipe.id,
      name: data.stepName,
      description: data.stepDescription
    }
    addStep({
      variables: { addStepInput },
      optimisticResponse: {
        addStep: {
          __typename: 'StepDTO',
          id: 'temp-id',
          name: data.stepName,
          description: data.stepDescription
        }
      }
    }).then()
  }

  console.log('Add ingredient data', ingredientResult)
  console.log('Add step data', stepResult)
  return <Container>
    <Row>
      <Col>
        <div className="shadow rounded-lg">
          <div className="bg-pink-300 p-4 rounded-top">
            <h2 className="mb-0 text-white fw-bold">{recipe.name}</h2>
          </div>
          <div className="bg-pink-400 p-4">
            <h5 className="mb-0 text-white"><b>{recipe.servings}</b> servings</h5>
          </div>
          <div className="p-4">
            <h4 className="mb-3">Ingredients</h4>
            <div className="mb-4">
              {
                recipe.ingredients?.map((ingredient: IngredientDTO) => {
                  return <div key={ingredient.id} className="flex">
                    <input className="mx-2" type="checkbox" />
                    <span className="flex-1"><b className="mr-1">{ingredient.amount} {ingredient.unit}</b> {ingredient.name}</span>
                  </div>
                })
              }
            </div>
            <form onSubmit={handleSubmit(onIngredientSubmit)}>
              <div className="grid grid-cols-7 gap-1">
                <div className="col-span-3">
                  <input className="block w-full rounded-md border-gray-300 shadow-sm" type="text" placeholder="Name" {...register('ingredientName')} />
                </div>
                <div className="col-span-2">
                  <input className="block w-full rounded-md border-gray-300 shadow-sm" type="number" placeholder="Amount" {...register('ingredientAmount')} />
                </div>
                <div className="col-span-1">
                  <input className="block w-full rounded-md border-gray-300 shadow-sm" type="text" placeholder="Unit" {...register('ingredientUnit')}/>
                </div>
                <div className="col">
                  <button className="rounded-full p-1.5 shadow bg-pink-400 text-white" type="submit">
                    <Plus size={32}/>
                  </button>
                </div>
              </div>
            </form>
          </div>
          <div className="p-4">
            <h4 className="mb-3">Steps</h4>
            <div className="mb-4">
              {
                recipe.steps?.map((step: StepDTO, i) => {
                  return <div key={step.id} className="flex pb-2">
                    <span className="bg-pink-400 text-white w-7 h-7 text-center pb-0.5 rounded-circle mr-2">{i + 1}</span>
                    <span className="flex-1"><b>{step.name}</b> {step.description}</span>
                  </div>
                })
              }
            </div>
            <form onSubmit={handleSubmit(onStepSubmit)}>
              <div className="grid grid-cols-5 gap-1">
                <div className="col-span-2">
                  <input className="block w-full rounded-md border-gray-300 shadow-sm" type="text" placeholder="Name" {...register('stepName')} />
                </div>
                <div className="col-span-3">
                  <input className="block w-full rounded-md border-gray-300 shadow-sm" type="text" placeholder="Description" {...register('stepDescription')} />
                </div>
                <div className="col">
                  <button className="rounded-full p-1.5 shadow bg-pink-400 text-white" type="submit">
                    <Plus size={32}/>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </Col>
    </Row>
  </Container>
}
