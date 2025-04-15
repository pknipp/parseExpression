const { ParseExpression } = require('./parseExpression.js');

const str = "1/0+0^0+asin(2)+acos(-1)+acsc(0.5)+acosh(-0.5)+asech(-1)+csc(0)";
const parser = new ParseExpression(str);
parser.loadEMDAS().evalEMDAS();
const {warnings, error} = parser;
console.log("input: ", str);
console.log("output: ", error ? {error} : parser.vals[0]);
console.log("warnings.length = ", warnings.length);
if (warnings.length) warnings.forEach(warning => console.log(warning));
