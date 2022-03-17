import { Signal } from "solid-js/types/reactive/signal"

export declare const $: <Value>(
   arg: [() => Value, (x: Value) => any] | Value
) => Value

export declare const $$: <Value>(arg: Value) => Signal<Value>

// export declare const read: <Value>(arg: Value) => () => Value
