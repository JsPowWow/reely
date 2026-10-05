import {
  defineRoutes,
  followLinks,
  href,
  memoryHistory,
  Router,
} from '@reely/dommy/router';
import { isNumber } from '@reely/utils';

import css from './router.module.css';

// a folder holds folders and files; a file is its size in kB
interface Folder {
  [name: string]: Folder | number;
}

const drive: Folder = {
  'Q3 plans': { 'budget.xlsx': 48, 'team offsite.docx': 112 },
  Photos: {
    'Office party': { 'cake.jpg': 2300, 'karaoke.mp4': 48000 },
    'logo draft.png': 640,
  },
  'read me.txt': 1,
};

const paths = { drive: '/drive/*path' } as const;

// `*path` keeps its slashes, and href encodes each segment: `/drive/Q3%20plans/budget.xlsx`
const driveHref = (...names: string[]): string =>
  href(paths.drive, { path: names.join('/') });

const itemAt = (names: readonly string[]): Folder | number | undefined =>
  names.reduce<Folder | number | undefined>(
    (item, name) =>
      item !== undefined && !isNumber(item) && Object.hasOwn(item, name)
        ? item[name]
        : undefined,
    drive
  );

const Crumbs = ({ names }: { names: readonly string[] }): Node => (
  <ol className={css.crumbs} aria={{ ariaLabel: 'Where you are' }}>
    <li>
      <a href={driveHref()}>Drive</a>
    </li>
    {names.map((name, index) => (
      <li>
        <a href={driveHref(...names.slice(0, index + 1))}>{name}</a>
      </li>
    ))}
  </ol>
);

const FolderView = ({
  names,
  folder,
}: {
  names: readonly string[];
  folder: Folder;
}): Node => (
  <div>
    <Crumbs names={names} />
    <h2>{names.at(-1) ?? 'Drive'}</h2>
    <ul className={css.rows}>
      {Object.entries(folder).map(([name, item]) => (
        <li>
          <a href={driveHref(...names, name)}>
            {name}
            <small>
              {isNumber(item)
                ? `${item} kB`
                : `${Object.keys(item).length} items`}
            </small>
          </a>
        </li>
      ))}
    </ul>
  </div>
);

const FileView = ({
  names,
  size,
}: {
  names: readonly string[];
  size: number;
}): Node => (
  <div>
    <Crumbs names={names} />
    <h2>{names.at(-1)}</h2>
    <p>{size} kB, shared with your team.</p>
  </div>
);

const driveRoutes = defineRoutes({
  // the rest of the path names a folder or a file, or nothing: then no route answers
  [paths.drive]: ({ path }) => {
    const names = path.split('/').filter((name) => name !== '');
    const item = itemAt(names);
    if (item === undefined) {
      return undefined;
    }
    return isNumber(item)
      ? (): Node => <FileView names={names} size={item} />
      : (): Node => <FolderView names={names} folder={item} />;
  },
});

export const FilesBrowser = (): Node => {
  const files = memoryHistory(driveHref('Photos', 'Office party'));
  const browser = (
    <div className={css.app}>
      <p className={css.address}>{() => files.path()}</p>
      <section className={css.page}>
        <Router
          routes={driveRoutes}
          history={files}
          catch={(error) => <p className={css.failed}>{error.message}</p>}
        />
      </section>
    </div>
  );
  followLinks(browser, files.navigate);
  return browser;
};
