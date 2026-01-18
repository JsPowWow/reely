import './nx.naive.css';
import { a, appendTo, details, div, h1, h2, img, p, pre, span, summary, text, defineDommyConfig } from '@reely/dommy';
import { scopedLogger } from '@reely/logger';
import { pipe } from '@reely/utils';

export class NxNaiveComponent extends HTMLElement {
  public static observedAttributes = [];

  private root: HTMLElement = div({ className: 'wrapper' });

  public render(): void {
    const pageContent = div({ className: 'container' }, [
      div({
        id: 'welcome',
        children: h1({
          children: [span({ children: ' Hello there, ' }), text('Welcome Free - DOM 👋')],
        }),
      }),
      div({ id: 'hero', className: 'rounded' }, [
        div({ className: 'text-container' }, [
          h2({
            children: [img({ className: 'tick', src: 'assets/tick.svg' }), span({ children: 'You"re up and running' })],
          }),
          a({ href: '#commands' }, text(" What's next? ")),
        ]),
        div({ className: 'logo-container' }, [img({ className: 'logo', src: 'assets/logo1.svg' })]),
      ]),
      div({ id: 'middle-content' }, [
        div({ id: 'learning-materials', className: 'rounded shadow' }, [
          h2({ children: 'Learning materials' }),
          a({
            href: 'https://nx.dev/getting-started/intro?utm_source=nx-project',
            target: '_blank',
            rel: 'noreferrer',
            className: 'list-item-link',
            children: [
              img({ src: 'assets/doc.svg' }),
              span({ children: ['Documentation', span({ children: ' Everything is in there ' })] }),
              img({ src: 'assets/arrow.svg' }),
            ],
          }),
          a({
            href: 'https://nx.dev/blog/?utm_source=nx-project',
            target: '_blank',
            rel: 'noreferrer',
            className: 'list-item-link',
            children: [
              img({ src: 'assets/blog.svg' }),
              span({ children: ['Blog', span({ children: ' Changelog, features & events ' })] }),
              img({ src: 'assets/arrow.svg' }),
            ],
          }),
          a({
            href: 'https://www.youtube.com/@NxDevtools/videos?utm_source=nx-project&sub_confirmation=1',
            target: '_blank',
            rel: 'noreferrer',
            className: 'list-item-link',
            children: [
              img({ src: 'assets/youtube.svg' }),
              span({ children: ['YouTube channel', span({ children: ' Nx Show, talks & tutorials ' })] }),
              img({ src: 'assets/arrow.svg' }),
            ],
          }),
          a({
            href: 'https://nx.dev/react-tutorial/1-code-generation?utm_source=nx-project',
            target: '_blank',
            rel: 'noreferrer',
            className: 'list-item-link',
            children: [
              img({ src: 'assets/click.svg' }),
              span({ children: ['Interactive tutorials', span({ children: ' Create an app, step-by-step ' })] }),
              img({ src: 'assets/arrow.svg' }),
            ],
          }),
          a({
            href: 'https://nxplaybook.com/?utm_source=nx-project',
            target: '_blank',
            rel: 'noreferrer',
            className: 'list-item-link',
            children: [
              img({ src: 'assets/teach.svg' }),
              span({ children: ['Video courses', span({ children: ' Nx custom courses ' })] }),
              img({ src: 'assets/arrow.svg' }),
            ],
          }),
        ]),
        div({ id: 'other-links' }, [
          a({
            id: 'nx-console',
            href: 'https://marketplace.visualstudio.com/items?itemName=nrwl.angular-console&utm_source=nx-project',
            target: '_blank',
            rel: 'noreferrer',
            className: 'button-pill rounded shadow',
            children: [
              img({ src: 'assets/vscode.svg' }),
              span({
                children: [
                  'Install Nx Console for VSCode',
                  span({ children: 'The official VSCode extension for Nx.' }),
                ],
              }),
            ],
          }),
          a({
            id: 'nx-console-jetbrains',
            href: 'https://plugins.jetbrains.com/plugin/21060-nx-console',
            target: '_blank',
            rel: 'noreferrer',
            className: 'button-pill rounded shadow',
            children: [
              img({ src: 'assets/jetbrains.svg' }),
              span({
                children: [
                  'Install Nx Console for JetBrains',
                  span({ children: 'Available for WebStorm, Intellij IDEA Ultimate and more!' }),
                ],
              }),
            ],
          }),
          div({ id: 'nx-cloud', className: 'rounded shadow' }, [
            div({
              children: [
                img({ src: 'assets/nx-cloud.svg' }),
                h2({ children: ['Nx Cloud', span({ children: 'Enable faster CI & better DX' })] }),
              ],
            }),
            p({ children: 'You can activate distributed tasks executions and caching by running:' }),
            pre({ children: 'nx connect' }),
            a(
              { href: 'https://nx.app/?utm_source=nx-project', target: '_blank', rel: 'noreferrer' },
              text('What is Nx Cloud?')
            ),
          ]),
          a({
            id: 'nx-repo',
            href: 'https://github.com/nrwl/nx?utm_source=nx-project',
            target: '_blank',
            rel: 'noreferrer',
            className: 'button-pill rounded shadow',
            children: [
              img({ src: 'assets/github.svg' }),
              span({
                children: ['Nx is open source', span({ children: ' Love Nx? Give us a star! ' })],
              }),
            ],
          }),
        ]),
      ]),
      div({ id: 'commands', className: 'rounded shadow' }, [
        h2('Next steps'),
        p('Here are some things you can do with Nx:'),
        details({
          children: [
            summary({
              children: [img({ src: 'assets/terminal.svg' }), 'Add UI library'],
            }),
            pre(
              span({ children: '# Generate UI lib' }),
              '\nnx g @nx/angular:lib ui',
              span({ children: '\n\n# Add a component' }),
              '\nnx g @nx/angular:component ui/src/lib/button'
            ),
          ],
        }),
        details(
          summary({ children: [img({ src: 'assets/terminal.svg' }), 'Add Angular app'] }),
          pre({ children: [span({ children: ['# Generate Angular app'] }), '\nnx g @nrwl/angular:app my-app'] })
        ),
        details({
          children: [
            summary({ children: [img({ src: 'assets/terminal.svg' }), 'Add React app'] }),
            pre({ children: [span({ children: ['# Generate React app'] }), '\nnx g @nrwl/react:app my-app'] }),
          ],
        }),
        details({
          children: [
            summary({ children: [img({ src: 'assets/terminal.svg' }), 'Add Web app'] }),
            pre({ children: [span({ children: ['# Generate Web app'] }), '\nnx g @nrwl/web:app my-app'] }),
          ],
        }),
        details({
          children: [
            summary({ children: [img({ src: 'assets/terminal.svg' }), 'View interactive project graph'] }),
            pre({ children: 'nx graph' }),
          ],
        }),
        details({
          children: [
            summary({ children: [img({ src: 'assets/terminal.svg' }), 'Run affected commands'] }),
            pre({
              children: [
                span({ children: ["# see what's been affected by changes"] }),
                '\nnx affected:graph\n\n',
                span({ children: ['# run tests for current changes'] }),
                '\nnx affected:test\n\n',
                span({ children: ['# run e2e tests for current changes'] }),
                '\nnx affected:e2e',
              ],
            }),
          ],
        }),
      ]),
      p({ id: 'love' }, ['Carefully crafted with', img({ src: 'assets/love.svg' })]),
    ]);

    pipe(pageContent, appendTo(this.root));

    this.append(this.root);
  }

  protected connectedCallback(): void {
    this.append(this.root);
    this.render();
  }
}

customElements.define('free-dom-root', NxNaiveComponent);
defineDommyConfig({
  debug: true,
  logger: scopedLogger('dommy'),
});
