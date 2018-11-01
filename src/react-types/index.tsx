import React from 'react';
import { render } from 'react-dom';
import { ButtonCounter } from './ButtonCounter';
import { Menu } from './Menu';

const root = document.getElementById('app');

const Test = <ButtonCounter />;

render(<Menu />, root);
