import { ComponentType } from 'react';

export const withDefaultProps = <P, U extends Partial<P> = Partial<P>>(
  defaultProps: U,
  Cmp: ComponentType<P>
) => {
  type RequiredProps = Omit<P, keyof U>;
  // why Required???
  type Props = Required<RequiredProps> & Partial<U>;
  Cmp.defaultProps = defaultProps;
  return (Cmp as ComponentType<any>) as ComponentType<Props>;
};
