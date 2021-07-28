import React, { useEffect } from 'react'
import Select from 'react-select'
import { gql, useLazyQuery, useQuery } from '@apollo/client'
import { Search as SearchIcon } from 'react-bootstrap-icons'
import { useForm, Controller } from 'react-hook-form'
import { useHistory, useLocation } from 'react-router-dom'
import { LoadingSpinner } from '../../components/loading-spinner'
import { RecipeCard } from '../../components/recipe-card'
import { TopBar } from '../../components/top-bar'
import { FilterRecipesInput, RecipeDTO } from '../../shared/graphql'

const GET_TAGS = gql`
    query GetTags {
        tags
    }
`

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
  const tagResults = useQuery(GET_TAGS)
  const [filterRecipes, filterRecipeResults] = useLazyQuery(FILTER_RECIPES)

  let filterRecipesInput: FilterRecipesInput | null = null

  if (search) {
    const query = new URLSearchParams(search)
    const filter = query.get('filter')
    if (filter) {
      filterRecipesInput = JSON.parse(filter)
    }
  }

  const { control, register, handleSubmit } = useForm({
    defaultValues: {
      name: filterRecipesInput?.name ?? '',
      tags: filterRecipesInput?.tags ?? []
    }
  })

  useEffect(() => {
    if (filterRecipesInput) {
      filterRecipes({ variables: { filterRecipesInput } })
    }
  }, [search])

  if (filterRecipeResults.loading || tagResults.loading) return <LoadingSpinner />
  if (filterRecipeResults.error || tagResults.error) return <p>Error :(</p>

  function onSubmitFilter(data: FilterRecipesInput) {
    const filterRecipesInput: FilterRecipesInput = {
      name: data.name,
      tags: data.tags
    }
    history.replace({
      pathname: '/search',
      search: '?filter=' + JSON.stringify(filterRecipesInput)
    })
    filterRecipes({ variables: { filterRecipesInput } })
  }

  return <div>
    <TopBar />
    <div className="container px-4">
      <div className="flex bg-white shadow rounded-lg p-4">
        <form onSubmit={handleSubmit(onSubmitFilter)}>
          <div className="grid grid-cols-5 gap-4">
            <input className="col-span-2 block w-full rounded-md border-gray-300 shadow-sm" type="text" placeholder="Search..." {...register('name')} />
            <Controller
              control={control}
              name="tags"
              render={({ field }) => (<Select
                styles={{
                  control: base => ({
                    ...base,
                    height: 48
                  })
                }}
                className="col-span-2 block w-full rounded-md border-gray-300 shadow-sm text-black"
                inputRef={field.ref}
                options={tagResults.data.tags.map((t: string) => ({ value: t, label: t }))}
                value={field.value.map((t) => ({ value: t, label: t }))}
                onChange={(options) => field.onChange(options.map((o) => o.value))}
                isMulti
              />)}
            />
            <button className="col-span-1 rounded-full shadow bg-pink-400 text-white w-11" type="submit">
              <SearchIcon className="m-auto" size={24}/>
            </button>
          </div>
        </form>
      </div>
      <div className="grid grid-cols-4 gap-4 mt-4">
        {
          !!filterRecipeResults.data && filterRecipeResults.data.filterRecipes.map((recipe: RecipeDTO) => <RecipeCard recipe={recipe} key={recipe.id} />)
        }
      </div>
    </div>
  </div>
}
