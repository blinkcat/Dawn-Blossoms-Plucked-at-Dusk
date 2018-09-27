import React, { SFC } from 'react';
import { Toggleable } from './Toggleable';
import { MenuItem, MenuItemProps } from './MenuItem';

type ToggleableMenuProps = MenuItemProps & { show?: boolean };

export const ToggleableMenu: SFC<ToggleableMenuProps> = ({ title, children, show }) => (
  <Toggleable<ToggleableMenuProps> component={MenuItem} props={{ title }} show={show}>
    {children}
  </Toggleable>
);
