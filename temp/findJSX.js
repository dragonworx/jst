class Parser {
  constructor (source) {
    this.source = source;
    this.buffer = '';
    this.mute = false;
    this.parse();
  }

  parse () {
    for (let i = 0; i < this.source.length; i++) {
      const char = this.source.charAt(i);
      this.buffer += char;
      if (this.match(/[`"']/)) {
        console.log('quote', this.lastMatch);
      }
    }
  }

  match (pattern) {
    const match = this.buffer.match(pattern);
    if (match && match.index === this.buffer.length - match[0].length) {
      this.lastMatch = match[0];
      return true;
    }
    return false;
  }
}

module.exports = function (source) {
  const parser = new Parser(source);
  
};