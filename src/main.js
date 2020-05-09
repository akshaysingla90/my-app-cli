import chalk from 'chalk';
import execa from 'execa';
import fs from 'fs';
import gitignore from 'gitignore';
import Listr from 'listr';
import ncp from 'ncp';
import path from 'path';
import { projectInstall } from 'pkg-install';
import license from 'spdx-license-list/licenses/MIT';
import { promisify } from 'util';
import { MESSAGES, PROJECT_LOCATION, TASK_TITLES } from './utils/constants';

const defaultProjectPath = PROJECT_LOCATION.CURRENT;
const access = promisify(fs.access);
const writeFile = promisify(fs.writeFile);
const copy = promisify(ncp);
const writeGitignore = promisify(gitignore.writeFile);

/* function to create the basic project structure  */
async function copyTemplateFiles(options) {
  return copy(options.templateDirectory, options.targetDirectory, {
    clobber: false,
  });
}

/**function to create git ignore file */
async function createGitignore(options) {
  const file = fs.createWriteStream(
    path.join(options.targetDirectory, '.gitignore'),
    { flags: 'a' }
  );
  return writeGitignore({
    type: 'Node',
    file: file,
  });
}

/**fucntion to create license */
async function createLicense(options) {
  const targetPath = path.join(options.targetDirectory, 'LICENSE');
  const licenseContent = license.licenseText
    .replace('<year>', new Date().getFullYear())
    .replace('<copyright holders>', `${options.author_name} (${options.author_email})`);
  return writeFile(targetPath, licenseContent, 'utf8');
}

/**function to init git repository  */
async function initGit(options) {
  const result = await execa('git', ['init'], {
    cwd: options.targetDirectory,
  });
  if (result.failed) {
    return Promise.reject(new Error(MESSAGES.ERROR_MESSAGES.GIT_INIT_FAIL));
  }
  return;
}

/* function to create project */
export async function createProject(options) {
  options = {
    ...options,
    author_email: 'akshaysingla01@gmail.com',
    author_name: 'Akshay Singla',
  };
  options.runInstall = true;
  options.targetDirectory = options.projectPath == defaultProjectPath ? process.cwd() : path.resolve(process.cwd(), options.name);
  options.templateDirectory = path.resolve(new URL(import.meta.url).pathname, '../../templates', options.framework);
  if (!!fs.existsSync(options.targetDirectory)) {
    console.error(`%s ${MESSAGES.ERROR_MESSAGES.DIRECTORY_ALREADY_EXISTS}`, chalk.red.bold('ERROR'));
    process.exit(1);
  }
  console.log(path.resolve(process.cwd(), options.name))

  /* to check if template directory exits */
  try {

    await access(options.templateDirectory, fs.constants.R_OK);
  } catch (err) {
    console.error(`%s ${MESSAGES.ERROR_MESSAGES.INVALID_TEMPLATE_NAME}`, chalk.red.bold('ERROR'));
    process.exit(1);
  }

  const tasks = new Listr(
    [
      {
        title: TASK_TITLES.PROJECT_SETUP,
        task: () => copyTemplateFiles(options),
      },
      {
        title: TASK_TITLES.CREATE_GIT_IGNORE,
        task: () => createGitignore(options),
      },
      {
        title: TASK_TITLES.CREATE_LICENSE,
        task: () => createLicense(options),
      },
      {
        title: TASK_TITLES.GIT_INIT,
        task: () => initGit(options),
        enabled: () => options.git,
      },
      {
        title: TASK_TITLES.INSTALL_DEPENDENCIES,
        task: () =>
          projectInstall({
            cwd: options.targetDirectory,
          }),
        skip: () =>
          !options.runInstall
            ? 'Pass --install to automatically install dependencies'
            : undefined,
      },
    ],
    {
      exitOnError: false,
    }
  );

  /** function to run the tasks mentioned according to the user's choice */
  await tasks.run();
  console.log(`%s ${MESSAGES.SUCCES_MESSAGE.PROJECT_READY}`, chalk.green.bold(MESSAGES.SUCCES_MESSAGE.DONE));
  return true;
}
