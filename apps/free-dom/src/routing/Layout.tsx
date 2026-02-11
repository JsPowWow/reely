interface LayoutProps {
  children: JSX.Element;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className='container'>
      <nav>
        <a href='#' class='Icon'>
          FreeDom
        </a>
        <a href='#'>Home</a>
        <a href='/nx'>Nx</a>
        <a href='/tutorial'>Tutorial</a>
        <a href='#'>Blog</a>
        <a href='#'>Contact</a>
      </nav>
      {children}
      <nav>
        <a href='#' class='Icon'>
          FreeDom
        </a>
        <a href='#'>Home</a>
        <a href='#'>Courses</a>
        <a href='#'>Tutorial</a>
        <a href='#'>Blog</a>
        <a href='#'>Contact</a>
      </nav>
    </div>
  );
};
