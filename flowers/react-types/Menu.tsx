import React, { Component } from 'react';
import { ToggleableMenu } from './ToggleableMenu';
import { ToggleableMenuViaHoc } from './Hoc';

const initialState = {
  show: false
};

type State = typeof initialState;

export class Menu extends Component<{}, State> {
  readonly state: State = initialState;
  render() {
    const { show } = this.state;
    return (
      <React.Fragment>
        <button onClick={this.toggle}>toggle</button>
        <ToggleableMenu title="test2" show={show}>
          haode
        </ToggleableMenu>
        <ToggleableMenuViaHoc title="test3" show={show}>
          haode
        </ToggleableMenuViaHoc>
      </React.Fragment>
    );
  }
  toggle = () => {
    this.setState({
      show: !this.state.show
    });
  };
}
