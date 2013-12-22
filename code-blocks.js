var fs = require('fs')

module.exports = function (file, callback) {
  fs.readFile(file, 'utf-8', function (err, content) {
    if (err) throw err
    var blocks = []
    var block;
    content.split(/\r?\n/).forEach(function (line) {
      var match = line.match(/^\`\`\`([\w_-]+)?\s*$/)
      if (match) {
        if (block) {
          blocks.push(block)
          block = undefined
        } else {
          block = {
            type: match[1],
            content: ""
          }
        }
      } else if (block) {
        block.content += line + "\n"
      }
    })
    callback(null, blocks)
  })
}
