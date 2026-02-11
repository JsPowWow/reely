interface NxPageProps {
  children?: JSX.Element;
}
export const TutorialPage = ({ children }: NxPageProps) => {
  return (
    <div id='nx-page'>
      <nav>
        <a class='Icon' href='/nx'>
          Tutorial
        </a>
        <a href='/tutorial/counters'>Counters</a>
      </nav>
      {children}
    </div>
  );
};
