import './nx.naive.css';
import { appendTo, div } from '@reely/dommy';
import { pipe } from '@reely/utils';

import tickSvg from '../assets/tick.svg';
import logo1Svg from '../assets/logo1.svg';
import docSvg from '../assets/doc.svg';
import arrowSvg from '../assets/arrow.svg';
import blogSvg from '../assets/blog.svg';
import youtubeSvg from '../assets/youtube.svg';
import clickSvg from '../assets/click.svg';
import teachSvg from '../assets/teach.svg';
import vscodeSvg from '../assets/vscode.svg';
import jetbrainsSvg from '../assets/jetbrains.svg';
import nxCloudSvg from '../assets/nx-cloud.svg';
import githubSvg from '../assets/github.svg';
import terminalSvg from '../assets/terminal.svg';
import loveSvg from '../assets/love.svg';

export class NxNaiveJsxComponent extends HTMLElement {
  public static observedAttributes = [];

  private root = div({ className: 'wrapper' });

  public render(): void {
    const pageContent = (
      <div className='container'>
        <div id='welcome'>
          <h1>
            <span> Hello there, </span>
            Welcome Free - DOM 👋
          </h1>
        </div>
        <div id='hero' className='rounded'>
          <div className='text-container'>
            <h2>
              <img className='tick' src={tickSvg} alt='tick' />
              <span>You're up and running</span>
            </h2>
            <a href='#commands'> What's next? </a>
          </div>
          <div className='logo-container'>
            <img className='logo' src={logo1Svg} alt='logo' />
          </div>
        </div>
        <div id='middle-content'>
          <div id='learning-materials' className='rounded shadow'>
            <h2>Learning materials</h2>
            <a
              href='https://nx.dev/getting-started/intro?utm_source=nx-project'
              target='_blank'
              rel='noreferrer'
              className='list-item-link'
            >
              <img src={docSvg} alt='documentation' />
              <span>
                Documentation
                <span> Everything is in there </span>
              </span>
              <img src={arrowSvg} alt='arrow' />
            </a>
            <a
              href='https://nx.dev/blog/?utm_source=nx-project'
              target='_blank'
              rel='noreferrer'
              className='list-item-link'
            >
              <img src={blogSvg} alt='blog' />
              <span>
                Blog
                <span> Changelog, features & events </span>
              </span>
              <img src={arrowSvg} alt='arrow' />
            </a>
            <a
              href='https://www.youtube.com/@NxDevtools/videos?utm_source=nx-project&sub_confirmation=1'
              target='_blank'
              rel='noreferrer'
              className='list-item-link'
            >
              <img src={youtubeSvg} alt='youtube' />
              <span>
                YouTube channel
                <span> Nx Show, talks & tutorials </span>
              </span>
              <img src={arrowSvg} alt='arrow' />
            </a>
            <a
              href='https://nx.dev/react-tutorial/1-code-generation?utm_source=nx-project'
              target='_blank'
              rel='noreferrer'
              className='list-item-link'
            >
              <img src={clickSvg} alt='click' />
              <span>
                Interactive tutorials
                <span> Create an app, step-by-step </span>
              </span>
              <img src={arrowSvg} alt='arrow' />
            </a>
            <a
              href='https://nxplaybook.com/?utm_source=nx-project'
              target='_blank'
              rel='noreferrer'
              className='list-item-link'
            >
              <img src={teachSvg} alt='teach' />
              <span>
                Video courses
                <span> Nx custom courses </span>
              </span>
              <img src={arrowSvg} alt='arrow' />
            </a>
          </div>
          <div id='other-links'>
            <a
              id='nx-console'
              href='https://marketplace.visualstudio.com/items?itemName=nrwl.angular-console&utm_source=nx-project'
              target='_blank'
              rel='noreferrer'
              className='button-pill rounded shadow'
            >
              <img src={vscodeSvg} alt='vscode' />
              <span>
                Install Nx Console for VSCode
                <span>The official VSCode extension for Nx.</span>
              </span>
            </a>
            <a
              id='nx-console-jetbrains'
              href='https://plugins.jetbrains.com/plugin/21060-nx-console'
              target='_blank'
              rel='noreferrer'
              className='button-pill rounded shadow'
            >
              <img src={jetbrainsSvg} alt='jetbrains' />
              <span>
                Install Nx Console for JetBrains
                <span>Available for WebStorm, Intellij IDEA Ultimate and more!</span>
              </span>
            </a>
            <div id='nx-cloud' className='rounded shadow'>
              <div>
                <img src={nxCloudSvg} alt='nx cloud' />
                <h2>
                  Nx Cloud
                  <span>Enable faster CI & better DX</span>
                </h2>
              </div>
              <p>You can activate distributed tasks executions and caching by running:</p>
              <pre>nx connect</pre>
              <a href='https://nx.app/?utm_source=nx-project' target='_blank' rel='noreferrer'>
                What is Nx Cloud?
              </a>
            </div>
            <a
              id='nx-repo'
              href='https://github.com/nrwl/nx?utm_source=nx-project'
              target='_blank'
              rel='noreferrer'
              className='button-pill rounded shadow'
            >
              <img src={githubSvg} alt='github' />
              <span>
                Nx is open source
                <span> Love Nx? Give us a star! </span>
              </span>
            </a>
          </div>
        </div>
        <div id='commands' className='rounded shadow'>
          <h2>Next steps</h2>
          <p>Here are some things you can do with Nx:</p>
          <details>
            <summary>
              <img src={terminalSvg} alt='terminal' />
              Add UI library
            </summary>
            <pre>
              <span># Generate UI lib</span>
              {`\nnx g @nx/angular:lib ui`}
              <span>{`\n\n# Add a component`}</span>
              {`\nnx g @nx/angular:component ui/src/lib/button`}
            </pre>
          </details>
          <details>
            <summary>
              <img src={terminalSvg} alt='terminal' />
              Add Angular app
            </summary>
            <pre>
              <span># Generate Angular app</span>
              {`\nnx g @nrwl/angular:app my-app`}
            </pre>
          </details>
          <details>
            <summary>
              <img src={terminalSvg} alt='terminal' />
              Add React app
            </summary>
            <pre>
              <span># Generate React app</span>
              {`\nnx g @nrwl/react:app my-app`}
            </pre>
          </details>
          <details>
            <summary>
              <img src={terminalSvg} alt='terminal' />
              Add Web app
            </summary>
            <pre>
              <span># Generate Web app</span>
              {`\nnx g @nrwl/web:app my-app`}
            </pre>
          </details>
          <details>
            <summary>
              <img src={terminalSvg} alt='terminal' />
              View interactive project graph
            </summary>
            <pre>nx graph</pre>
          </details>
          <details>
            <summary>
              <img src={terminalSvg} alt='terminal' />
              Run affected commands
            </summary>
            <pre>
              <span>{"# see what's been affected by changes"}</span>
              {`\nnx affected:graph\n\n`}
              <span># run tests for current changes</span>
              {`\nnx affected:test\n\n`}
              <span># run e2e tests for current changes</span>
              {`\nnx affected:e2e`}
            </pre>
          </details>
        </div>
        <p id='love'>
          Carefully crafted with
          <img src={loveSvg} alt='love' />
        </p>
      </div>
    );

    pipe(pageContent, appendTo(this.root));
  }

  protected connectedCallback(): void {
    this.append(this.root);
    this.render();
  }
}
customElements.define('free-dom-root-jsx', NxNaiveJsxComponent);
document.body.appendChild(document.createElement('free-dom-root-jsx'));
