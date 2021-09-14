import { FetchResult } from '@apollo/client';
import React, { SyntheticEvent, useEffect, useRef } from 'react';
import { CancelButton } from '../../../components/buttons/cancel-button';
import { SubmitButton } from '../../../components/buttons/submit-button';
import { AddGroupInput } from '../../../shared/graphql';
import { useForm } from 'react-hook-form';

type GroupFormProps = {
  showForm: boolean;
  setShowForm: (showForm: boolean) => void;
  onCreate: (input: AddGroupInput) => Promise<FetchResult>;
};

export function GroupForm(props: GroupFormProps): JSX.Element {
  const formRef = useRef<HTMLFormElement>(null);
  const { register, handleSubmit, reset, setFocus } = useForm<AddGroupInput>();

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

  function onSubmit(data: AddGroupInput) {
    props.onCreate(data).then(() => reset());
  }

  return (
    <form
      ref={formRef}
      hidden={!props.showForm}
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="flex lg:w-1/2">
        <div className="flex-initial">
          <input
            required
            className="block w-full rounded-md border-gray-300 shadow-sm"
            type="text"
            placeholder="Group name*"
            {...register('name')}
          />
        </div>
        <div className="flex-initial ml-1">
          <SubmitButton className="mt-1" size={12} />
        </div>
        <div className="flex-initial ml-1">
          <CancelButton className="mt-1" onClick={handleCancel} />
        </div>
      </div>
    </form>
  );
}
