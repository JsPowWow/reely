type Variant = 'tile' | 'section';

export interface CardElement extends HTMLElement {
  variant: Variant;
}

// https://philparsons.co.uk/blog/custom-elements-in-a-world-of-frameworks/

export class HeaderComponent extends HTMLElement {
  public static readonly tagName = 'async-race-header';
  public static readonly observedAttributes = ['color', 'size'];

  #variant: Variant = 'tile';

  constructor() {
    super();
  }

  public get variant(): Variant {
    return this.#variant;
  }

  public set variant(variant: Variant) {
    this.#variant = variant;
  }

  public static register(tagName = HeaderComponent.tagName): void {
    customElements.define(tagName, this);
  }

  /** Called each time the element is added to the document. */
  public connectedCallback(): void {
    this.render();
    console.log('Custom element added to page.');
  }

  /** Called each time the element is removed from the document. */
  public disconnectedCallback(): void {
    console.log('Custom element removed from page.');
  }

  /** Called instead of connect/disconnect when the element is moved via `Element.moveBefore()`. */
  public connectedMoveCallback(): void {
    console.log('Custom element moved with moveBefore()');
  }

  /** Called each time the element is moved to a new document. */
  public adoptedCallback(): void {
    console.log('Custom element moved to new page.');
  }

  /** Called when an observed attribute is changed, added, removed, or replaced. */
  public attributeChangedCallback(name: string, oldValue: unknown, newValue: unknown): void {
    console.log(`Attribute ${name} has changed. Old value: ${oldValue}. New value: ${newValue}`);
  }

  public render(): void {
    this.innerHTML = `
      <h1>RSS Async Race !!!</h1>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'async-race-header': HeaderComponent;
  }
}
