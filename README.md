# befunge - Befunge-93 Interpreter in JS

This package is available from the npm registry:
```bash
npm install befunge
# or
yarn add befunge
```

## Usage

### `new Befunge(readStream, writeStream[, opts])`

```js
const Befunge = require('befunge');

let bef = new Befunge(process.stdin, process.stdout, { wsNoDestroy: true );
```

Options:
- `parsed`, `Function(Code)`: pass the parsed source code as an argument to
  this function whenever it is modified

- `position`, `Function(x, y)`: pass the xy coordinates of the program cursor
  to this function whenever it moves

- `stack`, `Function(Stack)`: pass the stack, as an Array, to this function
  whenever it is modified

- `step`, `Function(next)`: will call this function at each step of the
  program. Resume by calling `next()`. Useful to set a timeout. Omit this
  option for continuous run.

- `read`, `Function('int' || 'char')`: call this function when needing to read
  an int or char from the input stream, with a string describing the type

- `done`, `Function`: call this function when we encounter `@` in the program

- `wsNoDestroy`, `Boolean`: don't call `.destroy()` on the write stream (useful
  for stdin which will throw an error if we try to close it)

- `rsNoDestroy`, `Boolean`: don't call `.end()` on the read stream

### `Befunge.load(program)`: parse and load a Befunge program into memory

```js
bef.load('25*"!olleH",,,,,,,@');
```

### `Befunge.run()`: run the loaded program

### `Befunge.reset()`: return everything to a beginning state; will reparse from the last loaded program code, empty stack, move cursor to (0, 0), etc.
