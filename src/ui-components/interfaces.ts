export interface XTheme {
    input?: {
        caret?: string 
        caretColor?: string
        space?: string
        padding?: string 
        color?: string
        defaultWidth?: string
        borderColor?: string
        borderRadius?: string
    }
    button?: {
        color?: string 
        borderColor?: string 
        borderRadius?: string
        padding?: string
    }
    /**
     * "Global" styles will apply to all components
     */
    global? : {
        color?: {
            error?: string
            success?: string
            warning?: string
            primary?: string
            secondary?: string 
        }
        border?: {
            radius?: string 
            color?: string 
        }
        padding?: string
        background?: string
        text?: string
    },

    __borderColor: (component: 'input' | 'button') => string 
    __borderRadius: (component: 'input' | 'button') => string 
    __color: (component: 'input' | 'button') => string
    __padding: (component: 'input' | 'button') => string
}

export interface IXBaseInputProps<T> {
    onChange: (value: T) => void 
    onFocus: () => void 
    onBlur: () => void 

    placeholder: string 
    value: T 

}