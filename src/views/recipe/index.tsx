import React from 'react'
import { gql, useMutation, useQuery } from '@apollo/client'
import { Button, Col, Container, Form, Row } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { AddIngredientInput, IngredientDTO, RecipeDTO } from '../../shared/graphql'

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

export function RecipePage() {
  const { slug } = useParams() as any
  const recipeResult = useQuery(FETCH_RECIPE, {
    variables: { slug },
    pollInterval: 500
  })
  const [addIngredient, { data }] = useMutation(ADD_INGREDIENT)
  const { register, handleSubmit, formState: { errors } } = useForm()
  if (recipeResult.loading) return <p>Loading...</p>
  if (recipeResult.error) return <p>Error :(</p>

  const recipe = recipeResult.data.recipeBySlug as RecipeDTO

  function onSubmit(data: any) {
    console.log('submitting', data)
    const addIngredientInput: AddIngredientInput = {
      recipeID: recipe.id,
      name: data.name,
      amount: parseFloat(data.amount),
      unit: data.unit
    }
    addIngredient({ variables: { addIngredientInput } })
      .then(() => recipeResult.refetch())
  }

  console.log('Add ingredient data', data)
  return <Container>
    <Row>
      <Col>
        <h2>{recipe.name}</h2>
        <h4>{recipe.servings} servings</h4>
        <h3>Ingredients</h3>
        <ul>
          {
            recipe.ingredients?.map((ingredient: IngredientDTO) => {
              return <li key={ingredient.id}>{ingredient.amount}{ingredient.unit} {ingredient.name}</li>
            })
          }
        </ul>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Form.Group className="mb-3" controlId="formIngredient">
            <Form.Label>Name</Form.Label>
            <Form.Control placeholder="Name" {...register('name')} />
            <Form.Label>Amount</Form.Label>
            <Form.Control type="number" placeholder="Amount" {...register('amount')}/>
            <Form.Label>Unit</Form.Label>
            <Form.Control placeholder="Unit" {...register('unit')}/>
          </Form.Group>
          <Button variant="primary" type="submit">
            Submit
          </Button>
        </Form>
        <Button onClick={() => {
          const addIngredientInput: AddIngredientInput = {
            recipeID: recipe.id,
            name: 'Test Ingredient',
            amount: 50,
            unit: 'g'
          }
          addIngredient({ variables: { addIngredientInput } })
            .then(() => recipeResult.refetch())
        }}>
          Add Ingredient
        </Button>
      </Col>
    </Row>
  </Container>
}
