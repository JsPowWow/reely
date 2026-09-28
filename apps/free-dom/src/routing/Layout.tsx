import type { JSX } from '@reely/dommy';

interface LayoutProps {
  children: JSX.Element;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className='container'>
      <nav>
        <a href='/' className='Icon'>
          FreeDom
        </a>
        <a href='/'>Home</a>
        <a href='/tutorial'>Tutorial</a>
      </nav>
      {children}
      <footer className='footer'>
        <span>free-dom is the playground of reely</span>
        <a href='https://github.com/JsPowWow/reely'>Source on GitHub</a>
      </footer>
    </div>
  );
};
