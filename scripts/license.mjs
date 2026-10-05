// The `prepack` of every published package: its tarball ships the repository's LICENSE.
import { copyFileSync } from 'node:fs';

copyFileSync(new URL('../LICENSE', import.meta.url), 'LICENSE');
