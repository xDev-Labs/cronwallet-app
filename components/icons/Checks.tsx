import * as React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

export const Checks = ({ color = 'currentColor', size = 24, ...props }: SvgProps & { size?: number }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <Path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <Path d="M7 12l5 5l10 -10" />
    <Path d="M2 12l5 5m5 -5l5 -5" />
  </Svg>
);
