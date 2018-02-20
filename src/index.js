var split = require('split');

class Stack {
  constructor(cb) {
    this.cb = cb || (() => {});
    this._stack = [];
  }

  pop(noSend) {
    let popped = this._stack.pop() || 0;
    if (!noSend)
      this.cb(this._stack);
    return popped;
  }

  push(item, noSend) {
    this._stack.push(item);
    if (!noSend)
      this.cb(this._stack);
  }

  swap() {
    let one = this.pop(true);
    let two = this.pop(true);
    this._stack.push(one, two);
    this.cb(this._stack);
  }

  dup() {
    let item = this.pop(true);
    this._stack.push(item);
    this._stack.push(item);
    this.cb(this._stack);
  }

  empty() {
    this._stack = [];
    this.cb(this._stack);
  }
}

module.exports = class Befunge {
  constructor(rs, ws, opts) {
    this.rs = rs;
    this.ws = ws;
    this.opts = opts || {};
    if (typeof this.opts.parsed !== 'function')
      this.opts.parsed = () => {};
    if (typeof this.opts.position !== 'function')
      this.opts.position = () => {};
    if (typeof this.opts.stack !== 'function')
      this.opts.stack = () => {};
    if (typeof this.opts.read !== 'function')
      this.opts.read = () => {};
    if (typeof this.opts.done !== 'function')
      this.opts.done = () => {};
    this.stack = new Stack(this.opts.stack);
    this.source = '';
    this.rs.pipe(split()).on('data', (line) => {
      if (this.readint)
        this.stack.push(parseInt(line) || 0);
      else if (this.readchar)
        this.stack.push((line || ' ').charCodeAt(0));
      else
        return;
      this.paused = false;
      this.readint = false;
      this.readchar = false;
      return this.runtimeLoop();
    });
    this.reset();
  }

  codeAt(x, y) {
    return (this.code[y] || [])[x] || '';
  }

  putCode(x, y, v) {
    this.code[y] = this.code[y] || [];
    this.code[y][x] = String.fromCharCode(v);
    this.opts.parsed(this.code);
  }

  parse(program) {
    return program.split('\n').map(line => line.split(''));
  }

  load(program) {
    this.source = program;
    this.reset();
    return this.code;
  }

  run() {
    this.running = true;
    return this.runtimeLoop();
  }

  reset() {
    this.code = this.parse(this.source);
    this.opts.parsed(this.code);
    this.stack.empty();
    this.x = 0;
    this.y = 0;
    this.direction = 'e';
    this.readint = false;
    this.readchar = false;
    this.paused = false;
    this.running = false;
    this.stringMode = false;
    this.bridge = false;
    this.opts.position(this.x, this.y);
  }

  randomDirection() {
    let directions = 'nesw';
    return directions[Math.floor(Math.random() * 4)];
  }

  runtimeLoop() {
    let one, two, gx, gy;
    while (this.running && !this.paused) {
      this.opts.position(this.x, this.y);
      if (this.stringMode) {
        if (this.codeAt(this.x, this.y) === '"') {
          this.stringMode = false;
        } else {
          if (this.codeAt(this.x, this.y) !== '')
            this.stack.push(this.codeAt(this.x, this.y).charCodeAt(0));
        }
      } else {
        switch (this.codeAt(this.x, this.y)) {
          case '0': case '1': case '2': case '3': case '4': case '5':
          case '6': case '7': case '8': case '9':
            this.stack.push(parseInt(this.codeAt(this.x, this.y), 10));
            break;
          case '+':
            one = this.stack.pop(), two = this.stack.pop();
            this.stack.push(one + two);
            break;
          case '-':
            one = this.stack.pop(), two = this.stack.pop();
            this.stack.push(two - one);
            break;
          case '*':
            one = this.stack.pop(), two = this.stack.pop();
            this.stack.push(one * two);
            break;
          case '/':
            one = this.stack.pop(), two = this.stack.pop();
            this.stack.push(parseInt(two / one));
            break;
          case '%':
            one = this.stack.pop(), two = this.stack.pop();
            this.stack.push(two % one);
            break;
          case '!':
            this.stack.push(this.stack.pop() ? 0 : 1);
            break;
          case '`':
            one = this.stack.pop(), two = this.stack.pop();
            this.stack.push(two > one ? 1 : 0);
            break;
          case '>':
            this.direction = 'e';
            break;
          case '<':
            this.direction = 'w';
            break;
          case '^':
            this.direction = 'n';
            break;
          case 'v':
            this.direction = 's';
            break;
          case '?':
            this.direction = this.randomDirection();
            break;
          case '_':
            this.direction = this.stack.pop() ? 'w' : 'e';
            break;
          case '|':
            this.direction = this.stack.pop() ? 'n' : 's';
            break;
          case '"':
            this.stringMode = !this.stringMode;
            break;
          case ':':
            this.stack.dup();
            break;
          case '\\':
            this.stack.swap();
            break;
          case '$':
            this.stack.pop();
            break;
          case '.':
            this.ws.write('' + this.stack.pop() + ' ');
            break;
          case ',':
            this.ws.write(String.fromCharCode(this.stack.pop()));
            break;
          case '#':
            this.bridge = true;
            break;
          case '@':
            this.running = false;
            this.opts.done();
            if (!this.opts.wsNoDestroy) {
              this.ws.destroy();
            }
            if (!this.opts.rsNoDestroy) {
              this.rs.end();
            }
            //break rtLoop;
            break;
          case 'g':
            gy = this.stack.pop();
            gx = this.stack.pop();
            this.stack.push((this.codeAt(gx, gy) || ' ').charCodeAt(0));
            break;
          case 'p':
            gy = this.stack.pop();
            gx = this.stack.pop();
            this.putCode(gx, gy, this.stack.pop());
            break;
          case '&':
            this.readint = true;
            this.paused = true;
            this.opts.read('int');
            break;
          case '~':
            this.readchar = true;
            this.paused = true;
            this.opts.read('char');
            break;
        }
      }
      if (this.running) {
        let inc = this.bridge ? 2 : 1;
        this.bridge = false;
        switch (this.direction) {
          case 'n':
            this.y -= inc;
            if (this.y < 0)
              this.y = 25;
            break;
          case 'e':
            this.x += inc;
            if (this.x > 80)
              this.x = 0;
            break;
          case 's':
            this.y += inc;
            if (this.y > 25)
              this.y = 0;
            break;
          case 'w':
            this.x -= inc;
            if (this.x < 0)
              this.x = 80;
            break;
        }
        if (typeof this.opts.step === 'function')
          return this.opts.step(() => this.runtimeLoop());
      }
    }
  }
}
