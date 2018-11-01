import React, { MouseEvent, SFC } from 'react';
import { withDefaultProps } from './withDefaultProps';

const defaultProps = { color: 'red' };
type DefaultProps = typeof defaultProps;

type Props = {
  onClick(e: MouseEvent<HTMLElement>): void;
} & DefaultProps;

const Button: SFC<Props> = ({ onClick, color, children }) => (
  <button onClick={onClick} style={{ color }}>
    {children}
  </button>
);

export const ButtonWithDefaultProps = withDefaultProps(defaultProps, Button);
