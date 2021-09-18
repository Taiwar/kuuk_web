import React, { SyntheticEvent, useState } from 'react';
import { useForm } from 'react-hook-form';
import { CancelButton } from '../../../components/buttons/cancel-button';
import { DeleteButton } from '../../../components/buttons/delete-button';
import { SubmitButton } from '../../../components/buttons/submit-button';
import { StepDTO, UpdateStepInput } from '../../../shared/graphql';

type StepItemProps = {
  step: StepDTO;
  editable: boolean;
  updateStep: (input: UpdateStepInput) => void;
  deleteStep: (id: string) => void;
};

export function StepItem(props: StepItemProps): JSX.Element {
  const { step, editable, updateStep, deleteStep } = props;
  const { register, handleSubmit } = useForm({
    defaultValues: {
      name: step.name,
      description: step.description,
    },
  });
  const [fieldsEditable, setFieldsEditable] = useState(false);

  function handleOnFormDoubleClick() {
    if (editable) {
      setFieldsEditable(true);
    }
  }

  function onSubmit(data: UpdateStepInput) {
    const updateStepInput: UpdateStepInput = {
      id: step.id,
      name: data.name,
      description: data.description,
    };
    updateStep(updateStepInput);
    setFieldsEditable(false);
  }

  function handleOnDelete() {
    deleteStep(step.id);
  }

  function handleCancel(e: SyntheticEvent) {
    e.preventDefault();
    setFieldsEditable(false);
  }

  return (
    <div key={step.id} className="flex items-start max-w-3xl my-1">
      <DeleteButton
        className="mr-1"
        hidden={!editable}
        onClick={handleOnDelete}
      />
      <form className="flex-1" onSubmit={handleSubmit(onSubmit)}>
        <div
          className="flex items-start"
          onDoubleClick={handleOnFormDoubleClick}
        >
          <span className="flex-shrink-0 bg-pink-400 text-white text-center rounded-full mr-1 mt-0.5 w-6 pb-0.5">
            {step.sortNr}
          </span>

          <span
            className={`flex-initial font-bold${
              fieldsEditable ? 'hidden' : ''
            }`}
          >
            {step.name}
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

          <p className={`flex-initial ml-1 ${fieldsEditable ? 'hidden' : ''}`}>
            {step.description}
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
