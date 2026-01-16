type Variant = 'tile' | 'section';

export interface CardElement extends HTMLElement {
  variant: Variant;
}

// https://philparsons.co.uk/blog/custom-elements-in-a-world-of-frameworks/

export class HeaderComponent extends HTMLElement {
  public static readonly tagName = 'async-race-header';
  public static observedAttributes = ['color', 'size'];

  #variant: Variant = 'tile';

  constructor() {
    // Always call super first in constructor
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

  /**
   * Called each time the element is added to the document.
   * The specification recommends that, as far as possible, developers should implement custom element setup in this callback rather than the constructor.
   */
  public connectedCallback(): void {
    this.render();
    console.log('Custom element added to page.');
  }

  /**
   * Called each time the element is removed from the document.
   */
  public disconnectedCallback(): void {
    console.log('Custom element removed from page.');
  }

  /**
   * When defined, this is called instead of connectedCallback() and disconnectedCallback() each time the element
   * is moved to a different place in the DOM via Element.moveBefore().
   * Use this to avoid running initialization/cleanup code in the connectedCallback() and disconnectedCallback() callbacks when the element
   * is not actually being added to or removed from the DOM. See Lifecycle callbacks and state-preserving moves for more details.
   */
  public connectedMoveCallback(): void {
    console.log('Custom element moved with moveBefore()');
  }

  /**
   * Called each time the element is moved to a new document.
   */
  public adoptedCallback(): void {
    console.log('Custom element moved to new page.');
  }

  /**
   * Called when attributes are changed, added, removed, or replaced. See Responding to attribute changes for more details about this callback.
   * @param name
   * @param oldValue
   * @param newValue
   */
  public attributeChangedCallback(name: string, oldValue: unknown, newValue: unknown): void {
    console.log(`Attribute ${name} has changed. Old value: ${oldValue}. New value: ${newValue}`);
  }

  // componentWillMount() {
  //   console.log('component will mount');
  // }
  //
  // componentDidMount() {
  //   console.log('component did mount');
  // }
  //
  // componentWillUnmount() {
  //   console.log('component will unmount');
  // }
  //
  // componentDidUnmount() {
  //   console.log('component did unmount');
  // }

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
