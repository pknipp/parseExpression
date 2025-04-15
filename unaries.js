const isGood = x => !isNaN(x) && isFinite(x);

const logNames = ["log", "log10", "log1p", "log2"];
const reciprocals = [
    ["sec", "cos"],
    ["csc", "sin"],
    ["cot", "tan"],
    // ["cos", "sec"],
    // ["sin", "csc"],
    // ["tan", "cot"],
];
const nonLogNames = [
    "abs",
    "acos",
    "acosh",
    "asin",
    "asinh",
    "atan",
    "atanh",
    "cbrt",
    "ceil",
    "cos",
    "cosh",
    "exp",
    "expm1",
    "floor",
    "round",
    "sign",
    "sin",
    "sinh",
    "sqrt",
    "tan",
    "tanh",
    "trunc",
];

const methods = {};
nonLogNames.forEach(name => (methods[name] = x => ({value: Math[name](x)})));
logNames.forEach(name => {
    const fn = x => {
        const result = {value: Math[name](x)};
        result.warnings = !x ? ["Logarithm diverges at 0."] : [];
        return result;
    };
    methods[name] = fn;
});
reciprocals.forEach(([name, invName], i) => {
    ["", "h"].forEach(suffix => {
        const fn = x => {
            const result = {value: 1 / Math[invName + suffix](x)};
            result.warnings = (isGood(result.value)) ? [`${name}${suffix}(${x}) = ${result.value}.`] : [];
            return result;
        };
        const afn = x => {
            const result = {value: Math["a" + invName + suffix](1 / x)};
            result.warnings = (isGood(result.value)) ? [`a${name}${suffix}(${x}) = ${result.value}.`] : [];
            return result;
        };
        methods[name + suffix] = fn;
        methods["a" + name + suffix] = afn;
    });
});

const methodLetters = new Set();
Object.keys(methods).forEach(method => methodLetters.add(method[0]));

module.exports = { methods, methodLetters };
