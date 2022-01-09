# babel-plugin-reactivars-solid

`babel-plugin-reactivars-solid` is a Babel plugin that lets you use a Svelte like syntax with Solid (a React version is a WIP).

This plugin is in early development and is not ready for production use.


```jsx
const CounterChild = props =>
   <button onClick={() => props.$count++}>
      {props.$count}
   </button>

const CounterParent = () => {
   let $count = 0
   const incrementCount = () => $count++
   return <CounterChild {...{ $count }} />
}

//  ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓

import { createSignal } from 'solid-js'

const CounterChild = props => {
   <button onClick={() => props.$count[1](val => ++val)}>
      {props.$count[0]()}
   </button>

const CounterParent = () => {
   const $count = createSignal(0)
   const incrementCount = () => $count[1](val => ++val)
   return <CounterChild {...{ $count }} />
}
```

This is how it looks when used in conjunction with [`babel-plugin-solid-undestructure`](https://github.com/orenelbaum/babel-plugin-solid-undestructure):

```jsx
const CounterChild = ({ $count }) =>
   <button onClick={() => $count++}>
      {$count}
   </button>

const CounterParent = () => {
   let $count = 0
   const incrementCount = () => $count++
   return <CounterChild {...{ $count }} />
}

//  ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓

import { createSignal } from 'solid-js'

const CounterChild = ({ $count }) => {
   <button onClick={() => $count[1](val => ++val)}>
      {$count[0]()}
   </button>

const CounterParent = () => {
   const $count = createSignal(0)
   const incrementCount = () => $count[1](val => ++val)
   return <CounterChild {...{ $count }} />
}
```


## Getting Started

```sh
npm i -D babel-plugin-reactivars-solid @rollup/plugin-babel
```

Example config:
```js
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import { babel } from "@rollup/plugin-babel"

export default defineConfig({
   plugins: [
      {
         ...babel({
            plugins: [
               ["@babel/plugin-syntax-typescript", { isTSX: true }],
               "babel-plugin-reactivars-solid",
            ],
            extensions: [".tsx"]
         }),
         enforce: 'pre'
      },
      solidPlugin()
   ],
   build: {
      target: 'esnext',
      polyfillDynamicImport: false,
   },
});
```


## Roadmap / Missing Features
- Unary operator support (`$x++`)
- Use update function when appropriate (`$x[1](val => ++val)` instead of `$x[1](++x[0]())`)
- `read` and `write` CTF to get the getter or the setter
- Reactive variable factory functions
- `$` label for effects


Related project: [babel-plugin-mutable-react-state experimental](https://github.com/barelyhuman/mute)
