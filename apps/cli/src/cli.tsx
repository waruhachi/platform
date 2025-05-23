#!/usr/bin/env node
import { render } from 'ink';
import meow from 'meow';
import { App } from './app.js';

const cli = meow(
  `
	Usage
	  $ npx appdotbuild

	Options
	  --env, -e  Environment (staging|production) [default: production]

	Examples
	  $ npx appdotbuild --env staging
	  $ npx appdotbuild --env production
`,
  {
    importMeta: import.meta,
    flags: {
      env: {
        type: 'string',
        shortFlag: 'e',
        default: 'production',
        choices: ['staging', 'production'],
      },
    },
  },
);

render(<App environment={cli.flags.env} />);
