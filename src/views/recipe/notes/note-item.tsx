import React, { SyntheticEvent, useState } from 'react';
import { useForm } from 'react-hook-form';
import { CancelButton } from '../../../components/buttons/cancel-button';
import { DeleteButton } from '../../../components/buttons/delete-button';
import { SubmitButton } from '../../../components/buttons/submit-button';
import { NoteDTO, UpdateNoteInput } from '../../../shared/graphql';

type NoteItemProps = {
  note: NoteDTO;
  editable: boolean;
  updateNote: (input: UpdateNoteInput) => void;
  deleteNote: (id: string) => void;
};

export function NoteItem(props: NoteItemProps): JSX.Element {
  const { note, editable, updateNote, deleteNote } = props;
  const { register, handleSubmit } = useForm({
    defaultValues: {
      name: note.name,
      description: note.description,
    },
  });
  const [fieldsEditable, setFieldsEditable] = useState(false);

  function handleOnFormDoubleClick() {
    if (editable) {
      setFieldsEditable(true);
    }
  }

  function onSubmit(data: UpdateNoteInput) {
    const updateNoteInput: UpdateNoteInput = {
      id: note.id,
      name: data.name,
      description: data.description,
    };
    updateNote(updateNoteInput);
    setFieldsEditable(false);
  }

  function handleOnDelete() {
    deleteNote(note.id);
  }

  function handleCancel(e: SyntheticEvent) {
    e.preventDefault();
    setFieldsEditable(false);
  }

  return (
    <div key={note.id} className="flex max-w-3xl">
      <DeleteButton
        className="mt-1.5 mr-1"
        hidden={!editable}
        onClick={handleOnDelete}
      />
      <form className="flex" onSubmit={handleSubmit(onSubmit)}>
        <div
          className="flex justify-center"
          onDoubleClick={handleOnFormDoubleClick}
        >
          <span className="flex-shrink-0 bg-pink-400 text-white text-center rounded-full mr-1 mt-0.5 w-6 pb-0.5">
            {note.sortNr}
          </span>
          <span
            className={`flex-initial mt-1.5 font-bold ${
              fieldsEditable ? 'hidden' : ''
            }`}
          >
            {note.name}
          </span>
          <input
            hidden={!fieldsEditable}
            required
            className={`flex-initial mr-2 h-12 rounded-md border-gray-300 shadow-sm ${
              fieldsEditable ? '' : 'hidden'
            }`}
            type="text"
            placeholder="Name*"
            {...register('name')}
          />

          <p
            className={`flex-initial mt-1.5 ml-1 ${
              fieldsEditable ? 'hidden' : ''
            }`}
          >
            {note.description}
          </p>
          <textarea
            className={`flex-initial rounded-md border-gray-300 shadow-sm ${
              !fieldsEditable ? 'hidden' : ''
            }`}
            placeholder="Description"
            {...register('description')}
          />

          <div className={`flex-initial ${!fieldsEditable ? 'hidden' : ''}`}>
            <SubmitButton className="ml-1" size={8} />
          </div>
          <div className={`flex-initial ${!fieldsEditable ? 'hidden' : ''}`}>
            <CancelButton className="ml-1" onClick={handleCancel} />
          </div>
        </div>
      </form>
    </div>
  );
}
