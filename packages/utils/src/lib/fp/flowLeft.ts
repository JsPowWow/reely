import { type Head } from '../types/utility.types';

import type { VariadicFunction, FirstParameterOf, LastReturnType } from '../types/function.types';

type AnyFunction = VariadicFunction<never>;

type Allowed<Fns extends AnyFunction[], Cache extends AnyFunction[] = []> = Fns extends []
  ? Cache
  : Fns extends [infer Lst]
  ? Lst extends AnyFunction
    ? Allowed<[], [...Cache, Lst]>
    : never
  : Fns extends [infer Fst, ...infer Lst]
  ? Fst extends AnyFunction
    ? Lst extends AnyFunction[]
      ? Head<Lst> extends AnyFunction
        ? ReturnType<Fst> extends Head<Parameters<Head<Lst>>>
          ? Allowed<Lst, [...Cache, Fst]>
          : never
        : never
      : never
    : never
  : never;

export default function flowLeft<
  F extends AnyFunction,
  Fns extends F[],
  Allow extends {
    0: [never];
    1: [FirstParameterOf<Fns>];
  }[Allowed<Fns> extends never ? 0 : 1]
>(...parameters: [...Fns]): (...data: Allow) => LastReturnType<Fns>;

export default function flowLeft<F extends VariadicFunction, Fns extends F[], Allow extends unknown[]>(
  ...parameters: [...Fns]
) {
  return (...data: Allow): unknown => {
    return parameters.reduce((acc, f) => f(acc), data.length === 1 ? data[0] : data);
  };
}
