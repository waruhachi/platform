#!/usr/bin/env node
import { jsx as _jsx } from "react/jsx-runtime";
import { render } from 'ink';
import { App } from './app.js';
import process from 'process';
// keep app alive - else it will exit when there is no scheduled task
process.stdin.resume();
render(_jsx(App, {}));
//# sourceMappingURL=cli.js.map