export default new Proxy(
  {},
  {
    get: (_, key) => key,
  },
);
