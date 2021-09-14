import React, { SyntheticEvent } from 'react';
import { X } from 'react-bootstrap-icons';
import { KuukButton } from './kuuk-button';

type CancelButtonProps = {
  onClick: (e: SyntheticEvent) => void;
} & React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>;

export function CancelButton(props: CancelButtonProps): JSX.Element {
  return (
    <KuukButton
      variant="secondary"
      className={props.className}
      icon={<X size={28} className="mt-0.5" />}
      onClick={props.onClick}
      size={8}
    />
  );
}
