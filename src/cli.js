import arg from 'arg';
import { createProject } from './main';
import prompts from 'prompts';
import path from 'path';
import { FRAMEWORKS, MESSAGES, PROMPT_QUESTIONS, PROJECT_LOCATION } from './utils/constants';

/* function to validate the project name */
function nameValidater(projectName) {
  var regex = new RegExp('^[a-z\-]+$');
  return (regex.test(projectName)) ? true : false;
}

async function parseArgumentsIntoOptions(rawArgs) {
  const args = arg(
    {
      '--git': Boolean,
      '--yes': Boolean,
      '-g': '--git',
      '-y': '--yes',
    },
    {
      argv: rawArgs.slice(2),
    }
  );
  if (args._.length > 0) {
    let error;
    error = nameValidater(args._.join(' ')) ? "" : MESSAGES.ERROR_MESSAGES.INVALID_PROJECT_NAME;
    if (error) {
      console.log('\x1b[31m%s\x1b[0m', error);
      process.exit();
    }
  }
  return {
    skipPrompts: args['--yes'] || false,
    git: args['--git'] || false,
    name: args._[0],
  };
}

async function promptForMissingOptions(options) {
  const defaultFramework = FRAMEWORKS.EXPRESS.VALUE;
  const defaultProjectPath = 'current';
  if (options.skipPrompts) {
    return {
      ...options,
      projectPath: options.name ? 'create' : defaultProjectPath,
      name: options.name || path.basename(path.resolve(process.cwd())),
      framework: options.framework || defaultFramework,
    };
  }

  const questions = [];

  if (!options.name) {
    questions.push({
      type: 'text',
      name: 'name',
      message: PROMPT_QUESTIONS.PROJECT_NAME,
      validate: nameValidater
    });
  }

  questions.push({
    type: 'select',
    name: 'framework',
    message: PROMPT_QUESTIONS.FRAMEWORK,
    choices: [
      { title: FRAMEWORKS.EXPRESS.PROMPT_TITLE, value: FRAMEWORKS.EXPRESS.VALUE },
      { title: FRAMEWORKS.HAPI.PROMPT_TITLE, value: FRAMEWORKS.HAPI.VALUE }
    ],
    default: defaultFramework,
  });

  questions.push({
    type: 'select',
    name: 'projectPath',
    message: PROMPT_QUESTIONS.PROJECT_LOCATION,
    choices: [
      { title: PROJECT_LOCATION.CREATE.PROMPT_TITLE, value: PROJECT_LOCATION.CREATE.VALUE },
      { title: PROJECT_LOCATION.CURRENT.PROMPT_TITLE, value: PROJECT_LOCATION.CURRENT.VALUE }
    ],
    default: defaultProjectPath,
  });

  if (!options.git) {
    questions.push({
      type: 'confirm',
      name: 'git',
      message: PROMPT_QUESTIONS.GIT,
      default: false,
    });
  }

  const answers = await prompts(questions, {
    onCancel: () => {
      console.log('\x1b[31m%s\x1b[0m', MESSAGES.ERROR_MESSAGES.PROMPT_ABORTED);
      process.exit(1);
    }
  });
  
  return {
    ...options,
    name: options.name || answers.name,
    framework: options.framework || answers.framework,
    git: options.git || answers.git,
    projectPath: options.projectPath || answers.projectPath
  };
}

/** main CLI function  */
export async function cli(args) {
  let options = await parseArgumentsIntoOptions(args);
  options = await promptForMissingOptions(options);
  await createProject(options);
}