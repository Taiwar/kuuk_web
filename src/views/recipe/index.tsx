import React from 'react'
import { gql, useQuery } from '@apollo/client'
import { useParams } from 'react-router-dom'
import { RecipeDTO } from '../../shared/graphql'
import { RecipeIngredients } from './ingredients'
import { RecipeMeta } from './meta'
import { RecipeSteps } from './steps'

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

export function RecipePage() {
  const { slug } = useParams() as any
  const recipeResult = useQuery(FETCH_RECIPE, {
    variables: { slug },
    pollInterval: 20000
  })

  if (recipeResult.loading) return <p>Loading...</p>
  if (recipeResult.error) return <p>Error :(</p>

  const recipe = recipeResult.data.recipeBySlug as RecipeDTO

  return <div className="container">
    <div className="shadow rounded">
      <div className="bg-pink-300 p-4 rounded-t-lg">
        <h2 className="mb-0 text-white font-bold text-3xl">{recipe.name}</h2>
      </div>
      <div className="bg-pink-400 p-4">
        <RecipeMeta recipe={recipe} />
      </div>
      <div className="bg-white p-8 rounded-b-lg">
        <RecipeIngredients recipeId={recipe.id} ingredients={recipe.ingredients || []} />
        <RecipeSteps recipeId={recipe.id} steps={recipe.steps || []} />
      </div>
    </div>
  </div>
}
