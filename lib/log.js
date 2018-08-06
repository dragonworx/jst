const chalk = require('chalk');
const util = require('util');

const logLine = (len, color = 'white') => console.log(chalk[color]('-'.repeat(len)));
const log = (key, value, color = 'white') => console.log(chalk.bold.white(key + ': ') + chalk[color](util.inspect(value)));

log.line = logLine;

module.exports = log;