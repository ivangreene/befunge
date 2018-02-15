let split = require('split');

function randomDirection() {
  let directions = 'nesw';
  return directions[Math.floor(Math.random() * 4)];
}

function befunge(prog, rs, ws) {
  let code = prog.split('\n').map(line => line.split(''));

  let stack = {
    pop() {
      return _stack.pop() || 0;
    },
    push(item) {
      _stack.push(item);
    },
    swap() {
      let temp = _stack[_stack.length-1];
      _stack[_stack.length-1] = _stack[_stack.length-2];
      _stack[_stack.length-2] = temp;
    },
    dup() {
      let item = stack.pop();
      _stack.push(item);
      _stack.push(item);
    }
  };

  let readint = false, readchar = false, paused = false;

  rs.pipe(split()).on('data', (line) => {
    if (readint)
      stack.push(parseInt(line) || 0);
    else if (readchar)
      stack.push((line || ' ').charCodeAt(0));
    else
      return;
    paused = false;
    readint = false;
    readchar = false;
    return runtimeLoop();
  });

  function codeAt(x, y) {
    return (code[y] || [])[x] || '';
  }

  function putCode(x, y, v) {
    code[y][x] = v;
  }

  let direction = 'e',
    running = true,
    x = 0,
    y = 0,
    _stack = [],
    stringMode = false,
    bridge = false;

  let one, two;

  function runtimeLoop() {
    rtLoop: while (running && !paused) {
      if (stringMode) {
        if (codeAt(x, y) === '"') {
          stringMode = false;
        } else {
          if (codeAt(x, y) !== '')
            stack.push(codeAt(x, y).charCodeAt(0));
        }
      } else {
        switch (codeAt(x, y)) {
          case '0': case '1': case '2': case '3': case '4': case '5':
          case '6': case '7': case '8': case '9':
            stack.push(parseInt(codeAt(x, y)));
            break;
          case '+':
            one = stack.pop(), two = stack.pop();
            stack.push(one + two);
            break;
          case '-':
            one = stack.pop(), two = stack.pop();
            stack.push(two - one);
            break;
          case '*':
            one = stack.pop(), two = stack.pop();
            stack.push(one * two);
            break;
          case '/':
            one = stack.pop(), two = stack.pop();
            stack.push(parseInt(two / one));
            break;
          case '%':
            one = stack.pop(), two = stack.pop();
            stack.push(two % one);
            break;
          case '!':
            stack.push(stack.pop() ? 0 : 1);
            break;
          case '`':
            one = stack.pop(), two = stack.pop();
            stack.push(two > one ? 1 : 0);
            break;
          case '>':
            direction = 'e';
            break;
          case '<':
            direction = 'w';
            break;
          case '^':
            direction = 'n';
            break;
          case 'v':
            direction = 's';
            break;
          case '?':
            direction = randomDirection();
            break;
          case '_':
            direction = stack.pop() ? 'w' : 'e';
            break;
          case '|':
            direction = stack.pop() ? 'n' : 's';
            break;
          case '"':
            stringMode = !stringMode;
            break;
          case ':':
            stack.dup();
            break;
          case '\\':
            stack.swap();
            break;
          case '$':
            stack.pop();
            break;
          case '.':
            ws.write('' + stack.pop() + ' ');
            break;
          case ',':
            ws.write(String.fromCharCode(stack.pop()));
            break;
          case '#':
            bridge = true;
            break;
          case '@':
            running = false;
            rs.end();
            break rtLoop;
          case 'g':
            gy = stack.pop();
            gx = stack.pop();
            stack.push(codeAt(gx, gy));
            break;
          case 'p':
            gy = stack.pop();
            gx = stack.pop();
            codePut(gx, gy, stack.pop());
            break;
          case '&':
            readint = true;
            paused = true;
            break;
          case '~':
            readchar = true;
            paused = true;
            break;
        }
      }
      let inc = bridge ? 2 : 1;
      bridge = false;
      switch (direction) {
        case 'n':
          y -= inc;
          if (y < 0)
            y = 25;
          break;
        case 'e':
          x += inc;
          if (x > 80)
            x = 0;
          break;
        case 's':
          y += inc;
          if (y > 25)
            y = 0;
          break;
        case 'w':
          x -= inc;
          if (x < 0)
            x = 80;
          break;
      }
    }
  }

  runtimeLoop();
}

module.exports = befunge;
