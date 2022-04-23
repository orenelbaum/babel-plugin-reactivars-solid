# babel-plugin-reactivars-solid

`babel-plugin-reactivars-solid` is a Babel plugin that lets you use a Svelte like syntax with Solid (a React version is a WIP).


```jsx
import { $ } from 'babel-plugin-reactivars-solid'

const getDouble = ({ $sig }) => 
	({ $doubled: $([
		() => $sig * 2,
		newVal => $sig = newVal / 2
	])})

const CounterChild = ({ $doubleCount }) =>
   <button onClick={() => $doubleCount++}>
      {$doubleCount} (click to add 0.5 to count)
   </button>

const CounterParent = () => {
   let $count = 0
   let { $doubled: $doubleCount } = getDouble({ $sig: $count })
   const incrementCount = () => $doubleCount += 2
   return <>
      <button onClick={incrementCount}>
         {$count}
      </button>
      <CounterChild {...{ $doubleCount }} />
   </>
}
```

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
- Examine the possibility of a unlocking a better syntax with a TS extension. What I have in mind currently: I want to see if it's possible to use the reactive variable syntax for read only and write only reactive variables while maintaining full TS support and eforcing read/write permissions at the language server / linter level. This would be useful for signal accessors and setters as well as memos, wrapped reactive expressions (things like `const y = () => x + 1; console.log(y() + 1)` could become `const $y = x + 1; console.log($y + 1)`) and wrapped setters (`const setY = y => setX(y + 1); setY(1)` could become `let $y = y => $x = y + 1; $y = 1`). This will help this plugin become more of a consistent language where every reactive value is either a `$` prefixed reactive variable/property (reactive property = `x.$y`) or a property on a JS object / proxy (this should usually appear in props and stores) as well as consistent write syntax for non-store signals. Messing with TS extensions could potentially unlock even better possibilities and it's something I need to explore and think about more, but I really want that additional consistancy which I don't think we can achieve without extending TS, so this alone might be a reason to cross this boundary.
- Handle batching, update functions and pending values
- `$` label for effects
### Under consideration
- Reactive variable factory functions (`let $doubleCount = double$($count))
- Two way binding support for HTML elements



## Other cool plugins
- https://github.com/orenelbaum/babel-plugin-solid-undestructure - This plugin lets you destructure your props without losing reactivity (also made by me).
- https://github.com/LXSMNSYC/babel-plugin-solid-labels - Solid labels is more of an all in one plugin. It has Svelte-like reactive variables (like this plugin), prop destructuring and more.
- https://github.com/LXSMNSYC/solid-sfc - An experimental SFC compiler for SolidJS.
