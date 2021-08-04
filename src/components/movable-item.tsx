import React from 'react'
import { Draggable } from 'react-beautiful-dnd'
type MovableItemProps = {
  id: string,
  index: number,
  children: React.ReactElement
}

export function MovableItem(props: MovableItemProps) {
  const { id, index } = props

  return <Draggable draggableId={id} index={index}>
    { (provided) =>
      <div
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
      >
        {props.children}
      </div>
    }
  </Draggable>
}
