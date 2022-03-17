# babel-plugin-reactivars-solid

`babel-plugin-reactivars-solid` is a Babel plugin that lets you use a Svelte like syntax with Solid (a React version is a WIP).


```jsx
const CounterChild = props =>
   <button onClick={() => props.$doubleCount = props.$doubleCount + 1}>
      {props.$doubleCount} (click to add 2 to count)
   </button>

const CounterParent = () => {
   let $count = 0
   let { $doubleCount } = getDouble({ $count })
   const incrementCount = () => $doubleCount += $doubleCount + 0.5
   return <>
     {$count}
     <CounterChild {...{ $doubleCount }} />
   </>
}

//  ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓

import { createSignal } from 'solid-js'

const CounterChild = props => {
   <button onClick={() => props.$doubleCount[1](props.$doubleCount[0]() + 1)}>
      {props.$doubleCount[0]()} (click to add 2 to count)
   </button>

const CounterParent = () => {
   const $count = createSignal(0)
   const { $doubleCount } = getDouble({ $count })
   const incrementCount = () => $doubleCount[1]($doubleCount[0]() + 0.5)
   return <>
     {$count[0]()}
     <CounterChild {...{ $doubleCount }} />
   </>
}
```

Note that this example will look much nicer once I add support for unary and assignment operators (such as `++` and `+=`).

Disclaimer: this plugin doesn't have any known bugs at the moment, but is still not ready for production use. If you find any bugs please open an issue.


## Getting Started

See [reactivars-example](https://github.com/orenelbaum/reactivars-example)

```sh
npm i -D babel-plugin-reactivars-solid @rollup/plugin-babel
```

Example config:
```js
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import { babel } from '@rollup/plugin-babel';

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
- Unary operators and support (`$x++`, etc.) as well as assignment operators such as `$x += 1`
- Handle batching, update functions and pending values
- `read` and `write` CTF to get the getter or the setter
- `$` label for effects
### Under consideration
- Reactive variable factory functions (`let doubleCount = double$($count))
- Two way binding support for input elements



## Other cool plugins
- Related project: [babel-plugin-mutable-react-state experimental](https://github.com/barelyhuman/mute)
- https://github.com/orenelbaum/babel-plugin-solid-undestructure - This plugin lets you destructure your props without losing reactivity (also made by me).
- https://github.com/LXSMNSYC/babel-plugin-solid-labels - Solid labels is more of an all in one plugin. It has Svelte-like reactive variables (like this plugin), prop destructuring and more.
- https://github.com/LXSMNSYC/solid-sfc - An experimental SFC compiler for SolidJS.
