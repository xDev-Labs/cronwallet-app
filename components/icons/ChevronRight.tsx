import * as React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

export const ChevronRight = ({ color = 'currentColor', size = 24, ...props }: SvgProps & { size?: number }) => (
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
        <Path d="M9 6l6 6l-6 6" />
    </Svg>
);
