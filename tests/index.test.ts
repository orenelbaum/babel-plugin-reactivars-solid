import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { traverse } from '@babel/core'
import generate from '@babel/generator'
import { parse } from '@babel/parser'
import main from '../src/index'


test('index', async () => {
   await test1()
   await test2()
	await test3()
	await test4()
	await test5()
	await test6()
	await test7()
	await test8()
	await test9()
	await test10()
	await test11()
	await test12()
	await test13()
	await test14()
	await test15()
	await test16()
	await test17()
	await test18()
	await test19()
	await test20()
	await test23()
	await test24()
	await test25()
	await test26()
	await testCounterExample()
	await testCounterExample2()
	await testCounterExample3()
	await randomTest1()
	await testReadmeExample()
})

test.run()


async function assertTransform(src, expectedOutput, message, shouldLog = false) {
	const ast = parse(
		src,
		{ 
			sourceType: "module",
			plugins: [ "jsx" ]
		}
	)
	
	traverse(
		ast,
		main().visitor
	)
	
	const res = generate(ast)

	if (shouldLog) console.log(res.code)

	assert.snapshot(res.code, expectedOutput, message)
}


// Creating a reactive variable with a signal
async function test1() {
	const src =
/*javascript*/`let $a = 1;`

	const expectedOutput =
/*javascript*/`import { createSignal as _createSignal } from "solid-js";

let $a = _createSignal(1);`

	await assertTransform(src, expectedOutput, 'Creating a reactive variable with a signal')
}


// Creating a reactive property with a signal
async function test2() {
	const src =
/*javascript*/`let a = { $b: 1 };`

	const expectedOutput =
/*javascript*/`import { createSignal as _createSignal } from "solid-js";
let a = {
  $b: _createSignal(1)
};`

	await assertTransform(src, expectedOutput, 'Creating a reactive property with a signal')
}


// Basic usage of reactive variables
async function test3() {
	const src =
/*javascript*/`let $count = 0;
console.log($count);
$count = 1;`

	const expectedOutput =
/*javascript*/`import { createSignal as _createSignal } from "solid-js";

let $count = _createSignal(0);

console.log($count[0]());
$count[1](1);`

	await assertTransform(src, expectedOutput, 'Basic usage of reactive variables')
}


// Basic usage of reactive properties
async function test4() {
	const src =
/*javascript*/`let a = { $b: 0 };
console.log(a.$b);
a.$b = 1;`

	const expectedOutput =
/*javascript*/`import { createSignal as _createSignal } from "solid-js";
let a = {
  $b: _createSignal(0)
};
console.log(a.$b[0]());
a.$b[1](1);`

	await assertTransform(src, expectedOutput, 'Basic usage of reactive properties')
}


// Forking a reactive variable
async function test5() {
	const src =
/*javascript*/`let $count = 0;
let $count2 = $count;`

	const expectedOutput =
/*javascript*/`import { createSignal as _createSignal } from "solid-js";

let $count = _createSignal(0);

let $count2 = _createSignal($count[0]());`

	await assertTransform(src, expectedOutput, 'Forking a reactive variable')
}
 

// Forking a reactive property into a reactive variable
async function test6() {
	const src =
/*javascript*/`const obj = { $count: 0 };
   let $c = obj.$count;`

	const expectedOutput =
/*javascript*/`import { createSignal as _createSignal } from "solid-js";
const obj = {
  $count: _createSignal(0)
};

let $c = _createSignal(obj.$count[0]());`

	await assertTransform(src, expectedOutput, 'Forking a reactive property into a reactive variable')
}


// Creating a reactive variable from a getter-setter pair using the `$` function
async function test7() {
	const src =
/*javascript*/`import { $ } from 'babel-plugin-reactivars-solid'
let $count = $([getCount, setCount]);`

	const expectedOutput =
/*javascript*/`let $count = [getCount, setCount];`

	await assertTransform(src, expectedOutput, 'Creating a reactive variable from a getter-setter pair using the `$` function')
}


// Creating a reactive property from a getter-setter pair using the `$` function
async function test8() {
	const src =
/*javascript*/`import { $ } from 'babel-plugin-reactivars-solid'
let a = { $b: $([getB, setB]) };`

	const expectedOutput =
/*javascript*/`let a = {
  $b: [getB, setB]
};`

	await assertTransform(src, expectedOutput, 'Creating a reactive property from a getter-setter pair using the `$` function')
}


// Copying a reactive variable using the `$` function
async function test9() {
	const src =
/*javascript*/`import { $ } from 'babel-plugin-reactivars-solid'
let $count1 = 0;
let $count2 = $($count1);`

	const expectedOutput =
/*javascript*/`import { createSignal as _createSignal } from "solid-js";

let $count1 = _createSignal(0);

let $count2 = $count1;`

	await assertTransform(src, expectedOutput, 'Copying a reactive variable using the `$` function')
}


// Copying a reactive property using the `$` function
async function test10() {
	const src =
/*javascript*/`import { $ } from 'babel-plugin-reactivars-solid'
let obj = { $count1: 0 }
obj.$count2 = $(obj.$count1)`

	const expectedOutput =
/*javascript*/`import { createSignal as _createSignal } from "solid-js";
let obj = {
  $count1: _createSignal(0)
};
obj.$count2 = obj.$count1;`

	await assertTransform(src, expectedOutput, 'Copying a reactive property using the `$` function')
}


// Making a reactive variable from a reactive property and vice versa using the `$` function
async function test11() {
	const src =
/*javascript*/`import { $ } from 'babel-plugin-reactivars-solid'
let obj = { $count: 0 }
let $c = $(obj.$count)
obj.$count2 = $($c)`

	const expectedOutput =
/*javascript*/`import { createSignal as _createSignal } from "solid-js";
let obj = {
  $count: _createSignal(0)
};
let $c = obj.$count;
obj.$count2 = $c;`

	await assertTransform(src, expectedOutput, 'Making a reactive variable from a reactive property and vice versa using the `$` function')
}


// Dereferencing a reactive variable using the `$$` function
async function test12() {
	const src =
/*javascript*/`import { $$ } from 'babel-plugin-reactivars-solid'
let $count = 0;
console.log($$($count));`

	const expectedOutput =
/*javascript*/`import { createSignal as _createSignal } from "solid-js";

let $count = _createSignal(0);

console.log($count);`

	await assertTransform(src, expectedOutput, 'Dereferencing a reactive variable using the `$$` function')
}


// Dereferencing a reactive property using the `$$` function
async function test13() {
	const src =
/*javascript*/`import { $$ } from 'babel-plugin-reactivars-solid'
let obj = { $count: 0 }
console.log($$(obj.$count))`

	const expectedOutput =
/*javascript*/`import { createSignal as _createSignal } from "solid-js";
let obj = {
  $count: _createSignal(0)
};
console.log(obj.$count);`

	await assertTransform(src, expectedOutput, 'Dereferencing a reactive property using the `$$` function')
}


// Making a reactive property from a reactive variable using an object literal
async function test14() {
	const src =
/*javascript*/`let $count = 0;
let obj = { $count, $count2: $count };`

	const expectedOutput =
/*javascript*/`import { createSignal as _createSignal } from "solid-js";

let $count = _createSignal(0);

let obj = {
  $count,
  $count2: $count
};`

	await assertTransform(src, expectedOutput, 'Making a reactive property from a reactive variable using an object literal')
}


// Copying a reactive property using an object literal
async function test15() {
	const src =
/*javascript*/`let obj1 = { $count: 1 };
let obj2 = { $count: obj2.$count };`

	const expectedOutput =
/*javascript*/`import { createSignal as _createSignal } from "solid-js";
let obj1 = {
  $count: _createSignal(1)
};
let obj2 = {
  $count: obj2.$count
};`

	await assertTransform(src, expectedOutput, 'Copying a reactive property using an object literal')
}


// Making a reactive variable from a reactive property using destructuring
async function test16() {
	const src =
/*javascript*/`let obj = { $count: 0 };
let { $count, $count: $count2 } = obj;`

	const expectedOutput =
/*javascript*/`import { createSignal as _createSignal } from "solid-js";
let obj = {
  $count: _createSignal(0)
};
let {
  $count,
  $count: $count2
} = obj;`

	await assertTransform(src, expectedOutput, 'Making a reactive variable from a reactive property using destructuring')
}


// Destructuring a reactive variable from a function parameter
async function test17() {
	const src =
/*javascript*/`function f({ $count }) {
  console.log($count);
}`

	const expectedOutput =
/*javascript*/`function f({
  $count
}) {
  console.log($count[0]());
}`

	await assertTransform(src, expectedOutput, 'Destructuring a reactive variable from a function parameter')
}


// Importing reactive variables
async function test18() {
	const src =
/*javascript*/`import { $count1 } from './count1';
import $count2 from './count2';
$count1;
$count2;`

	const expectedOutput =
/*javascript*/`import { $count1 } from './count1';
import $count2 from './count2';
$count1[0]();
$count2[0]();`

	await assertTransform(src, expectedOutput, 'Importing reactive variables')
}


// Passing reactive variables as props
async function test19() {
	const src =
/*javascript*/`let $count = 0;
<MyComp {...{ $count, $count: $count2 }} $count3={$count} count4={$count} />`

	const expectedOutput =
/*javascript*/`import { createSignal as _createSignal } from "solid-js";

let $count = _createSignal(0);

<MyComp {...{
  $count,
  $count: $count2
}} $count3={$count} count4={$count[0]()} />;`

	await assertTransform(src, expectedOutput, 'Passing reactive variables as props')
}


// read and write CTFs
async function test20() {
	const src =
/*javascript*/`import { read, write } from 'babel-plugin-reactivars-solid'
let $count = 0;
const count = read($count);
const setCount = write($count);
const prop = read(o.$prop);
const setProp = write(o.$prop);`

	const expectedOutput =
/*javascript*/`import { createSignal as _createSignal } from "solid-js";

let $count = _createSignal(0);

const count = $count[0];
const setCount = $count[1];
const prop = o.$prop[0];
const setProp = o.$prop[1];`

	await assertTransform(src, expectedOutput, 'read and write CTFs')
}


// // valType CTF
// async function test21() {
// 	const src =
// /*javascript*/`import { valType } from 'babel-plugin-reactivars-solid'
// let $v = 0;
// const vWithValType = valType($v);
// const obj = { $p : 1 };
// const pWithValType = valType(obj.$p);`

// 	const expectedOutput =
// /*javascript*/`import { createSignal as _createSignal } from "solid-js";
// let $v = _createSignal(0);
// const vWithValType = $v;
// const obj = {
// 	  $p: _createSignal(1)
// };
// const pWithValType = obj.$p;`

// 	await assertTransform(src, expectedOutput, 'valType CTF')
// }


// // factoryType CTF for functions
// async function test22() {
// 	const src =
// /*javascript*/`import { factoryType } from 'babel-plugin-reactivars-solid'
// const getV = () => {
// 	let $v = 0;
// 	return $$($v);
// }
// const getV$ = factoryType(getV);`

// 	const expectedOutput =
// /*javascript*/`import { createSignal as _createSignal } from "solid-js";
// const getV = () => {
// 	let $v = _createSignal(0);
// 	return $v;
// }
// const getV$ = getV;`

// 	await assertTransform(src, expectedOutput, 'factoryType CTF for functions')
// }


// Postfixed functions
async function test23() {
	const src =
/*javascript*/`let $count = localSignal$(0);`

const expectedOutput =
/*javascript*/`let $count = localSignal$(0);`

	await assertTransform(src, expectedOutput, 'Postfixed functions')
}


// Unused imports
async function test24() {
	const src =
`import { $, $$ } from "babel-plugin-reactivars-solid"`

	const expectedOutput = ``

	await assertTransform(src, expectedOutput, 'Counter example')
}


// Assignment operators
async function test25() {
	const src =
/*javascript*/`let $count = 0;
$count += 1;
obj.$count += 1;`

	const expectedOutput =
/*javascript*/`import { createSignal as _createSignal } from "solid-js";

let $count = _createSignal(0);

$count[1]($count[0]() + 1);
obj.$count[1](obj.$count[0]() + 1);`

	await assertTransform(src, expectedOutput, 'Assignment operators')
}


// Unary operators
async function test26() {
	const src =
/*javascript*/`let $count = 0;
$count++;
++$count;
$count--;
--$count;
obj.$count++;
++obj.$count;
obj.$count--;
--obj.$count;`

	const expectedOutput =
/*javascript*/`import { createSignal as _createSignal } from "solid-js";

let $count = _createSignal(0);

$count[1]($count[0]() + 1) - 1;
$count[1]($count[0]() + 1);
$count[1]($count[0]() - 1) + 1;
$count[1]($count[0]() - 1);
obj.$count[1](obj.$count[0]() + 1) - 1;
obj.$count[1](obj.$count[0]() + 1);
obj.$count[1](obj.$count[0]() - 1) + 1;
obj.$count[1](obj.$count[0]() - 1);`

	await assertTransform(src, expectedOutput, 'Unary operators')
}



// Test a single component counter that updates on interval
async function testCounterExample() {
	const src =
/*javascript*/`import { onCleanup } from "solid-js";
import { render } from "solid-js/web";

const CountingComponent = () => {
	let $count = 0;
	const interval = setInterval(
		() => $count = $count + 1,
		1000
	);
	onCleanup(() => clearInterval(interval));
	return <div>Count value is {$count}</div>;
};

render(() => <CountingComponent />, document.getElementById("app"));`

	const expectedOutput =
/*javascript*/`import { createSignal as _createSignal } from "solid-js";
import { onCleanup } from "solid-js";
import { render } from "solid-js/web";

const CountingComponent = () => {
  let $count = _createSignal(0);

  const interval = setInterval(() => $count[1]($count[0]() + 1), 1000);
  onCleanup(() => clearInterval(interval));
  return <div>Count value is {$count[0]()}</div>;
};

render(() => <CountingComponent />, document.getElementById("app"));`

	await assertTransform(src, expectedOutput, 'Counter example')
}


// Test a single component counter with an increment button
async function testCounterExample2() {
	const src =
/*javascript*/`import { render } from "solid-js/web";

function Counter() {
  let $count = 0;
  const increment = () => $count = $count + 1;

  return (
    <button type="button" onClick={increment}>
      {$count}
    </button>
  );
}

render(() => <Counter />, document.getElementById("app"));
`

	const expectedOutput =
/*javascript*/`import { createSignal as _createSignal } from "solid-js";
import { render } from "solid-js/web";

function Counter() {
  let $count = _createSignal(0);

  const increment = () => $count[1]($count[0]() + 1);

  return <button type="button" onClick={increment}>
      {$count[0]()}
    </button>;
}

render(() => <Counter />, document.getElementById("app"));`

	await assertTransform(src, expectedOutput, 'Counter example')
}


// Test a single component counter with an increment button + creating a reactive variable from an array
async function testCounterExample3() {
	const src =
/*javascript*/`
import { $ } from "babel-plugin-reactivars-solid"
export const Counter = () => {
	let $count = $([() => 1, x => null])
	const increment = () => $count = $count + 1;
 
	return (
	  <button type="button" onClick={increment}>
		 {$count}
	  </button>
	);
};`

	const expectedOutput =
/*javascript*/`export const Counter = () => {
  let $count = [() => 1, x => null];

  const increment = () => $count[1]($count[0]() + 1);

  return <button type="button" onClick={increment}>
		 {$count[0]()}
	  </button>;
};`

	await assertTransform(src, expectedOutput, 'Counter example')
}


// 
async function randomTest1() {
	const src =
`import { $$ } from "babel-plugin-reactivars-solid"

createStyles = (player) => {
	let $style = undefined
	createComputed(() => {
		getSorted();
		const offset = lastPos.get(player) * 18 - curPos.get(player) * 18,
			t = setTimeout(() =>
				$style = { transition: "250ms", transform: null }
			);
		$style = {
			transform: \`translateY(\${offset}px)\`,
			transition: null
		};
		onCleanup(() => clearTimeout(t));
	});
	return $$($style)[0];
};`

	const expectedOutput =
`import { createSignal as _createSignal } from "solid-js";

createStyles = player => {
  let $style = _createSignal(undefined);

  createComputed(() => {
    getSorted();
    const offset = lastPos.get(player) * 18 - curPos.get(player) * 18,
          t = setTimeout(() => $style[1]({
      transition: "250ms",
      transform: null
    }));
    $style[1]({
      transform: \`translateY(\${offset}px)\`,
      transition: null
    });
    onCleanup(() => clearTimeout(t));
  });
  return $style[0];
};`

	await assertTransform(src, expectedOutput, 'Counter example')
}


// Tests the readme example
async function testReadmeExample() {
	const src =
`import { $ } from 'babel-plugin-reactivars-solid'

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
}`

	const expectedOutput = `import { createSignal as _createSignal } from "solid-js";

const getDouble = ({
  $sig
}) => ({
  $doubled: [() => $sig[0]() * 2, newVal => $sig[1](newVal / 2)]
});

const CounterChild = ({
  $doubleCount
}) => <button onClick={() => $doubleCount[1]($doubleCount[0]() + 1) - 1}>
      {$doubleCount[0]()} (click to add 0.5 to count)
   </button>;

const CounterParent = () => {
  let $count = _createSignal(0);

  let {
    $doubled: $doubleCount
  } = getDouble({
    $sig: $count
  });

  const incrementCount = () => $doubleCount[1]($doubleCount[0]() + 2);

  return <>
      <button onClick={incrementCount}>
         {$count[0]()}
      </button>
      <CounterChild {...{
      $doubleCount
    }} />
   </>;
};`

	await assertTransform(src, expectedOutput, 'Counter example', true)
}