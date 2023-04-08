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
            borderRadius: '.5em',
            caret: '_',
            space: '␣',
            defaultWidth: '15em',
            padding: '.7em .7em',
            color: 'red'
        }
    }
        
}



export function createTheme(theme: XTheme = {}) {
    const newTheme = _.merge(DEFAULT_THEME, theme)
    const ComponentThemeProvider = (props: React.PropsWithChildren<{}>) => {
        return <ThemeProvider theme={newTheme}>
            {props.children}
        </ThemeProvider>
    }
    return ComponentThemeProvider
}

export function useXTheme() {
    const theme = useTheme()
    return theme.XComponent
}