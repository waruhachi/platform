#!/usr/bin/env node
import { render } from 'ink';
import { App } from './app.js';
import process from 'process';

// keep app alive - else it will exit when there is no scheduled task
process.stdin.resume();
render(<App />);
