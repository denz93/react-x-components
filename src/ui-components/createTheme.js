import { jsx as _jsx } from "react/jsx-runtime";
import _ from 'lodash';
import { ThemeProvider, useTheme } from 'styled-components';
export const DEFAULT_THEME = {
    XComponent: {
        input: {
            borderRadius: '.5em',
            caret: '_',
            space: '␣',
            defaultWidth: '15em',
            padding: '.7em .7em',
            color: 'red'
        }
    }
};
export function createTheme(theme = {}) {
    const newTheme = _.merge(DEFAULT_THEME, theme);
    const ComponentThemeProvider = (props) => {
        return _jsx(ThemeProvider, { theme: newTheme, children: props.children });
    };
    return ComponentThemeProvider;
}
export function useXTheme() {
    const theme = useTheme();
    return theme.XComponent;
}
