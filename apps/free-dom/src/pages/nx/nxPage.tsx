interface NxPageProps {
  children?: JSX.Element;
}
export const NxPage = ({ children }: NxPageProps) => {
  return (
    <div id='nx-page'>
      <nav>
        <a class='Icon' href='/nx'>
          Nx
        </a>
        <a href='/nx/naive'>VanJS style</a>
        <a href='/nx/jsx'>JSX</a>
      </nav>
      {children}
    </div>
  );
};
