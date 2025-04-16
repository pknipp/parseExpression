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
        let fName0 = name + suffix;
        let fInvName0 = invName + suffix;
        methods[fName0] = x => {
            const result = {value: (Math[fName0] !== undefined) ? Math[fName0](x) : 1 / Math[fInvName0](x)};
            result.warnings = (!isGood(result.value)) ? [`${fName0}(${x}) = ${result.value}.`] : [];
            return result;
        };
        let fName1 = "a" + fName0;
        let fInvName1 = "a" + fInvName0;
        methods[fName1] = x => {
            const result = {value: ((Math[fName1] !== undefined) ? (Math[fName1](x)) : (Math[fInvName1](1 / x)))};
            result.warnings = (!isGood(result.value)) ? [`${fName1}(${x}) = ${result.value}.`] : [];
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
