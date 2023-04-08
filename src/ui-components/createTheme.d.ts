import React from 'react';
import { XTheme } from './interfaces';
import { DefaultTheme } from 'styled-components';
declare module 'styled-components' {
    interface DefaultTheme {
        XComponent?: XTheme;
    }
}
export declare const DEFAULT_THEME: DefaultTheme;
export declare function createTheme(theme?: XTheme): (props: React.PropsWithChildren<{}>) => JSX.Element;
export declare function useXTheme(): XTheme | undefined;
