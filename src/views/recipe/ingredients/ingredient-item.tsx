import React, { SyntheticEvent, useState } from 'react';
import { useForm } from 'react-hook-form';
import { CancelButton } from '../../../components/buttons/cancel-button';
import { DeleteButton } from '../../../components/buttons/delete-button';
import { SubmitButton } from '../../../components/buttons/submit-button';
import { IngredientDTO, UpdateIngredientInput } from '../../../shared/graphql';

type IngredientItemProps = {
  ingredient: IngredientDTO;
  editable: boolean;
  updateIngredient: (input: UpdateIngredientInput) => void;
  deleteIngredient: (id: string) => void;
};

export function IngredientItem(props: IngredientItemProps): JSX.Element {
  const { ingredient, editable, updateIngredient, deleteIngredient } = props;
  const { register, handleSubmit } = useForm({
    defaultValues: {
      amount: ingredient.amount,
      unit: ingredient.unit,
      name: ingredient.name,
    },
  });
  const [fieldsEditable, setFieldsEditable] = useState(false);

  function handleOnFormDoubleClick() {
    if (editable) {
      setFieldsEditable(true);
    }
  }

  function onSubmit(data: UpdateIngredientInput & { amount: string }) {
    const updateIngredientInput: UpdateIngredientInput = {
      id: ingredient.id,
      name: data.name,
      amount: parseFloat(data.amount),
      unit: data.unit,
    };
    updateIngredient(updateIngredientInput);
    setFieldsEditable(false);
  }

  function handleOnDelete() {
    deleteIngredient(ingredient.id);
  }

  function handleCancel(e: SyntheticEvent) {
    e.preventDefault();
    setFieldsEditable(false);
  }

  return (
    <div className="flex">
      <DeleteButton
        hidden={!editable}
        className="flex-initial ml-1"
        onClick={handleOnDelete}
      />
      <input className="mx-2 mt-1" type="checkbox" />
      <form className="flex-1" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex" onDoubleClick={handleOnFormDoubleClick}>
          <span hidden={fieldsEditable} className="font-bold flex-initial">
            {ingredient.amount}
          </span>
          <input
            hidden={!fieldsEditable}
            required
            className={`flex-initial mx-2 w-20 rounded-md border-gray-300 shadow-sm ${
              fieldsEditable ? '' : 'hidden'
            }`}
            type="number"
            placeholder="Amount*"
            {...register('amount')}
          />
          <span hidden={fieldsEditable} className="flex-initial font-bold mr-1">
            {ingredient.unit}
          </span>
          <input
            hidden={!fieldsEditable}
            required
            className={`flex-initial mx-2 w-20 rounded-md border-gray-300 shadow-sm ${
              fieldsEditable ? '' : 'hidden'
            }`}
            type="text"
            placeholder="Unit*"
            {...register('unit')}
          />
          <span className="flex-initial" hidden={fieldsEditable}>
            {ingredient.name}
          </span>
          <input
            hidden={!fieldsEditable}
            required
            className={`flex-initial mx-2 w-50 rounded-md border-gray-300 shadow-sm ${
              fieldsEditable ? '' : 'hidden'
            }`}
            type="text"
            placeholder="Name*"
            {...register('name')}
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
