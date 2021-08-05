import { ApolloCache, DocumentNode, gql, Reference } from '@apollo/client'
import {
  GroupItemDeletionResponse,
  GroupItemDTO,
  GroupItemUpdateResponse,
  IngredientDTO,
  NoteDTO,
  StepDTO
} from './graphql'
import { ReorderingHelper } from './reordering-helper'
import { GroupItemTypes } from './constants'

export default class CacheHelper {
  private static NewIngredientFragment = gql`
      fragment NewIngredient on IngredientDTO {
          name
          groupID
          sortNr
          amount
          unit
      }
  `
  private static NewStepFragment = gql`
      fragment NewStep on StepDTO {
          name
          groupID
          sortNr
          description
          picture
      }
  `
  private static NewNoteFragment = gql`
      fragment NewNote on NoteDTO {
          name
          groupID
          sortNr
          description
      }
  `
  private static ItemTypeMap = new Map<GroupItemTypes, string>([
    [GroupItemTypes.IngredientBE, 'IngredientDTO'],
    [GroupItemTypes.StepBE, 'StepDTO'],
    [GroupItemTypes.NoteBE, 'NoteDTO']
  ])

  private static buildItemCacheId(id: string, itemType: GroupItemTypes) {
    return `${this.ItemTypeMap.get(itemType)}:${id}`
  }

  private static buildGroupCacheId(groupId: string) {
    return `GroupDTO:${groupId}`
  }

  private static writeItemToCache(cache: ApolloCache<any>, item: GroupItemDTO, itemType: GroupItemTypes): Reference | undefined {
    let updateProps = {}
    let itemFragment: DocumentNode | null = null
    switch (itemType) {
      case GroupItemTypes.IngredientBE:
        updateProps = {
          amount: (item as IngredientDTO).amount,
          unit: (item as IngredientDTO).unit
        }
        itemFragment = this.NewIngredientFragment
        break
      case GroupItemTypes.StepBE:
        updateProps = {
          description: (item as StepDTO).description,
          picture: (item as StepDTO).picture
        }
        itemFragment = this.NewStepFragment
        break
      case GroupItemTypes.NoteBE:
        updateProps = {
          description: (item as NoteDTO).description
        }
        itemFragment = this.NewNoteFragment
        break
    }
    if (!itemFragment) {
      return
    }
    return cache.writeFragment({
      id: this.buildItemCacheId(item.id, itemType),
      data: {
        name: item.name,
        groupID: item.groupID,
        sortNr: item.sortNr,
        ...updateProps
      },
      fragment: itemFragment
    })
  }

  static addItem(cache: ApolloCache<any>, itemDTO: IngredientDTO | StepDTO | NoteDTO, itemType: GroupItemTypes) {
    cache.modify({
      id: this.buildGroupCacheId(itemDTO.groupID),
      fields: {
        items(existingItems = []) {
          const ref = CacheHelper.writeItemToCache(cache, itemDTO, itemType)
          return [...existingItems, ref]
        }
      }
    })
  }

  static removeItem(cache: ApolloCache<any>, deletionResponse: GroupItemDeletionResponse, itemType: GroupItemTypes) {
    cache.modify({
      id: this.buildGroupCacheId(deletionResponse.groupID),
      fields: {
        items(existingItems = []) {
          if (deletionResponse.success) {
            const itemRemoved = existingItems.filter((i: {__ref: string}) => CacheHelper.buildItemCacheId(deletionResponse.id, itemType) !== i.__ref)
            for (const item of itemRemoved) {
              cache.modify({
                id: item.__ref,
                fields: {
                  sortNr(itemSortNr: number) {
                    return ReorderingHelper.sortNrAfterDeletion(itemSortNr, deletionResponse.sortNr)
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

  static updateItem(cache: ApolloCache<any>, updateItemResponse: GroupItemUpdateResponse, itemType: GroupItemTypes) {
    cache.modify({
      id: this.buildGroupCacheId(updateItemResponse.item.groupID),
      fields: {
        items(existingItems = []) {
          const itemCacheId = CacheHelper.buildItemCacheId(updateItemResponse.item.id, itemType)
          const oldItemRemoved = existingItems.filter((i: { __ref: string }) => itemCacheId !== i.__ref)
          const ref = CacheHelper.writeItemToCache(cache, updateItemResponse.item, itemType)
          const newSortNr = updateItemResponse.item.sortNr
          const isMovingGroups = (updateItemResponse.item.groupID && updateItemResponse.prevGroupID &&
              updateItemResponse.prevGroupID.toString() !== updateItemResponse.item.groupID.toString()) as boolean
          const isMovingPosition = updateItemResponse.prevSortNr !== newSortNr
          for (const item of oldItemRemoved) {
            cache.modify({
              id: item.__ref,
              fields: {
                sortNr(itemSortNr: number) {
                  const resultNr = ReorderingHelper.sortNrAfterReorder(itemSortNr, newSortNr, isMovingPosition, isMovingGroups, updateItemResponse.prevSortNr)
                  if (resultNr < 1) {
                    console.error('ResultNr < 1!', resultNr)
                    console.error(itemSortNr, newSortNr, isMovingPosition, isMovingGroups, updateItemResponse.prevSortNr)
                  }
                  return resultNr
                }
              }
            })
          }
          if (isMovingGroups) {
            CacheHelper.removeItem(cache, {
              id: updateItemResponse.item.id,
              groupID: updateItemResponse.prevGroupID ?? '',
              success: true,
              sortNr: updateItemResponse.prevSortNr ?? 1
            }, itemType)
          }
          if (ref === undefined) {
            console.error('Updated item ref was undefined! Falling back to original state.')
            return existingItems
          } else {
            return [...oldItemRemoved, ref]
          }
        }
      }
    })
  }
}
