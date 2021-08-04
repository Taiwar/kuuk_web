import { ApolloCache, gql } from '@apollo/client'
import { GroupItemDeletionResponse, IngredientUpdateResponse } from './graphql'

export default class CacheHelper {
  private static NewIngredientFragment = gql`
      fragment NewIngredient on IngredientDTO {
          name
          amount
          unit
          groupID
          sortNr
      }
  `

  private static buildIngredientCacheId(ingredientId: string) {
    return `IngredientDTO:${ingredientId}`
  }

  private static buildGroupCacheId(groupId: string) {
    return `GroupDTO:${groupId}`
  }

  static removeIngredient(cache: ApolloCache<any>, deletionResponse: GroupItemDeletionResponse) {
    cache.modify({
      id: CacheHelper.buildGroupCacheId(deletionResponse.groupID),
      fields: {
        items(existingItems = []) {
          if (deletionResponse.success) {
            const itemRemoved = existingItems.filter((i: {__ref: string}) => CacheHelper.buildIngredientCacheId(deletionResponse.id) !== i.__ref)
            for (const item of itemRemoved) {
              cache.modify({
                id: item.__ref,
                fields: {
                  sortNr(itemSortNr: number) {
                    if (itemSortNr > deletionResponse.sortNr) {
                      return itemSortNr - 1
                    }
                    return itemSortNr
                  }
                }
              })
            }
            return itemRemoved
          }
          return existingItems
        }
      }
    })
  }

  static updateIngredient(cache: ApolloCache<any>, updateIngredient: IngredientUpdateResponse) {
    cache.modify({
      id: CacheHelper.buildGroupCacheId(updateIngredient.groupID),
      fields: {
        items(existingItems = []) {
          const oldItemRemoved = existingItems.filter((i: { __ref: string }) => CacheHelper.buildIngredientCacheId(updateIngredient.id) !== i.__ref)
          const ref = cache.writeFragment({
            id: CacheHelper.buildIngredientCacheId(updateIngredient.id),
            data: {
              name: updateIngredient.name,
              amount: updateIngredient.amount,
              unit: updateIngredient.unit,
              groupID: updateIngredient.groupID,
              sortNr: updateIngredient.sortNr
            },
            fragment: CacheHelper.NewIngredientFragment
          })
          const newSortNr = updateIngredient.sortNr
          const isMovingGroups = updateIngredient.groupID && updateIngredient.prevGroupID && updateIngredient.prevGroupID.toString() !== updateIngredient.groupID.toString()
          const isMovingPosition = updateIngredient.prevSortNr !== newSortNr
          for (const item of oldItemRemoved) {
            cache.modify({
              id: item.__ref,
              fields: {
                sortNr(itemSortNr: number) {
                  if (updateIngredient.prevSortNr) {
                    if (isMovingPosition || isMovingGroups) {
                      if (!isMovingGroups && newSortNr > updateIngredient.prevSortNr) {
                        if (itemSortNr <= newSortNr) {
                          return itemSortNr - 1
                        }
                      } else {
                        if (itemSortNr >= newSortNr) {
                          return itemSortNr + 1
                        }
                      }
                    }
                  }
                  return itemSortNr
                }
              }
            })
          }
          if (isMovingGroups) {
            CacheHelper.removeIngredient(cache, {
              id: updateIngredient.id,
              groupID: updateIngredient.prevGroupID ?? '',
              success: true,
              sortNr: updateIngredient.prevSortNr ?? 1
            })
          }
          return [...oldItemRemoved, ref]
        }
      }
    })
  }
}
