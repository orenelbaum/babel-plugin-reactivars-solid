# API

```tsx
// Creating a reactive variable with a signal

   let $x = 0

   // ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓

   const $x = createSignal(0)



// Creating a reactive property with a signal

   const obj = { $x: 0 }

   // ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓

   const obj = { $x: createSignal(0) }



// Basic usage of reactive variables

   let $x = "Hello"
   console.log($x)
   $x = "Goodbye"

   // ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓

   const $x = createSignal("Hello")
   $x[0]()
   $x[1]("Goodbye")



// Basic usage of reactive properties

   const obj = { $x: "Hello" }
   console.log(obj.$x)
   obj.$x = "Goodbye"

   // ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓

   const obj = { $x: createSignal("Hello") }
   console.log(obj.$x[0]())
   obj.$x[1]("Goodbye")



// Forking a reactive variable / property

   let $x = "Hello"
   let $y = $x

   // ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓

   const $x = createSignal("Hello")
   const $y = createSignal($x[0]())



// Forking a reactive property into a reactive variable

   const obj = { $x: "Hello" }
   let $y = obj.$x

   // ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓

   const obj = { $x: createSignal("Hello") }
   const $y = createSignal(obj.$x[0]())



// Creating a reactive variable from a getter-setter pair using the `$` function

   import { $ } from 'babel-plugin-reactivars-solid'

   const [x, setX] = createSignal(0)
   let $x = $([x, setX])

   // ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓

   const [x, setX] = createSignal(0)
   const $x = [x, setX]



// Creating a reactive property from a getter-setter pair using the `$` function

   import { $ } from 'babel-plugin-reactivars-solid'

   const [x, setX] = createSignal(0)
   const obj = { $x: $([x, setX]) }

   // ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓

   const [x, setX] = createSignal(0)
   const obj = { $count: [x, setX] }



// Copying a reactive variable using the `$` function

   import { $ } from 'babel-plugin-reactivars-solid'

   let $x = 0
   let $y = $($x)

   // ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓

   const $x = createSignal(0)
   const $y = $x



// Copying a reactive property using the `$` function

   import { $ } from 'babel-plugin-reactivars-solid'

   const obj = { $x: 0 }
   obj.$y = $(obj.$x)

   // ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓

   const obj = { $x: createSignal(0) }
   obj.$y = obj.$x



// Making a reactive variable from a reactive property and vice versa using the `$` function

   import { $ } from 'babel-plugin-reactivars-solid'

   const obj = { $x: 0 }
   let $y = $(obj.$x)
   obj.$z = $($y)

   // ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓

   const obj = { $x: createSignal(0) }
   const $y = obj.$x
   obj.$z = $y


// Dereferencing a reactive variable using the `$$` function

   import { $$ } from 'babel-plugin-reactivars-solid'

   let $x = 0
   console.log($$($x))

   // ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓

   const $x = createSignal(0)
   console.log($x)



// Dereferencing a reactive property using the `$$` function

   import { $$ } from 'babel-plugin-reactivars-solid'

   const obj = { $x: 0 }
   console.log($$(obj.$x))

   // ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓

   const obj = { $x: createSignal(0) }
   console.log(obj.$x)


// Making a reactive property from a reactive variable using an object literal

   let $x = 0
   const obj = { $x, $y: $x }

   // ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓

   const $x = createSignal(0)
   const obj = { $x, $y: $x }


// Copying a reactive property using an object literal

   const obj1 = { $x: 0 }
   const obj2 = { $x: obj1.$x }

   // ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓
   
   const obj1 = { $x: createSignal(0) }
   const obj2 = { $x: obj1.$x }



//  Making a reactive variable from a reactive property using destructuring

   const obj = { $x: 0 }
   let { $x, $x: $y } = obj

   // ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓

   const obj = { $x: createSignal(0) }
   const { $x, $x: $y } = obj



// Destructuring a reactive variable from a function parameter

   function f({ $x }) {
     console.log($x)
   }

   // ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓

   function f({ $x }) {
     console.log($x[0]())
   }


// Passing reactive variables as props

   let $a = 0;
   <MyComp {...{ $a, $a: $b }} $c={$a} d={$a} />

   // ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓

   const $a = createSignal(0);
   <MyComp {...{ $a, $b: $a }} $c={$a} d={$a[0]()} />


// Read and write CTF

   import { read, write } from 'babel-plugin-reactivars-solid'

   let $sig = 0
   const sigGetter = read($sig)
   const sigSetter = write($sig)

   // ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓

   const $sig = createSignal(0)
   const sigGetter = $sig[0]
   const sigSetter = $sig[1]
 