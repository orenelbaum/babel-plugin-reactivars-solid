
export declare const $: <Value>(
   getterSetterPair: [() => Value, (x: Value) => any]
) => Value

export declare const $$: <Value>(
   getterSetterPair: [Value, () => Value]
) => [Value, () => Value]
