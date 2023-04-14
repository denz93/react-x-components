import 'styled-components'
import { XTheme } from './interfaces'

declare module 'styled-components' {
    export interface DefaultTheme {
        XComponent?: XTheme
    }
}