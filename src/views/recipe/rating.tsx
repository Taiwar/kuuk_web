import { gql, useMutation } from '@apollo/client'
import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { RecipeDTO, UpdateRecipeInput } from '../../shared/graphql'

const UPDATE_RECIPE = gql`
    mutation UpdateRecipe($updateRecipeInput: UpdateRecipeInput!) {
        updateRecipe(updateRecipeInput: $updateRecipeInput) {
            id
            slug
            rating
        }
    }
`

export function RecipeRating(props: { recipe: RecipeDTO, size: 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' }) {
  const { recipe, size } = props
  const defaultRating = 0
  const { register, watch } = useForm({
    defaultValues: {
      rating: recipe.rating ?? defaultRating
    }
  })
  const watchRating = parseInt(watch('rating', recipe.rating ?? defaultRating).toString())
  const [updateRecipe] = useMutation(UPDATE_RECIPE, {
    update(cache, { data: { updateRecipe } }) {
      if (!updateRecipe) return
      cache.modify({
        fields: {
          recipeBySlug(recipeBySlugRef) {
            cache.modify({
              id: recipeBySlugRef.__ref,
              fields: {
                rating() {
                  return updateRecipe.rating
                }
              }
            })
            return recipeBySlugRef
          }
        }
      })
    }
  })

  useEffect(() => {
    if (watchRating !== recipe.rating) {
      const updateRecipeInput: UpdateRecipeInput = {
        id: recipe.id,
        rating: watchRating
      }
      console.log('updating rating', updateRecipeInput)
      updateRecipe({
        variables: { updateRecipeInput },
        optimisticResponse: {
          updateRecipe: {
            __typename: 'RecipeDTO',
            id: recipe.id,
            rating: updateRecipeInput.rating
          }
        }
      })
    }
  }, [watchRating])

  console.log('rating', recipe.rating)

  return <div className="star-rating">
    <fieldset>
      <input id="star1" checked={recipe.rating === 5} type="radio" value={5} {...register('rating')} />
      <label className={`text-${size}`} htmlFor="star1" title="Outstanding">1 stars</label>
      <input id="star2" checked={recipe.rating === 4} type="radio" value={4} {...register('rating')} />
      <label className={`text-${size}`} htmlFor="star2" title="Outstanding">2 stars</label>
      <input id="star3" checked={recipe.rating === 3} type="radio" value={3} {...register('rating')} />
      <label className={`text-${size}`} htmlFor="star3" title="Outstanding">3 stars</label>
      <input id="star4" checked={recipe.rating === 2} type="radio" value={2} {...register('rating')} />
      <label className={`text-${size}`} htmlFor="star4" title="Outstanding">4 stars</label>
      <input id="star5" checked={recipe.rating === 1} type="radio" value={1} {...register('rating')} />
      <label className={`text-${size}`} htmlFor="star5" title="Outstanding">5 stars</label>
    </fieldset>
  </div>
}
