type PrimitiveType = 'string' | 'number' | 'boolean'
type GetTypeFromPrimitive<T extends PrimitiveType> = 
  T extends 'string' ? string :
  T extends 'number' ? number :
  T extends 'boolean' ? boolean : never

type Metadata = {
  field: string
}

export class Validator<TPrimitiveType extends PrimitiveType> {
  private _type: PrimitiveType
  private _min: number 
  private _max: number 
  private _regex: RegExp
  private _required: boolean = false
  private _metadata: Metadata
  private _errors = {
    required: 'Required value is missing',
    type: 'Value must be ${type}',
    min: 'Value must be larger or equal than ${min}',
    max: 'Value must less or equal than ${max}',
    regex: 'Value must be match pattern ${regex}'
  } as const

  private static DEFAULT_ERRORS = {
    required: 'Required value is missing',
    type: 'Value must be ${type}',
    min: 'Value must be larger or equal than ${min}',
    max: 'Value must less or equal than ${max}',
    regex: 'Value must be match pattern ${regex}'
  } as const

  private constructor(errors: Partial<typeof Validator.DEFAULT_ERRORS> = {}) {
    this._errors = {...Validator.DEFAULT_ERRORS, ...errors }
  }

  type (t: TPrimitiveType) {
    this._type = t
    return this
  }

  min (val: number) {
    this._min = val
    return this
  }

  max(val: number) {
    this._max = val
    return this
  }

  regex(val: string, flags: string = 'g') {
    this._regex = new RegExp(val, flags)
    return this
  }

  required() {
    this._required = true
    return this
  }

  safeValidate(val: GetTypeFromPrimitive<TPrimitiveType>) {
    if (this._required !== undefined && this._required && val === undefined) {
      return this._errors.required
    }

    if (typeof val !== this._type) {
      return this.compileMessage(this._errors.type, { type: this._type })
    }

    switch(this._type) {
      case 'string':
        const stringVal = val as string 
        const len = stringVal.length
        if (this._required !== undefined && this._required && len === 0) {
          return this.compileMessage(this._errors.required, {})
        }
        if (this._min !== undefined && len < this._min) {
          return this.compileMessage(this._errors.min, {min: this._min})
        }
        if (this._max !== undefined && len > this._max) {
          return this.compileMessage(this._errors.max, {max: this._max})
        }
        if (this._regex !== undefined && !stringVal.match(this._regex)) {
          return this.compileMessage(this._errors.regex, {regex: this._regex})
        } 
        break
      case 'number':
        const numVal = val as number
        if (this._min !== undefined &&  numVal < this._min) {
          return this.compileMessage(this._errors.min, {min: this._min})
        }
        if (this._max !== undefined && numVal > this._max) {
          return this.compileMessage(this._errors.max, {max: this._max})
        }
        break 
    }

    return null
  }

  static type<TPrimitiveType extends PrimitiveType> (t: TPrimitiveType, errors: {} = {}) {
    const validator = new Validator<TPrimitiveType>(errors)
    return validator.type(t)
  }

  private compileMessage<TString extends string>(
      template: TString, 
      fieldMap: {[name in ExtractFieldName<TString>]?: any}
    ) {
    const reg = /(\$\{([a-zA-Z_]+)\})/
    return template.replace(reg, (match, p1, p2: ExtractFieldName<TString>) => {
      return p2 in fieldMap ? fieldMap[p2] : p1
    })
  }
}
const schema = Validator.type('string')

type ExtractFieldName<TString extends string> = 
  TString extends `${infer Before}\$\{${infer Name}\}${infer After}` 
  ? ExtractFieldName<Before> | Name | ExtractFieldName<After> : never 

type t = ExtractFieldName<'Value must be ${type} ${sas}'>