const ParseExpression = require('./parseExpression.js');

// This particular string gives rise to a lot of warnings.
const str = "sqrt(-1)+1/0+0^0+log(-0.5)+(1+2)^3-asin(2)+3sin(3)+asec(-0.5)+acsch(-1)+acot(0)";
const parser = new ParseExpression(str);
parser.loadEMDAS().evalEMDAS();
const {warnings, error} = parser;
console.log("input: ", str);
console.log("output: ", error ? {error} : parser.vals[0]);
if (warnings.length) {
    console.log("WARNINGS:");
    warnings.forEach(warning => console.log(warning));
}
