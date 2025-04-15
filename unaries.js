const isBad = x => isNaN(x) || !isFinite(x);

const logNames = ["log", "log10", "log1p", "log2"];
const nonLogNames = ["abs", "cbrt", "ceil", "exp", "expm1", "floor", "round", "sign", "sqrt", "trunc"];
const reciprocals = [
    ["sin", "csc"], ["cos", "sec"], ["tan", "cot"],
    ["csc", "sin"], ["sec", "cos"], ["cot", "tan"],
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
        let fullName = name + suffix;
        methods[fullName] = x => {
            const result = {value: (Math[fullName] !== undefined) ? Math[fullName](x) : 1 / Math[invName + suffix](x)};
            result.warnings = (isBad(result.value)) ? [`${name}${suffix}(${x}) = ${result.value}.`] : [];
            return result;
        };
        fullName = "a" + fullName;
        methods["a" + name + suffix] = x => {
            const result = {value: ((Math[fullName] !== undefined) ? (Math[fullName](x)) : (Math["a" + invName + suffix](1 / x)))};
            result.warnings = (isBad(result.value)) ? [`a${name}${suffix}(${x}) = ${result.value}.`] : [];
            return result;
        };
    });
});

const methodLetters = new Set();
Object.keys(methods).forEach(method => methodLetters.add(method[0]));

module.exports = { methods, methodLetters };
