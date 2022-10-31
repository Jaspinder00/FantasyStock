module.exports = (array, fn) => {
  function map(done, todo) {
    if (todo.length > 0) {
      setTimeout(() => {
        var mapped = todo.slice(0, 1).map(fn);
        map(done.concat(mapped), todo.slice(1));
      }, 1000 * 72);
    }
  }

  map([], array);
};
