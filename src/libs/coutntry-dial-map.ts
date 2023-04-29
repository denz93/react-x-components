import CountryDialCodes from '@/assets/country-dial-code.json'
export type CountryCodeType = keyof typeof CountryDialCodes
export type CountryType = typeof CountryDialCodes extends {[code in CountryCodeType]: infer X}  ? X : never
export const CountryDialMap = CountryDialCodes