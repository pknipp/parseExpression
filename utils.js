const [PI, E] = ["PI", "E"].map(name => Math[name]);
const logNames = ["log", "log10", "log1p", "log2"];
const nonLogNames = ["abs", "cbrt", "ceil", "exp", "expm1", "floor", "round", "sign", "sqrt", "trunc"];
const reciprocals = [
    ["sin", "csc"], ["cos", "sec"], ["tan", "cot"],
    ["csc", "sin"], ["sec", "cos"], ["cot", "tan"],
];

const isGood = x => !isNaN(x) && isFinite(x);
const isNumeric = str => isGood(Number(str));
const precedence = op => op === '^' ? 2 : ['*', '/'].includes(op) ? 1 : 0;

const methods = {};
nonLogNames.forEach(name => (methods[name] = x => ({value: Math[name](x)})));
logNames.forEach(name => {
    methods[name] = x => ({value: Math[name](x), warnings: !x ? ["Logarithm diverges at 0."] : []});
});
reciprocals.forEach(([name, invName], i) => {
    ["", "h"].forEach(suffix => {
        let fName = name + suffix;
        let fInvName = invName + suffix;
        methods[fName] = x => {
            const result = {value: (Math[fName] !== undefined) ? Math[fName](x) : 1 / Math[fInvName](x)};
            result.warnings = (!isGood(result.value)) ? [`${fName}(${x}) = ${result.value}.`] : [];
            return result;
        };
        fName = "a" + fName;
        fInvName = "a" + fInvName;
        methods[fName] = x => {
            const result = {value: ((Math[fName] !== undefined) ? (Math[fName](x)) : (Math[fInvName](1 / x)))};
            result.warnings = (!isGood(result.value)) ? [`${fName}(${x}) = ${result.value}.`] : [];
            return result;
        };
    });
});

const methodLetters = new Set();
Object.keys(methods).forEach(method => methodLetters.add(method[0]));

const binary = (x1, op, x2) => {
    if (op === '+') return {value: x1 + x2};
    if (op === '-') return {value: x1 - x2};
    if (op === '*') return {value: x1 * x2};
    if (op === '/') {
        const result = {value: x1 / x2};
        const warnings = x2 ? [] : [`${x1}/${x2} = ${result.value}`];
        return {...result, warnings};
    }
    if (op === "^") {
        let warning = `(${x1}) ** ${x2} `;
        const result = {value: x1 ** x2};
        warning = (!x1 && x2 < 0)
            ? `${warning}${result.value}`
                : (x1 < 0 && !Number.isInteger(x2))
                ? `${warning}{result.value}`
                    : (!x1 && !x2)
                    ? `${warning}is ambiguous.`
                        : null;
        return {...result, warnings: warning ? [warning] : []};
    }
    return {error: `no such op: ${op}`};
}

module.exports = { methods, methodLetters, binary, PI, E, isNumeric, precedence };
