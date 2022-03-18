# Solid


## Reactive variables

Reactive variables are variables prefixed with `$`.
Those variables hold getter-setter pairs, and are used differently than normal JS variables:

- When a reactive variable is referenced, by default you won't get what is actually stored in this variable (which is the getter-setter pair). Instead, the reference will be replaced with a call to the getter at compile time, so you will get the value associated with your getter-setter pair.
  
  For example, if we have a reactive variable `$x` and we reference it like this:
  
  ```js
  console.log($x)

  // ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ (compiles to)

  console.log($x[0]())
  ```

  `$x[0]` is the getter associated with this reactive variable.

  As we will see later, in some situations referencing a reactive variable will actually get you the getter-setter pair. This will enable us to keep our code concise when passing getter-setter pairs around.

- When a reactive variable is being assigned to, instead of actually assigning a new value to the variable, we pass this value into the setter. Like in Svelte, this lets us update the state of our application and trigger reactive updates with just an assignment into a variable, something which is not possible with vanilla JS.
  
  For example, if we have a reactive variable `$x` and we assign to it like this:
  
  ```js
  $x = "Hello"

  // ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓

  $x[1]("Hello")
  ```
  
  `$x[1]` is the setter associated with this reactive variable.

Those two features gives us the ability to work with one variable instead of two separate variables for a getter and a setter, and do that with a nice and concise syntax.


### Creating reactive variables

There are a few ways to create reactive variables.

One option is to use this syntax:

```js
let $x = 0

// ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓

const $x = createSignal(0)
```

This will create a new signal and assign it to the reactive variable.

We can also create a reactive variable from a getter-setter pair using the `$` compile-time function:

```js
import { $ } from 'reactivars/solid'
let $x = $([getX, setX])

// ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓

const $x = [getX, setX]
```

The `$` function can also be used to copy reactive variables:

```js
import { $ } from 'reactivars/solid'
let $x2 = $($x1)

// ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓

const $x2 = $x1
```

This will create a new reactive variable, `$x2`, that is associated with the same getter-setter pair as `$x1`.

Another way to create reactive variables is with destructuring (which is meant to be the go-to option for passing reactive variables around). We'll get into this feature later.

Two more ways are still a work in progress: importing and exporting reactive variables, and reactive variable factory functions.

Note that the `$` function doesn't support update functions or pending values during batching (which in Solid can be accessed only through a signal update function). It also partly breaks right now the `$$` type as we will see below. This is likely to change soon.


### Reactive properties

Object properties can also be reactive, which means that they will have a similar behavior to reactive variables.

For example:
```js
obj.$x // this is a reactive property
```

```js
console.log(obj.$x)
obj.$x = "Hello"

//  ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓

console.log(obj.$x[0]())
obj.$x[1]("Hello")
```

This plugin assumes that all object properties prefixed with `$` which are being accessed, contain a getter and a setter, even if they were passed from somewhere else. If you're using TS we also assume that the type of the property is `T` instead of `[() => T, (val: T) => void]` (like with reactive variables).

Reactive properties work pretty much the same as reactive variables. We already saw that they can be read from and written to like reactive variables.

All the ways we showed above to create reactive variables also work with reactive properties.

```js
import { $ } from 'reactivars/solid'
// Creating a reactive property holding a signal
const obj1 = { $x: 0 }

// Creating a reactive property from a getter-setter pair
const obj2 = { $x: $([getX, setX]) }

// Copying a reactive property
const obj3 = { $x: $(obj2.x) }

// ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓

const obj1 = { $x: createSignal(0) }
const obj2 = { $x: [getX, setX] }
const obj3 = { $x: $y }
```

We can also use the `$` function to create reactive variables from reactive properties and vice versa:

```js
import { $ } from 'reactivars/solid'
let $x = 1
const obj = { $y: $($x) }
let $z = $(obj.$y)

// ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓

const $x = createSignal(1)
const obj = { $y: $x }
const $z = obj.$y
```

Another example

```js
import { $ } from 'reactivars/solid'
const obj = {
  $x: $([getX1, setX1])
}
obj.$x = "Hello"
obj.$x = $([getX2, setX2])
obj.$x = "Goodbye"

// ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓

const obj = {
  $x: [getX1, setX1]
}
obj.$x[1]("Hello")
obj.$x = [getX2, setX2]
obj.$x[1]("Goodbye")
```


## Passing around reactive variables and properties

One way we can pass around reactive variables and properties is by using the `$$` function to get the getter-setter pair instead of calling the getter.

```js
import { $, $$ } from 'reactivars/solid'

function getX() {
  let $x = 1
  return $$($x)
}

let $x = $(getX())

// ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓

function getX() {
  const $x = 1
  return $x
}

const $x = getX()
```

The `$$` function returns the getter-setter pair.

Note that at the moment due to `$` not supporting update functions (as described above), the type of `$$` is not exact.
It always shows that the setter supports update functions. However, if you use the `$$` function on a reactive variable created with the `$` function (as seen in the following example) update functions won't be supported in the resulting setter. Like I said above, this is likely to change soon.

```js
import { $, $$ } from 'reactivars/solid'

function getDoubleX() {
  let $x = 1
  let $doubleX = $([() => $x * 2, x => $x = x / 2])
  return $$($doubleX)
}

let $doubleX = $(getDoubleX())

// ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓

function getDoubleX() {
  const $x = 1
  const $doubleX = [() => $x * 2, x => $x = x / 2]
  return $doubleX
}

const $doubleX = getDoubleX()
```

Either way, this is becoming a little bit ugly. That's why this plugin supports another syntax.
You can use object expressions as a more concise way to create objects containing your reactive variables. This lets you skip the `$` function.

```js
function getDoubleX() {
  let $x = getX$()
  let $doubleX = [() => $x * 2, x => $x = x / 2]
  return { $doubleX }
}

let $doubleX = $(getDoubleX().$doubleX)
```

This part can be a bit confusing, but it's actually pretty simple. If an object expression contains a property with a name prefixed with `$` (which means that we're creating a reactive property), and we are assigning a reactive variable to this property, we can skip the `$$` function because it will be implied.

So we can use the shorthand syntax like we saw in the example above - `({ $x })`, or we can alternatively do `({ $x: $y })`. What you need to actually remember is that if both of those identifiers are prefixed with `$` (or one identifier in shorthand syntax), then we are copying a reactive variable into a reactive property on this object expression.

Lets see what happens when we omit one or both of the `$` prefixes:
```js
({ $a: $b, $c: d, e: $f, $g, h });

// ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓

({ $a: $b, $c: createSignal(d), e: $f[0](), $g, h });
```

We can also get rid of the `$` function in the `getDoubleX` example above. We are going to use destructuring for this. Destructuring works in a similar way to the object expression syntax we just saw.

```js
function getDoubleX() {
  let $x = getX$()
  let $doubleX = [() => $x * 2, x => $x = x / 2]
  return { $doubleX }
}

const { $doubleX } = getDoubleX()
```

Again, whenever both identifiers are prefixed, or we are using the shorthand destructuring syntax (`({ $x })`) with a prefixed identifier, we are destructuring a reactive property into a reactive variable.

Both of those features might be a little bit confusing, but they give us a relatively concise and clean way of passing reactive variables around.

Another thing to note about object expressions, is that the value we are assigning to a reactive variable can be a reactive property, instead of another reactive variable.
This is easier to show than to explain:

```js
function getXAndY() {
  return { $x: obj.$x, $y: obj.y }
}

let { $x, $y } = getXAndY()

// ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓

function getXAndY() {
  return { $x: obj.$x, $y: createSignal(obj.y) }
}

const { $x, $y } = getXAndY()
```

JSX props also work in a similar way:

```js
const Comp1 = () => {
  return <>
    <Comp2 $a={$b} c={$d} e={f} />
    <Comp3 {...{ $a: $b, c: $d, e: f }} />
    <Comp4 {...{ $a, b }} />
    <Comp4 $a={obj.$b} />
  </>
}

// ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓

const Comp1 = () => {
  return <>
    <Comp2 $a={$b} c={$d[0]()} e={f} />
    <Comp3 {...{ $a: $b, c: d[0](), e: f }} />
    <Comp4 {...{ $a, b }} />
    <Comp5 $a={obj.$b} />
  </>
}
```


## Read and write CTFs

You can use the `read` and `write` compile time functions to get the getter and setter of a reactive variable directly without using the `$` function.

```js
import { read, write } from 'babel-plugin-reactivars-solid'

let $sig = 0
const sigGetter = read($sig)
const sigSetter = write($sig)

// ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓

const $sig = createSignal(0)
const sigGetter = $sig[0]
const sigSetter = $sig[1]
```