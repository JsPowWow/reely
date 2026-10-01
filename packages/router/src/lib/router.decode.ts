// a part of a URL decoded; one that is not valid percent-encoding stays as it came
export const decode = (value: string): string => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};
