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
    /**
     * "Global" styles will apply to all components
     */
    global? : {
    }
}

export interface IXBaseInputProps<T> {
    onChange: (value: T) => void 
    onFocus: () => void 
    onBlur: () => void 

    placeholder: string 
    value: T 

}