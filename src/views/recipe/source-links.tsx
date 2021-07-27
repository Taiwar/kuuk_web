import { gql, useMutation } from '@apollo/client'
import React, { useRef, useState } from 'react'
import { Pencil, PencilFill, Plus, Trash, X } from 'react-bootstrap-icons'
import { RecipeDTO, UpdateRecipeInput } from '../../shared/graphql'

const UPDATE_RECIPE = gql`
    mutation UpdateRecipe($updateRecipeInput: UpdateRecipeInput!) {
        updateRecipe(updateRecipeInput: $updateRecipeInput) {
            id
            slug
            sourceLinks
        }
    }
`

export function RecipeSourceLinks(props: { recipe: RecipeDTO }) {
  const { recipe } = props
  const inputRef = useRef<HTMLInputElement>(null)
  const [editable, setEditable] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [newSourceLink, setNewSourceLink] = useState('')
  const [updateRecipe] = useMutation(UPDATE_RECIPE, {
    update(cache, { data: { updateRecipe } }) {
      if (!updateRecipe) return
      cache.modify({
        fields: {
          recipeBySlug(recipeBySlugRef) {
            cache.modify({
              id: recipeBySlugRef.__ref,
              fields: {
                sourceLinks() {
                  return updateRecipe.sourceLinks
                }
              }
            })
            return recipeBySlugRef
          }
        }
      })
    }
  })

  function handleCancel(e: any) {
    e.preventDefault()
    setShowForm(false)
  }

  function handleClickAdd() {
    setShowForm(true)
  }

  function handleClickRemove(sourceLink: string) {
    const updateRecipeInput: UpdateRecipeInput = {
      id: recipe.id,
      sourceLinks: recipe.sourceLinks.filter((s) => s !== sourceLink)
    }
    updateRecipe({
      variables: { updateRecipeInput },
      optimisticResponse: {
        updateRecipe: {
          __typename: 'RecipeDTO',
          id: recipe.id,
          sourceLinks: updateRecipeInput.sourceLinks
        }
      }
    })
  }

  function handleAddSourceLink(sourceLink: string) {
    const updateRecipeInput: UpdateRecipeInput = {
      id: recipe.id,
      sourceLinks: [...recipe.sourceLinks, sourceLink]
    }
    updateRecipe({
      variables: { updateRecipeInput },
      optimisticResponse: {
        updateRecipe: {
          __typename: 'RecipeDTO',
          id: recipe.id,
          sourceLinks: updateRecipeInput.sourceLinks ?? []
        }
      }
    }).then(() => {
      setShowForm(false)
      setNewSourceLink('')
    })
  }

  function handleSubmit() {
    if (newSourceLink) {
      handleAddSourceLink(newSourceLink)
    }
  }

  function handleClickEdit() {
    setEditable(!editable)
  }

  return <div>
    <div className="flex">
      <h4 className="flex text-xl my-3">{`Source${recipe.sourceLinks.length === 1 ? '' : 's'}`}</h4>
      <div hidden={showForm} className="flex ml-2 mt-3 justify-center">
        <button className="rounded-full w-7 h-7 shadow bg-pink-400 text-white hover:shadow-lg pl-1" onClick={handleClickAdd}>
          <Plus size={20}/>
        </button>
        <button hidden={recipe.sourceLinks.length < 1} className="rounded-full w-7 h-7 shadow bg-pink-400 text-white ml-1 hover:shadow-lg pl-2" onClick={handleClickEdit}>
          { editable ? <Pencil size={10} /> : <PencilFill size={10}/> }
        </button>
      </div>
    </div>
    <div className="mb-4">
      {
        recipe.sourceLinks.map((sourceLink, i) => (
            <div key={i} className="flex mt-1">
              <span className={`inline-block bg-pink-400 rounded-full mb-1 mr-2 w-3 h-3 my-auto ${editable ? 'hidden' : ''}`} />
              <button hidden={!editable} className="rounded-full p-1 shadow bg-pink-400 text-white ml-1" onClick={() => handleClickRemove(sourceLink)}>
                <Trash size={16}/>
              </button>
              <p className="col-span-6 inline ml-1">{sourceLink}</p>
            </div>
        ))
      }
    </div>
    <div className={`grid grid-cols-4 gap-2 lg:w-1/2 ${showForm ? '' : 'hidden'}`}>
      <div className="col-span-3">
        <input
          value={newSourceLink}
          onChange={(e) => setNewSourceLink(e.target.value)}
          ref={inputRef}
          required
          className="block w-full rounded-md border-gray-300 shadow-sm"
          type="text"
          placeholder="Source*"
          onKeyPress={(e) => e.key === 'Enter' ? handleSubmit() : null}/>
      </div>
      <div className="col-span-1">
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
