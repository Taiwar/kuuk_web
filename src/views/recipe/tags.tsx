import { gql, useMutation } from '@apollo/client'
import React, { useRef, useState } from 'react'
import { Plus, X } from 'react-bootstrap-icons'
import { RecipeDTO, UpdateRecipeInput } from '../../shared/graphql'

const UPDATE_RECIPE = gql`
    mutation UpdateRecipe($updateRecipeInput: UpdateRecipeInput!) {
        updateRecipe(updateRecipeInput: $updateRecipeInput) {
            id
            slug
            tags
        }
    }
`

export function RecipeTags(props: { recipe: RecipeDTO }) {
  const { recipe } = props
  const inputRef = useRef<HTMLInputElement>(null)
  const [newTag, setNewTag] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [updateRecipe] = useMutation(UPDATE_RECIPE, {
    update(cache, { data: { updateRecipe } }) {
      if (!updateRecipe) return
      cache.modify({
        fields: {
          recipeBySlug(recipeBySlugRef) {
            cache.modify({
              id: recipeBySlugRef.__ref,
              fields: {
                tags() {
                  return updateRecipe.tags
                }
              }
            })
            return recipeBySlugRef
          }
        }
      })
    }
  })

  function handleClickAdd() {
    setShowForm(true)
  }

  function handleCancel(e: any) {
    setShowForm(false)
  }

  function handleAddTag(tag: string) {
    const updateRecipeInput: UpdateRecipeInput = {
      id: recipe.id,
      tags: [...recipe.tags, tag]
    }
    updateRecipe({
      variables: { updateRecipeInput },
      optimisticResponse: {
        updateRecipe: {
          __typename: 'RecipeDTO',
          id: recipe.id,
          tags: updateRecipeInput.tags
        }
      }
    }).then(() => setNewTag(''))
  }

  function handleSubmit() {
    if (newTag) {
      handleAddTag(newTag)
    }
  }

  return <div className='my-3 flex flex-wrap items-center justify-center'>
    <div>
    {
      recipe.tags.map((tag) => <span
          key={tag}
          className="m-1 bg-gray-100 hover:bg-gray-200 rounded-full px-2 font-bold text-sm leading-loose cursor-pointer py-1">{tag}
      </span>
      )
    }
    <span hidden={showForm} className="m-1 bg-gray-100 hover:bg-gray-200 rounded-full px-2 font-bold text-sm leading-loose cursor-pointer py-1" onClick={handleClickAdd}>
      + Add tag
    </span>
    </div>
    <div className={`grid grid-cols-2 gap-2 ${showForm ? '' : 'hidden'}`}>
      <input
        value={newTag}
        onChange={(e) => setNewTag(e.target.value)}
        ref={inputRef}
        type="text"
        required
        className="block rounded-md border-gray-300 shadow-sm"
        placeholder="Tag name*"
        onKeyPress={(e) => e.key === 'Enter' ? handleSubmit() : null}/>
      <div className="mt-1">
        <button className="rounded-full p-1 shadow bg-pink-200" onClick={handleSubmit}>
          <Plus size={24}/>
        </button>
        <button className="rounded-full p-1 shadow bg-pink-200 ml-1" onClick={handleCancel}>
          <X size={24}/>
        </button>
      </div>
    </div>
  </div>
}
