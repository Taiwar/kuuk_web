import { FetchResult } from '@apollo/client';
import React, { SyntheticEvent, useEffect, useRef } from 'react';
import { CancelButton } from '../../../components/buttons/cancel-button';
import { SubmitButton } from '../../../components/buttons/submit-button';
import { AddIngredientInput } from '../../../shared/graphql';
import { useForm } from 'react-hook-form';

type IngredientFormProps = {
  showForm: boolean;
  setShowForm: (showForm: boolean) => void;
  onAdd: (input: AddIngredientInput) => Promise<FetchResult>;
};

export function IngredientForm(props: IngredientFormProps): JSX.Element {
  const formRef = useRef<HTMLFormElement>(null);
  const { register, handleSubmit, reset, setFocus } =
    useForm<AddIngredientInput>();

  useEffect(() => {
    if (props.showForm) {
      window.scrollTo({ top: formRef.current?.offsetTop });
      setFocus('amount');
    }
  }, [props.showForm]);

  function handleCancel(e: SyntheticEvent) {
    e.preventDefault();
    props.setShowForm(false);
  }

  function onSubmit(data: AddIngredientInput) {
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
            type="number"
            placeholder="Amount*"
            {...register('amount')}
          />
        </div>
        <div className="flex-initial ml-2">
          <input
            required
            className="block w-full rounded-md border-gray-300 shadow-sm"
            type="text"
            placeholder="Unit*"
            {...register('unit')}
          />
        </div>
        <div className="flex-initial ml-2">
          <input
            required
            className="block w-full rounded-md border-gray-300 shadow-sm"
            type="text"
            placeholder="Name*"
            {...register('name')}
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
