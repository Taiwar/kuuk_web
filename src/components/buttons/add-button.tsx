import React, { SyntheticEvent } from 'react';
import { Plus } from 'react-bootstrap-icons';
import { KuukButton } from './kuuk-button';

type AddButtonProps = {
  onClick: (e: SyntheticEvent) => void;
} & React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>;

export function AddButton(props: AddButtonProps): JSX.Element {
  return (
    <KuukButton
      variant="primary"
      className={props.className}
      icon={<Plus size={28} className="mt-0.5" />}
      onClick={props.onClick}
      size={8}
    />
  );
}
