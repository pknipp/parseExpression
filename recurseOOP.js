const { ParseExpression } = require('./parseExpression.js');

const str = "1/0+0^0+log(-0.5)+asin(2)+asec(-0.5)+acsch(-1)+acot(0)";
console.log("str = ", str);
const parser = new ParseExpression(str);
parser.loadEMDAS().evalEMDAS();
const {warnings, error} = parser;
console.log("input: ", str);
console.log("output: ", error ? {error} : parser.vals[0]);
if (warnings.length) {
    console.log("WARNINGS:");
    warnings.forEach(warning => console.log(warning));
}
