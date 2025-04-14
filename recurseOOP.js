const { ParseExpression } = require('./parseExpression.js');

const str = "5+4*3^2-1";
const parser = new ParseExpression(str);
parser.loadEMDAS().evalEMDAS();
console.log(str, " = ", parser.vals[0]);
