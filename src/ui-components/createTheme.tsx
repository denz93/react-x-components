import React from 'react'
import _ from 'lodash'
import { XTheme } from './interfaces'
import { ThemeProvider, useTheme, DefaultTheme} from 'styled-components'

declare module 'styled-components' {
    export interface DefaultTheme {
        XComponent?: XTheme
    }
}

export const DEFAULT_THEME: DefaultTheme = {
    XComponent: {
        input: {
            caret: '_',
            space: '␣',
        },
        global: {
            border: {
                color: '#edf2f4',
                radius: '0'
            },
            color: {
                error: '#d90429',
                warning: '#fb8500',
                success: '#06d6a0',
                primary: '#fca311',
                secondary: '#0077b6'
            },
            text: '#edf2f4',
            background: '#2b2d42',
            padding: '.7em 1em'
        },
        __borderColor: (component) => DEFAULT_THEME.XComponent?.[component]?.borderColor??DEFAULT_THEME.XComponent?.global?.border?.color??'currentColor',
        __borderRadius: (component) => DEFAULT_THEME.XComponent?.[component]?.borderRadius??DEFAULT_THEME.XComponent?.global?.border?.radius??'0',
        __color: (component) => DEFAULT_THEME.XComponent?.[component]?.color??DEFAULT_THEME.XComponent?.global?.text??'currentColor',
        __padding: (component) => DEFAULT_THEME.XComponent?.[component]?.padding??DEFAULT_THEME.XComponent?.global?.padding??'0'
    }
        
}



export function createTheme(theme: Pick<XTheme, "button" | "input" | "global"> = {}) {
    const newTheme = _.merge(DEFAULT_THEME, {XComponent: theme})
    const ComponentThemeProvider = (props: React.PropsWithChildren<{}>) => {
        return <ThemeProvider theme={newTheme}>
            {props.children}
        </ThemeProvider>
    }
    return ComponentThemeProvider
}

export function useXTheme() {
    const theme = useTheme()
    return theme ? theme.XComponent : DEFAULT_THEME.XComponent
}