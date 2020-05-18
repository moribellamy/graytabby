import * as childProcess from 'child_process';
import * as archiver from 'archiver';
import * as fs from 'fs';
import * as path from 'path';
import * as readdir from 'recursive-readdir';
import rimraf from 'rimraf';

async function rmrf(target: string): Promise<void> {
  return new Promise((resolve, reject) => {
    rimraf(target, error => {
      if (error) reject(error);
      resolve();
    });
  });
}

async function mkdir(target: string): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.mkdir(target, '755', err => {
      if (err) reject(err);
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

async function bundle(): Promise<void> {
  await rmrf('dist');
  const build = subcommand('npm run build');

  await rmrf('pack');
  await mkdir(__dirname + '/pack');
  const zip = archiver.default('zip');
  const output = fs.createWriteStream(__dirname + '/pack/chrome.zip');
  zip.pipe(output);

  await build;
  zip.directory('dist', false);
  await zip.finalize();

  process.chdir('dist');
  await subcommand('web-ext build');
  process.chdir('..');
  let basename = '';
  for (const f of await readdir.default('dist')) {
    if (f.endsWith('.zip') && f.startsWith('dist/web-ext-artifacts')) {
      basename = path.basename(f);
      await rename(f, `pack/${basename}`);
    }
  }
  if (basename === '') {
    throw 'Could not find firefox bundle.';
  }

  basename = basename.substring(0, basename.length - '.zip'.length);
  await rename('pack/chrome.zip', `pack/${basename}-chrome.zip`);
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
