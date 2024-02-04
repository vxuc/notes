function debounce(fn, delay) {
  let timeoutID;
  const debounced = (...args) => {
    clearTimeout(timeoutID);
    window.setTimeout(() => fn(...args), delay);
  };
  return debounced;
}

export default debounce;
