import { Signal, Accessor, Setter } from 'solid-js/types/reactive/signal'

export declare const $: <Value>(
   arg: [() => Value, (x: Value) => any] | Value
) => Value

export declare const $$: <Value>(arg: Value) => Signal<Value>

export declare const read: <Value>(arg: Value) => Accessor<Value>

export declare const write: <Value>(arg: Value) => Setter<Value>
