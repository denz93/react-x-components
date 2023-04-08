import 'styled-components'
import { XTheme } from './ui-components/interfaces'

declare module 'styled-components' {
    export interface DefaultTheme {
        XComponent?: XTheme
    }
}