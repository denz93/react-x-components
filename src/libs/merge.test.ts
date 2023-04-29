import { merge } from './merge'

import { describe, test, expect } from 'vitest'

describe('Lib merge', () => {
    test('merge one level object', () => {
        const a = {key1: 1, key2: 'demo'}
        const b = {key1: 10, key3: 'world'}
        const newObj = merge(a, b)
        expect(newObj).toMatchObject({key1: 10, key2: 'demo', key3: 'world'})
    })

    test('merge two level object', () => {
        const a = {
            aself: 1,
            name: 'John Doe',
            address: {
                street: '1 1st',
                city: 'San Francisco'
            }
        }
        const b = {
            bself: 2,
            name: {
                firstName: 'John',
                lastName: 'Doe'
            },

            address: {
                street: '2 2nd',
                city: 'San Francisco',
                state: 'CA'
            }
        }
        const newObj = merge(a, b)
        expect(newObj.address).not.toBe(b.address)
        expect(newObj.name).not.toBe(b.name)
        expect(newObj).toMatchObject({
            aself: 1,
            bself: 2,
            name: {
                firstName: 'John',
                lastName: 'Doe'
            },

            address: {
                street: '2 2nd',
                city: 'San Francisco',
                state: 'CA'
            }
        })

        const reversed = merge(b, a)
        expect(reversed).toMatchObject({
            aself: 1,
            bself: 2,
            name: 'John Doe',
            address: {
                street: '1 1st',
                city: 'San Francisco',
                state: 'CA'
            }
        })
        expect(reversed.address).not.toBe(a.address)
        console.log(reversed)
    })

    test('merge with empty', () => {
        const a = {}
        const b = {a:1, b:{c: 'asd'}}
        const newObj = merge(a, b)
        expect(newObj).toMatchObject({a:1, b:{c: 'asd'}})
        expect(newObj.b).not.toBe(b.b)
    })

})