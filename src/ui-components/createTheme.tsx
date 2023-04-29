import React from 'react'
import { XTheme } from './interfaces'
import {merge} from '@/libs/merge'
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
        __borderColor (component) { return this[component]?.borderColor??this.global?.border?.color??'currentColor'},
        __borderRadius (component) { return this[component]?.borderRadius??this.global?.border?.radius??'0' },
        __color (component) { return this[component]?.color??this.global?.text??'currentColor' },
        __padding (component) { return this[component]?.padding??this.global?.padding??'0'}
    }
        
}



export function createTheme(theme: Pick<XTheme, "button" | "input" | "global"> = {}) {
    const newTheme = merge(DEFAULT_THEME, {XComponent: theme}, 5)

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

