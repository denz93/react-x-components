type MergeObject = {
    [key: string]: any
}
export function merge<TObj extends MergeObject, KObj extends MergeObject>(t: TObj, k: KObj, deep = 3): TObj & KObj {
    const newObject: Partial<TObj & KObj> = {}
    const tKeys: (keyof TObj)[] = Object.keys(t) as any
    const kKeys: (keyof KObj)[] = Object.keys(k) as any

    // only key represent in TObj
    for (let key of tKeys) {
        if (kKeys.includes(key as any)) continue;
        if (deep === 0) {
            newObject[key] = t[key]
            continue
        }
        if (typeof t[key] === 'object' && deep > 0) {
            newObject[key] = merge({}, t[key], deep - 1)
        } else {
            newObject[key] = t[key]
        }
    }

    // only key represent in KObj
    for (let key of kKeys) {
        if (tKeys.includes(key as any)) continue;
        if (deep === 0) {
            newObject[key] = k[key]
            continue
        }
        if (typeof k[key] === 'object' && deep > 0) {
            newObject[key] = merge({}, k[key], deep - 1)
        } else {
            newObject[key] = k[key]
        }
    }

    //common key
    for (let key of kKeys) {
        if (!tKeys.includes(key as any)) continue
        if (deep === 0) {
            newObject[key] = k[key]
            continue
        }
        if (typeof k[key] === 'object' && typeof t[key as any] === 'object') {
            newObject[key] = merge(t[key as any], k[key], deep - 1)
        } else {
            newObject[key] = typeof k[key] === 'object' ? merge({}, k[key]) : k[key]
        }
    }

    return newObject as any
}

