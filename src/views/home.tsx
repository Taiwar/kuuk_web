import { gql, useQuery } from '@apollo/client'
import React from 'react'
import { Card, Col, Container, Row } from 'react-bootstrap'
import { RecipeDTO } from '../shared/graphql'
import {
  Link
} from 'react-router-dom'

const FETCH_RECIPES = gql`
    query getRecipes {
        recipes {
            id
            name
            slug
            servings
        }
    }
`

export function Home() {
  const { loading, error, data } = useQuery(FETCH_RECIPES)
  if (loading) return <p>Loading...</p>
  if (error) return <p>Error :(</p>

  return <Container>
        <Row>
            {
                data.recipes.map((recipe: RecipeDTO) => (
                    <Col key={recipe.id}>
                      <Link to={`/recipe/${recipe.slug}`}>
                        <Card className="hover:shadow-md">
                          <Card.Body>
                            <Card.Title>{recipe.name}</Card.Title>
                            <Card.Body>{recipe.servings} servings</Card.Body>
                          </Card.Body>
                        </Card>
                      </Link>
                    </Col>
                ))
            }
        </Row>
    </Container>
}
