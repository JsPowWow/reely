export const tap =
  <T>(fn: (v: T) => void) =>
  (v: T): T => {
    fn(v);
    return v;
  };
