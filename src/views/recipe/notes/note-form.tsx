import { FetchResult } from '@apollo/client';
import React, { SyntheticEvent, useEffect, useRef } from 'react';
import { CancelButton } from '../../../components/buttons/cancel-button';
import { SubmitButton } from '../../../components/buttons/submit-button';
import { AddNoteInput } from '../../../shared/graphql';
import { useForm } from 'react-hook-form';

type NoteFormProps = {
  showForm: boolean;
  setShowForm: (showForm: boolean) => void;
  onAdd: (input: AddNoteInput) => Promise<FetchResult>;
};

export function NoteForm(props: NoteFormProps): JSX.Element {
  const formRef = useRef<HTMLFormElement>(null);
  const { register, handleSubmit, reset, setFocus } = useForm<AddNoteInput>();

  useEffect(() => {
    if (props.showForm) {
      window.scrollTo({ top: formRef.current?.offsetTop });
      setFocus('name');
    }
  }, [props.showForm]);

  function handleCancel(e: SyntheticEvent) {
    e.preventDefault();
    props.setShowForm(false);
  }

  function onSubmit(data: AddNoteInput) {
    props.onAdd(data).then(() => reset());
  }

  return (
    <form
      ref={formRef}
      hidden={!props.showForm}
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="flex lg:w-1/2">
        <div className="flex-initial ml-2">
          <input
            required
            className="block w-full rounded-md border-gray-300 shadow-sm"
            type="text"
            placeholder="Name*"
            {...register('name')}
          />
        </div>
        <div className="flex-initial ml-2">
          <textarea
            className="block w-full rounded-md border-gray-300 shadow-sm"
            placeholder="Description"
            {...register('description')}
          />
        </div>
        <div className="flex-initial ml-1">
          <SubmitButton size={8} />
        </div>
        <div className="flex-initial ml-1">
          <CancelButton onClick={handleCancel} />
        </div>
      </div>
    </form>
  );
}
