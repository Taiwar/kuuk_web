import React, { useState } from 'react'
import { GroupDTO, IngredientDTO, NoteDTO, StepDTO } from '../../../shared/graphql'
import { DEFAULT_GROUP_NAME, GroupItemTypes } from '../../../shared/constants'
import { IngredientItem } from '../ingredients/ingredient-item'
import { NoteItem } from '../notes/note-item'
import { StepItem } from '../steps/step-item'
import { Pencil, PencilFill, Plus, Trash } from 'react-bootstrap-icons'
import { IngredientForm } from '../ingredients/ingredient-form'
import { StepForm } from '../steps/step-form'
import { NoteForm } from '../notes/note-form'
import { gql, useMutation } from '@apollo/client'

const REMOVE_GROUP = gql`
    mutation RemoveGroup($groupId: String!) {
        removeGroup(groupID: $groupId) {
            id
            success
        }
    }
`

export type ItemGroupProps = {
  group: GroupDTO,
  add: (input: any) => Promise<any>,
  update: (input: any) => Promise<any>,
  delete: (id: string, groupId: string) => Promise<any>,
  editable: boolean
}

export function GroupItem(props: ItemGroupProps) {
  const isDefaultGroup = props.group.name === DEFAULT_GROUP_NAME
  const [itemEditable, setItemEditable] = useState(false)
  const [showItemForm, setShowItemForm] = useState(false)
  const [removeGroup] = useMutation(REMOVE_GROUP, {
    update(cache, { data: { removeGroup } }) {
      cache.modify({
        id: `RecipeDTO:${props.group.recipeID}`,
        fields: {
          ingredients(existingGroups = []) {
            if (props.group.itemType !== GroupItemTypes.IngredientBE) return existingGroups
            if (removeGroup.success) {
              return existingGroups.filter((i: {__ref: string}) => `GroupDTO:${removeGroup.id}` !== i.__ref)
            }
          },
          steps(existingGroups = []) {
            if (props.group.itemType !== GroupItemTypes.StepBE) return existingGroups
            if (removeGroup.success) {
              return existingGroups.filter((i: {__ref: string}) => `GroupDTO:${removeGroup.id}` !== i.__ref)
            }
          },
          notes(existingGroups = []) {
            if (props.group.itemType !== GroupItemTypes.NoteBE) return existingGroups
            if (removeGroup.success) {
              return existingGroups.filter((i: {__ref: string}) => `GroupDTO:${removeGroup.id}` !== i.__ref)
            }
          }
        }
      })
    }
  })

  function handleClickAdd() {
    setShowItemForm(true)
  }

  function handleClickEdit() {
    setItemEditable(!itemEditable)
  }

  function handleItemAdd(data: any) {
    return props.add({
      ...data,
      groupID: props.group.id
    })
  }

  function handleItemDelete(id: string) {
    return props.delete(id, props.group.id)
  }

  function handleGroupDelete() {
    return removeGroup({
      variables: { groupId: props.group.id },
      optimisticResponse: {
        removeGroup: {
          id: props.group.id,
          success: true,
          __typename: 'DeletionResponse'
        }
      }
    })
  }

  let itemForm = null

  switch (props.group.itemType) {
    case GroupItemTypes.IngredientBE:
      itemForm = <IngredientForm onAdd={handleItemAdd} showForm={showItemForm} setShowForm={setShowItemForm}/>
      break
    case GroupItemTypes.StepBE:
      itemForm = <StepForm onAdd={handleItemAdd} showForm={showItemForm} setShowForm={setShowItemForm}/>
      break
    case GroupItemTypes.NoteBE:
      itemForm = <NoteForm onAdd={handleItemAdd} showForm={showItemForm} setShowForm={setShowItemForm}/>
      break
    default:
      break
  }

  return <div className="mt-2">
    <div className="flex">
      <button hidden={isDefaultGroup || !props.editable} className="h-8 w-8 rounded-full px-2 my-0.5 shadow bg-pink-400 text-white mr-1" onClick={handleGroupDelete}>
        <Trash size={16}/>
      </button>
      <h4 className="text-xl">{isDefaultGroup ? 'General' : props.group.name}</h4>
      <div hidden={showItemForm} className="flex ml-2 justify-center">
        <button className="rounded-full h-8 w-8 shadow bg-pink-400 text-white hover:shadow-lg pl-1" onClick={handleClickAdd}>
          <Plus size={24}/>
        </button>
        <button hidden={props.group.items.length < 1} className="rounded-full h-8 w-8 shadow bg-pink-400 text-white hover:shadow-lg pl-2.5 ml-1" onClick={handleClickEdit}>
          { itemEditable ? <Pencil size={12} /> : <PencilFill size={12}/> }
        </button>
      </div>
    </div>
    {
      [...props.group.items]
        .sort((a, b) => a.sortNr - b.sortNr)
        .map((item, i) => {
          switch (props.group.itemType) {
            case GroupItemTypes.IngredientBE:
              return <IngredientItem key={i} ingredient={item as IngredientDTO} editable={itemEditable} updateIngredient={props.update} deleteIngredient={handleItemDelete} />
            case GroupItemTypes.StepBE:
              return <StepItem key={i} step={item as StepDTO} editable={itemEditable} updateStep={props.update} deleteStep={handleItemDelete} />
            case GroupItemTypes.NoteBE:
              return <NoteItem key={i} note={item as NoteDTO} editable={itemEditable} updateNote={props.update} deleteNote={handleItemDelete} />
            default:
              return <p key={i}>Unknown item {item}</p>
          }
        })
    }
    {
      itemForm
    }
  </div>
}
