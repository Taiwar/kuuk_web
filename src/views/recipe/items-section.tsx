import React, { useState } from 'react'
import { RecipeSectionHeader } from '../../components/recipe-section-header'
import { GroupItemTypes } from '../../shared/constants'
import { GroupItem } from './groups/group-item'
import { GroupDTO } from '../../shared/graphql'
import { DragDropContext, DropResult } from 'react-beautiful-dnd'

type RecipeGroupProps = {
  recipeId: string,
  title: string,
  groups: GroupDTO[],
  itemType: GroupItemTypes,
  add: (input: any) => Promise<any>,
  update: (input: any, prevGroupId: string, prevSortNr?: number) => Promise<any>,
  delete: (id: string, groupId: string, sortNr: number) => Promise<any>,
}

export function RecipeItemsSection(props: RecipeGroupProps) {
  const [groupsEditable, setGroupsEditable] = useState(false)

  function onDragEnd(result: DropResult) {
    const newSortNr = result.destination?.index
    const isSameGroup = result.source.droppableId === result.destination?.droppableId
    const isSameIndex = result.source.index === result.destination?.index
    const hasNoTarget = result.destination?.index === undefined
    if (hasNoTarget || (isSameGroup && isSameIndex)) {
      return
    }
    console.log('moving', result.source.index, 'to', newSortNr)
    return props.update({
      id: result.draggableId,
      sortNr: newSortNr === 0 ? 1 : newSortNr,
      groupID: result.destination?.droppableId
    }, result.source.droppableId, result.source.index)
  }

  return <div>
    <RecipeSectionHeader recipeId={props.recipeId} title={props.title} itemType={props.itemType} editable={groupsEditable} setEditable={setGroupsEditable} />
    <div className="mb-4">
      <DragDropContext onDragEnd={onDragEnd}>
        {
          [...props.groups]
            .sort((a, b) => a.sortNr - b.sortNr)
            .map((group) =>
                  <GroupItem
                      key={group.id}
                      group={group}
                      add={props.add}
                      update={props.update}
                      delete={props.delete}
                      editable={groupsEditable}
                  />
            )
        }
      </DragDropContext>
    </div>
  </div>
}
