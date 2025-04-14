const logNames = ["log", "log10", "log1p", "log2"];
const reciprocals = [["sec", "cos"], ["csc", "sin"], ["cot", "tan"]];
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
        if (!x) result.warning = "Logarithm diverges at 0.";
        return result;
    };
    methods[name] = fn;
});
reciprocals.forEach(([name, invName], i) => {
    ["", "h"].forEach(suffix => {
        const fn = x => {
            const result = {value: 1 / Math[invName + suffix](x)};
            const warning = (!x && i) ? {warning: `${name}${suffix}(${x}) = ${result.value}.`} : {};
            return {...result, ...warning};
        }
        const afn = x => {
            const result = {value: Math["a" + invName + suffix](1 / x)};
            const warning = (!x && i) ? {warning: `a${name}${suffix}(${x}) = ${result.value}.`} : {};
            return {...result, ...warning};
        }
        methods[name + suffix] = fn;
        methods["a" + name + suffix] = afn;
    });
});

const methodLetters = new Set();
Object.keys(methods).forEach(method => methodLetters.add(method[0]));

module.exports = { methods, methodLetters };
