// Code a consumer must not be able to write: each line has to fail to compile.
import { For, signal } from '@reely/dommy';

// @ts-expect-error a string is never an event handler
export const inlineHandler = <button onClick="alert(1)" />;

// @ts-expect-error `For` needs the key of an item in `by`
export const noKey = <For each={signal([1])}>{(lap) => <i>{lap}</i>}</For>;

// @ts-expect-error the event target is typed by the element
export const wrongTarget = <input onInput={(event) => event.currentTarget.checkedd} />;

// @ts-expect-error a function child renders text, not nodes
export const nodeChild = <p>{() => <b />}</p>;
