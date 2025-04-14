const { ParseExpression } = require('./parseExpression.js');

const str = "2sin(2asin(sin(PI/6)-1))";
const parser = new ParseExpression(str);
parser.loadEMDAS().evalEMDAS();
const {warning, error} = parser;
console.log("input: ", str);
console.log("output: ", error ? {error} : parser.vals[0]);
if (warning) console.log({warning});
