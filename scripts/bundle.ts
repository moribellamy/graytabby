import * as childProcess from 'child_process';
import * as archiver from 'archiver';
import * as fs from 'fs';
import * as path from 'path';
import readdir from 'recursive-readdir';
import rimraf from 'rimraf';

async function rmrf(target: string): Promise<void> {
  return new Promise((resolve, reject) => {
    rimraf(target, error => {
      if (error) reject(error);
      resolve();
    });
  });
}

async function rename(src: string, dst: string): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.rename(src, dst, err => {
      if (err) reject(err);
      resolve();
    });
  });
}

async function subcommand(cmd: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    childProcess.exec(cmd, (err, stdout, stderr) => {
      if (err) reject(err);
      resolve([stdout, stderr]);
    });
  });
}

function abspath(...parts: string[]): string {
  return path.join(process.cwd(), ...parts);
}

async function bundle(): Promise<void> {
  process.chdir(path.join(__dirname, '..'));
  await rmrf(abspath('dist'));
  const build = subcommand('npm run build');

  await rmrf(abspath('pack'));
  fs.mkdirSync(abspath('pack'));
  const zip = archiver.default('zip');
  const output = fs.createWriteStream(abspath('pack', 'chrome.zip'));
  zip.pipe(output);

  await build;
  zip.directory(abspath('dist'), false);
  await zip.finalize();

  process.chdir('dist');
  await subcommand('web-ext build');
  process.chdir('..');
  let basename = '';
  for (const f of await readdir(abspath('dist'))) {
    if (f.endsWith('.zip') && f.includes('dist/web-ext-artifacts')) {
      basename = path.basename(f);
      await rename(f, abspath('pack', basename));
    }
  }
  if (basename === '') {
    throw 'Could not find firefox bundle.';
  }

  basename = basename.substring(0, basename.length - '.zip'.length);
  await rename(abspath('pack', 'chrome.zip'), abspath('pack', `${basename}-chrome.zip`));

  for (const f of await readdir(abspath('pack'))) {
    console.log(f);
  }
}

function run<T>(promise: Promise<T>): void {
  promise.then(
    () => null,
    err => {
      console.error(err);
      process.exit(1);
    },
  );
}

run(bundle());
