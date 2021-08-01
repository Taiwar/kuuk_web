import React, { useState } from 'react'
import { RecipeSectionHeader } from '../../components/recipe-section-header'
import { GroupItemTypes } from '../../shared/constants'
import { GroupItem } from './groups/group-item'
import { GroupDTO } from '../../shared/graphql'

type RecipeGroupProps = {
  recipeId: string,
  title: string,
  groups: GroupDTO[],
  itemType: GroupItemTypes,
  add: (input: any) => Promise<any>,
  update: (input: any) => Promise<any>,
  delete: (id: string, groupId: string) => Promise<any>,
}

export function RecipeItemsSection(props: RecipeGroupProps) {
  const [groupsEditable, setGroupsEditable] = useState(false)

  return <div>
    <RecipeSectionHeader recipeId={props.recipeId} title={props.title} itemType={props.itemType} editable={groupsEditable} setEditable={setGroupsEditable} />
    <div className="mb-4">
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
    </div>
  </div>
}
