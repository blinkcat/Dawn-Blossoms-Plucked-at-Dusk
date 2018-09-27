import React, { Component, MouseEvent, ReactNode, ComponentType } from 'react';
import { isFunction } from 'lodash';

const initialState = { show: false };
const defaultProps = { ...initialState, props: {} };

type State = Readonly<typeof initialState>;
export type Props<T extends object = object> = Partial<
  {
    children: RenderCallback | ReactNode;
    render: RenderCallback;
    component: ComponentType<ToggleableComponentProps<T>>;
  } & DefaultProps<T>
>;
type DefaultProps<T extends object = object> = {
  props: T;
} & Pick<State, 'show'>;
type RenderCallback = (args: ToggleableComponentProps) => JSX.Element;

export type ToggleableComponentProps<P extends object = object> = {
  show: State['show'];
  toggle: Toggleable['toggle'];
} & P;

export class Toggleable<T extends object = object> extends Component<Props<T>, State> {
  static readonly defaultProps: Props = defaultProps;
  readonly state: State = { show: this.props.show! };

  componentWillReceiveProps(nextProps: Props<T>) {
    if (nextProps.show !== this.props.show) {
      this.setState({ show: nextProps.show! });
    }
  }

  render() {
    const { component: InjectedComponent, children, render, props } = this.props;
    const renderProps = { show: this.state.show, toggle: this.toggle };

    if (InjectedComponent) {
      return (
        <InjectedComponent {...props} {...renderProps}>
          {children}
        </InjectedComponent>
      );
    }

    if (render) {
      return render(renderProps);
    }

    return isFunction(children) ? children(renderProps) : null;
  }

  private toggle = (event: MouseEvent<HTMLElement>) => this.setState(updateShowState);
}

const updateShowState = (prevState: State) => ({
  show: !prevState.show
});
