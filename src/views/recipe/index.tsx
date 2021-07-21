import React from 'react'
import { gql, useQuery } from '@apollo/client'
import { useParams } from 'react-router-dom'
import { TopBar } from '../../components/top-bar'
import { RecipeDTO } from '../../shared/graphql'
import { RecipeDescription } from './description'
import { RecipeIngredients } from './ingredients'
import { RecipeMeta } from './meta'
import { RecipeRating } from './rating'
import { RecipeSteps } from './steps'
import { RecipeTags } from './tags'

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

  return <div>
    <TopBar />
    <div className="container ml-4">
      <div className="shadow rounded">
        <div className="bg-pink-300 p-4 rounded-t-lg">
          <h2 className="mb-0 text-white font-bold text-3xl">{recipe.name}</h2>
          <RecipeRating size="3xl" recipe={recipe} />
        </div>
        <div className="bg-pink-400 p-4">
          <RecipeMeta recipe={recipe} />
          <RecipeTags recipe={recipe} />
        </div>
        <div className="bg-white px-8 py-4 rounded-b-lg">
          <RecipeDescription recipe={recipe} />
          <RecipeIngredients recipeId={recipe.id} ingredients={recipe.ingredients || []} />
          <RecipeSteps recipeId={recipe.id} steps={recipe.steps || []} />
        </div>
      </div>
    </div>
  </div>
}
