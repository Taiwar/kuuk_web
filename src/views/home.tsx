import { gql, useQuery } from '@apollo/client'
import React from 'react'
import { RecipeCard } from '../components/recipe-card'
import { RecipeDTO } from '../shared/graphql'

const FETCH_RECIPES = gql`
    query GetRecipes {
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

  return <div className="container p-4">
        <div className="grid grid-cols-4 gap-4">
            {
                data.recipes.map((recipe: RecipeDTO) => <RecipeCard recipe={recipe} key={recipe.id} />)
            }
        </div>
    </div>
}
