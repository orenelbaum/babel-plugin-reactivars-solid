# API

```tsx
// Creating a reactive variable with a signal
   let $count = 0
   // ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓
   let $count = createSignal(0)

// Creating a reactive property with a signal
   let obj = { $count: 0 }
   // ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓
   let obj = { $count: createSignal(0) }


// Basic usage of reactive variables
   let $count = 0
   console.log($count)
   $count = 1
   // ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓
   let $count = createSignal(0)
   $count[0]()
   $count[1](1)


// Basic usage of reactive properties
   let obj = { $count: 0 }
   console.log(obj.$count)
   obj.$count = 1
   // ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓
   let obj = { $count: createSignal(0) }
   console.log(obj.$count[0]())
   obj.$count[1](1)


// Forking a reactive variable
   let $count1 = 0
   let $count2 = $count1
   // ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓
   let $count1 = createSignal(0)
   let $count2 = createSignal($count1[0]())


// Forking a reactive property into a reactive variable
   const obj = { $count: 0 }
   let $c = obj.$count
   // ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓
   const obj = { $count: createSignal(0) }
   let $c = createSignal(obj.$count[0]())


// Creating a reactive variable from a getter-setter pair using the `$` function
   import { $ } from 'babel-plugin-reactivars-solid'
   let $count = $([getCount, setCount])
   // ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓
   let $count = [getCount, setCount]


// Creating a reactive property from a getter-setter pair using the `$` function
   let obj = { $count: $([getCount, setCount]) }
   // ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓
   let obj = { $count: [getCount, setCount] }


// Copying a reactive variable using the `$` function
   let $count1 = 0
   let $count2 = $($count)
   // ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓
   const $count1 = createSignal(0)
   const $count2 = $count1


// Copying a reactive property using the `$` function
   let obj = { $count1: 0 }
   obj.$count2 = $(obj.$count1)
   // ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓
   let obj = { $count1: createSignal(0) }
   obj.$count2 = obj.$count1


// Making a reactive variable from a reactive property and vice versa using the `$` function
   let obj = { $count: 0 }
   let $c = $(obj.$count)
   obj.$count2 = $($c)
   // ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓
   let obj = { $count: createSignal(0) }
   let $c = obj.$count
   obj.$count2 = $c


// Dereferencing a reactive variable using the `$$` function
   let $count = 0
   console.log($$($count))
   // ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓
   let $count = createSignal(0)
   console.log($count)


// Dereferencing a reactive property using the `$$` function
   let obj = { $count: 0 }
   console.log($$(obj.$count))
   // ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓
   let obj = { $count: createSignal(0) }
   console.log(obj.$count)


// Making a reactive property from a reactive variable using an object literal
   let $count = 0
   let obj = { $count, $count2: $count }
   // ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓
   let $count = createSignal(0)
   let obj = { $count: $count, $count2: $count }


// Copying a reactive property using an object literal
   let obj1 = { $count: 1 }
   let obj2 = { $count: obj2.$count }
   // ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓
   let obj1 = { $count: createSignal(1) }
   let obj2 = { $count: obj2.$count }


//  Making a reactive variable from a reactive property using destructuring
   let obj = { $count: 0 }
   let { $count, $count: $count2 } = obj
   // ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓
   let obj = { $count: createSignal(0) }
   let { $count, $count: $count2 } = obj


// Destructuring a reactive variable from a function parameter
   function f({ $count }) {
     console.log($count)
   }
   // ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓
   function f({ $count }) {
     console.log($count[0]())
   }


// Passing reactive variables as props
   let $count = 0;
   <MyComp {...{ $count, $count: $count2 }} $count3={$count} count4={$count} />
   // ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓
   let $count = createSignal(0)
   <MyComp {...{ $count, $count: $count2 }} $count3={$count} count4={$count[0]()} />
