type Numbers = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
type Parentheses = '(' | ')';
type Signs = '+' | '-' | '*' | '/';

type AfterNumbers = { [key in Numbers]: Signs | ')' | Numbers | '' };
type AfterSigns = { [key in Signs]: '(' | Numbers };
type AfterBrackets = { '(': '(' | Numbers; ')': Signs | ')' | '' };
type NextAllowed = AfterNumbers & AfterSigns & AfterBrackets;

type AllAllowed = Numbers | Parentheses | Signs;

type AllowedStarts = { [key in Numbers]: Signs | Numbers | '' } & { '(': '(' | Numbers };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type IsEmpty<T extends string | any[]> = T extends '' ? true : T['length'] extends 0 ? true : false;

type Remove<T, ToRemove extends string, Collect extends string = ''> = T extends `${infer Head}${infer Remaining}`
  ? Remove<Remaining, ToRemove, `${Collect}${Head extends ToRemove ? '' : Head}`>
  : Collect;

type First<T extends string> = IsEmpty<T> extends true
  ? ''
  : T extends `${infer Head extends AllAllowed}${string}`
  ? Head
  : false;

type CorrectStart<T extends string> = T extends `${infer Head extends keyof AllowedStarts}${infer Remaining}`
  ? First<Remaining> extends AllowedStarts[Head]
    ? true
    : false
  : false;

type IsNextAllowed<T extends string> = T extends `${infer Head extends AllAllowed}${infer Remaining}`
  ? First<Remaining> extends NextAllowed[Head]
    ? IsNextAllowed<Remaining>
    : false
  : IsEmpty<T>;

type OnlyBrackets<T> = Remove<T, Exclude<AllAllowed | ' ', Parentheses>>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EmptyStringAndEmptyArray<S extends string, A extends any[]> = [IsEmpty<S>, IsEmpty<A>] extends true[]
  ? true
  : false;

type ParenthesesCheck<T extends string, Stack extends Parentheses[] = []> = T extends `(${infer Remaining}`
  ? ParenthesesCheck<Remaining, ['(', ...Stack]>
  : T extends `)${infer Remaining}`
  ? Stack extends ['(', ...infer RemainingStack extends Parentheses[]]
    ? ParenthesesCheck<Remaining, RemainingStack>
    : false
  : EmptyStringAndEmptyArray<T, Stack>;

export type Calculator<T extends string, NoSpace extends string = Remove<T, ' '>> = [
  ParenthesesCheck<OnlyBrackets<T>>,
  CorrectStart<NoSpace>,
  IsNextAllowed<NoSpace>
] extends true[]
  ? T
  : never;
