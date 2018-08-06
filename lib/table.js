const columns = [];
const chalk = require('chalk');

class Table {
  constructor (columns = [], separator = ' | ') {
    this.columns = columns;
    this.separator = separator;
    if (!columns.length) {
      throw new Error('Table needs at least one column defined');
    }
  }

  addColumn (size, align = 'left') {
    this.columns.push({
      size,
      align
    });
  }

  renderRow (items, colors = {}) {
    const cells = [];
    for (let i = 0; i < this.columns.length; i++) {
      const item = items[i];
      const value = `${item}`;
      let length = this.columns[i].size || value.length;
      if (length.toString().indexOf('.') > -1) {
        length = Math.floor(process.stdout.columns * length);
      }
      const align = this.columns[i].align || 'left';
      const blank = this.columns[i].blank || ' ';
      const color = colors[i] ? chalk[colors[i]] : x => x;
      let str = value.substr(0, length);
      if (align === 'left') {
        str = str.padEnd(length, blank);
      } else if (align === 'right') {
        str = str.padStart(length, blank);
      } else if (align === 'center') {
        const pad = blank.repeat(Math.ceil((length - str.length) * 0.5));
        str = `${pad}${str}${pad}`.substr(0, length);
      }
      cells.push(color(str));
    }
    return cells.join(chalk.gray(this.separator));
  }

  log (items, colors = {}) {
    const str = this.renderRow(items, colors);
    console.log(str);
    return str;
  }
}

module.exports = Table;