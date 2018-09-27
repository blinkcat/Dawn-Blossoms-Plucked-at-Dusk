import React, { ComponentType, Component } from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';
import { getDisplayName } from 'recompose';
import { Toggleable, Props as ToggleableProps, ToggleableComponentProps } from './Toggleable';
import { MenuItem } from './MenuItem';

type OwnProps = Pick<ToggleableProps, 'show'>;
type InjectedProps = ToggleableComponentProps;

export const withTogleable = <OriginnalProps extends object>(
  UnwrappedComponent: ComponentType<OriginnalProps & InjectedProps>
) => {
  // no need to omit again
  //   type Props = Omit<OriginnalProps, keyof InjectedProps> & OwnProps;
  // WithToggleable has no InjectedProps
  type Props = OriginnalProps & OwnProps;
  class WithToggleable extends Component<Props> {
    static readonly displayName = getDisplayName(UnwrappedComponent);
    static readonly WrappedComponent = UnwrappedComponent;
    render() {
      // tslint:disable-next-line
      return (
        <Toggleable
          show={this.props.show}
          // tslint:disable-next-line
          render={renderProps => <UnwrappedComponent {...this.props} {...renderProps} />}
        />
      );
    }
  }

  return hoistNonReactStatics(WithToggleable, UnwrappedComponent);
};

export const ToggleableMenuViaHoc = withTogleable(MenuItem);
