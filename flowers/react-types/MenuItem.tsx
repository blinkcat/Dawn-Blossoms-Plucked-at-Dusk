import React, { SFC } from 'react';
import { ToggleableComponentProps } from './Toggleable';

export interface MenuItemProps {
  title: string;
}

export const MenuItem: SFC<MenuItemProps & ToggleableComponentProps> = ({ title, toggle, show, children }) => (
  <React.Fragment>
    <div onClick={toggle}>
      <h1>{title}</h1>
    </div>
    {show ? children : null}
  </React.Fragment>
);
