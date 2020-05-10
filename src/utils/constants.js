'use strict'

module.exports = {
  PROJECT_LOCATION: {
    CURRENT: { VALUE: 'current', PROMPT_TITLE: 'Current folder' },
    CREATE: { VALUE: 'create', PROMPT_TITLE: 'Create folder from project name' }
  },
  FRAMEWORKS: {
    //todo make it download only specific tag i.e verison 1.0.0 
    EXPRESS: { VALUE: 'express', PROMPT_TITLE: 'Express.js', GIT_REPO: 'https://github.com/akshaysingla90/Express-Boilerplate.git' },
    HAPI: { VALUE: 'hapi', PROMPT_TITLE: 'Hapi.js', GIT_REPO: 'https://github.com/akshaysingla90/Hapi-Boilerplate.git' }
  },
  MESSAGES: require('./message.js'),
  PROMPT_QUESTIONS: {
    PROJECT_NAME: 'What will be your project name?',
    FRAMEWORK: 'Please choose which Node.js framework to use',
    PROJECT_LOCATION: 'Where to generate the project?',
    GIT: 'Should a git be initialized?'
  },
  TASK_TITLES: {
    PROJECT_SETUP: 'Copy project files',
    CREATE_GIT_IGNORE: 'Create gitignore',
    GIT_INIT: 'Create License',
    CREATE_LICENSE: 'Initialize git',
    INSTALL_DEPENDENCIES: 'Install dependencies'
  }
}