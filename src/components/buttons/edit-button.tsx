import React, { SyntheticEvent } from 'react';
import { Pencil, PencilFill } from 'react-bootstrap-icons';
import { KuukButton } from './kuuk-button';

type EditButtonProps = {
  editable: boolean;
  onClick: (e: SyntheticEvent) => void;
} & React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>;

export function EditButton(props: EditButtonProps): JSX.Element {
  return (
    <KuukButton
      variant="primary"
      hidden={props.hidden}
      className={props.className}
      icon={
        props.editable ? (
          <Pencil size={16} className="mt-2" />
        ) : (
          <PencilFill size={16} className="mt-2" />
        )
      }
      onClick={props.onClick}
      size={8}
    />
  );
}
