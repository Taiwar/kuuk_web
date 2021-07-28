import { gql, useLazyQuery } from '@apollo/client'
import React, { useEffect } from 'react'
import { Search as SearchIcon } from 'react-bootstrap-icons'
import { useForm } from 'react-hook-form'
import { useHistory, useLocation } from 'react-router-dom'
import { RecipeCard } from '../../components/recipe-card'
import { TopBar } from '../../components/top-bar'
import { FilterRecipesInput, RecipeDTO } from '../../shared/graphql'

const FILTER_RECIPES = gql`
    query FilterRecipes($filterRecipesInput: FilterRecipesInput!) {
        filterRecipes(filterRecipesInput: $filterRecipesInput) {
            id
            name
            slug
            servings
            tags
        }
    }
`

export function Search() {
  const history = useHistory()
  const { search } = useLocation()
  const [filterRecipes, { loading, error, data }] = useLazyQuery(FILTER_RECIPES)

  let filterRecipesInput: FilterRecipesInput | null = null

  if (search) {
    const query = new URLSearchParams(search)
    const filter = query.get('filter')
    if (filter) {
      filterRecipesInput = JSON.parse(filter)
    }
  }

  const { register, handleSubmit } = useForm({
    defaultValues: {
      name: filterRecipesInput?.name ?? ''
    }
  })

  useEffect(() => {
    if (filterRecipesInput) {
      filterRecipes({ variables: { filterRecipesInput } })
    }
  }, [search])

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error :(</p>

  function onSubmitFilter(data: FilterRecipesInput) {
    const filterRecipesInput: FilterRecipesInput = {
      name: data.name
    }
    console.log('querying for', filterRecipesInput)
    history.replace({
      pathname: '/search',
      search: '?filter=' + JSON.stringify(filterRecipesInput)
    })
    filterRecipes({ variables: { filterRecipesInput } })
  }

  return <div>
    <TopBar />
    <div className="container p-4">
      <div className="flex bg-white shadow rounded-lg p-4">
        <form onSubmit={handleSubmit(onSubmitFilter)}>
          <div className="grid grid-cols-4 gap-4">
            <input className="col-span-3 block w-full rounded-md border-gray-300 shadow-sm" type="text" placeholder="Search..." {...register('name')} />
            <button className="col-span-1 rounded-full shadow bg-pink-400 text-white w-11" type="submit">
              <SearchIcon className="m-auto" size={24}/>
            </button>
          </div>
        </form>
      </div>
      <div className="grid grid-cols-4 gap-4 mt-4">
        {
          !!data && data.filterRecipes.map((recipe: RecipeDTO) => <RecipeCard recipe={recipe} key={recipe.id} />)
        }
      </div>
    </div>
  </div>
}
