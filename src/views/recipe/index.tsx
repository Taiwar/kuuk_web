import React, { useState } from 'react'
import { gql, useQuery } from '@apollo/client'
import { Pencil, PencilFill } from 'react-bootstrap-icons'
import { useParams } from 'react-router-dom'
import { TopBar } from '../../components/top-bar'
import { RecipeDTO } from '../../shared/graphql'
import { RecipeDescription } from './description'
import { RecipeIngredients } from './ingredients'
import { RecipeMeta } from './meta'
import { RecipeNotes } from './notes'
import { RecipeRating } from './rating'
import { RecipeSourceLinks } from './source-links'
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
                picture
            }
            notes {
                id
                name
                description
            }
        }
    }
`

export function RecipePage() {
  const { slug } = useParams() as any
  const [heroEditable, setHeroEditable] = useState(false)
  const recipeResult = useQuery(FETCH_RECIPE, {
    variables: { slug },
    pollInterval: 20000
  })

  if (recipeResult.loading) return <p>Loading...</p>
  if (recipeResult.error) return <p>Error :(</p>

  const recipe = recipeResult.data.recipeBySlug as RecipeDTO

  if (recipeResult.loading) return <p>Loading...</p>

  function handleClickHeroEdit() {
    setHeroEditable(!heroEditable)
  }

  return <div>
    <TopBar />
    <div className="container ml-4">
      <div className="shadow rounded">
        <div className="bg-pink-300 p-4 rounded-t-lg">
          <h2 className="mb-0 text-white font-bold text-3xl">{recipe.name}</h2>
          <RecipeRating size="3xl" recipe={recipe} />
        </div>
        <div className="bg-pink-400 p-4">
          <RecipeMeta recipe={recipe} editable={heroEditable} />
          <RecipeTags recipe={recipe} editable={heroEditable} />
          <button className="block rounded-full p-2 shadow bg-pink-300 text-white ml-1 hover:shadow-lg float-right" onClick={handleClickHeroEdit}>
            { heroEditable ? <Pencil size={24} /> : <PencilFill size={24}/> }
          </button>
        </div>
        <div className="bg-white px-8 py-4 rounded-b-lg">
          <RecipeDescription recipe={recipe} />
          <RecipeIngredients recipeId={recipe.id} ingredients={recipe.ingredients || []} />
          <RecipeSteps recipeId={recipe.id} steps={recipe.steps || []} />
          <RecipeNotes recipeId={recipe.id} notes={recipe.notes || []} />
          <RecipeSourceLinks recipe={recipe} />
        </div>
      </div>
    </div>
  </div>
}
