require('./shared');
class Pepe {
  constructor() {}

  sayHi() {}
}

function* threeTimes(f) {
  yield f();
  yield f();
  yield f();
}
