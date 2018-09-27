import React, { Component, Fragment } from 'react';
import { ButtonWithDefaultProps } from './Button';

const initialState = { clicksCount: 0 };

type State = Readonly<typeof initialState>;

export class ButtonCounter extends Component<{}, State> {
  readonly state: State = initialState;
  render() {
    const { clicksCount } = this.state;
    return (
      <Fragment>
        <ButtonWithDefaultProps onClick={this.handleIncrement}>Increment</ButtonWithDefaultProps>
        <ButtonWithDefaultProps onClick={this.handleDecrement}>Decrement</ButtonWithDefaultProps>
        <p>You've clicked me {clicksCount} times!</p>
      </Fragment>
    );
  }

  private handleIncrement = () => this.setState(incrementClicksCount);
  private handleDecrement = () => this.setState(decrementClicksCount);
}

const incrementClicksCount = (prevState: State) => ({ clicksCount: prevState.clicksCount + 1 });

const decrementClicksCount = (prevState: State) => ({ clicksCount: prevState.clicksCount - 1 });
