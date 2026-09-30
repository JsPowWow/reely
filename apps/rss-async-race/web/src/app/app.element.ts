import './app.element.css';
import { createElement, div, h1, input, span } from '@reely/dommy';

import { HeaderComponent } from './components/Header.component';

export class AppElement extends HTMLElement {
  public static readonly observedAttributes = [];
  private testSignal = new AbortController();
  private container = div({
    className: 'myWrapper',
    children: [
      div({
        className: 'container',
        styles: { minWidth: '100px', minHeight: '100px' },
        aria: { ariaBusy: 'true' },
        children: [
          div(
            {
              id: 'welcome',
              onClick: (e) => {
                console.log('via listener: ', e.type, e.currentTarget);
              },
              eventsAbortSignal: this.testSignal.signal,
            },
            h1(
              {
                onClick: [
                  (e): void => {
                    console.log('~ via handleEvents1(no capture): ', e.type, e.eventPhase, e.currentTarget);
                  },
                  (e): void => {
                    console.log('~ via handleEvents2(no capture): ', e.type, e.eventPhase, e.currentTarget);
                  },
                  {
                    handleEvent: (e): void => {
                      console.log('~ via handleEvents3(CAPTURE): ', e.type, e.eventPhase, e.currentTarget);
                    },
                    capture: true,
                  },
                ],
              },
              span(
                {
                  onMouseDown: {
                    handleEvent: (e) => {
                      console.log('via descriptor: ', e.type, e.currentTarget);
                    },
                    signal: this.testSignal.signal,
                  },
                  onMouseLeave: {
                    handleEvent: (e) => {
                      console.log('via handleEvent: ', e.type, e.eventPhase, e.currentTarget);
                    },
                  },
                },
                'Hi Hi Hi'
              )
            )
          ),
          createElement(
            'form',
            {
              aaa: 'bbb',
              attributes: 'aaa',
              styles: {
                height: '100px',
                width: '100px',
              },
              onClick: (e) => {
                console.log(e.currentTarget);
              },
              method: 'POST',
            },
            input({ id: 'the-checkbox', type: 'checkbox', checked: true, ['data-sasa']: 'her44e' })
          ),
          createElement('a', {
            onClick: (e) => {
              console.log(e.currentTarget);
            },
          }),
        ],
      }),
    ],
  });

  public connectedCallback(): void {
    this.append(this.container);

    this.container.append(createElement('async-race-header'));
  }
}

HeaderComponent.register();

customElements.define('rss-async-race-app-root', AppElement);
