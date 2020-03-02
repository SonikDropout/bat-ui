const slide = (dir) => (node, { duration = 300, delay }) => ({
  duration,
  delay,
  css: (t) => {
    let V = 0,
      H = 0;
    if (dir.startsWith('top')) V = -100 + 100 * t;
    else if (dir.startsWith('bottom')) V = Math.abs(1 - t) * 100;
    if (dir.endsWith('left')) H = -100 + 100 * t;
    else if (dir.endsWith('right')) H = Math.abs(1 - t) * 100;
    return `transform: translate(${H}%, ${V}%); opacity: ${t}`;
  },
});

module.exports = {
  slide,
};
