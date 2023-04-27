type Callback<TArgs extends any[], TReturn> = (...args: TArgs) => TReturn

export function safeInvoke<TArgs extends any[], TReturn, TCallback extends Callback<TArgs, TReturn> | undefined>(
  callback: TCallback, ...args: TArgs): TReturn | void {

  if (callback === undefined || callback === null) return;

  try {
    return callback(...args) as any
  } catch (err) {
    console.warn(`Error happened during invoking ${callback.name}`)
  }

}