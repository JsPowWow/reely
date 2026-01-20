import type { Nullable } from '../types/core.types';

export const getPropertyDescriptor = (property: PropertyKey, source: object): Nullable<PropertyDescriptor> => {
  const getPropDescriptorImpl = (proto: object): Nullable<PropertyDescriptor> =>
    proto
      ? Object.getOwnPropertyDescriptor(proto, property) ?? getPropDescriptorImpl(Object.getPrototypeOf(proto))
      : undefined;
  return getPropDescriptorImpl(source);
};
