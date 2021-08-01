import { gql, useQuery } from '@apollo/client'
import React from 'react'
import { LoadingSpinner } from '../components/loading-spinner'
import { RecipeCard } from '../components/recipe-card'
import { RecipeDTO } from '../shared/graphql'

const FETCH_RECIPES = gql`
    query GetRecipes {
        recipes {
            id
            name
            slug
            servings
            tags
        }
    }
`

export function Home() {
  const { loading, error, data } = useQuery(FETCH_RECIPES)
  if (loading) return <LoadingSpinner />
  if (error) return <p>Error {error.toString()}</p>

  return <div className="container p-4">
        <div className="grid grid-cols-4 gap-4">
            {
                data.recipes.map((recipe: RecipeDTO) => <RecipeCard recipe={recipe} key={recipe.id} />)
            }
        </div>
    </div>
}
