const precedence = op => op === '^' ? 2 : ['*', '/'].includes(op) ? 1 : 0;

const binary = (x1, op, x2) => {
    if (op === '+') return {value: x1 + x2};
    if (op === '-') return {value: x1 - x2};
    if (op === '*') return {value: x1 * x2};
    if (op === '/') {
        const result = {value: x1 / x2};
        const warning = (x2) ? {} : {warning: `divide by zero: ${x1} / 0`};
        return {...result, ...warning};
    }
    if (op === "^") {
        if (x1) return {value: x1 ** x2};
        if (!x1 && x2 > 0) return {value: 0};
        if (x1 > 0) return {value: x1 ** x2};
        if (!x1 && x2 ) return {message: `meaningless operation: ${x1} ^ 0`};
    }
    return {message: `no such op: ${op}`};
}

const evalEMDAS = valsAndOps => {
    if (valsAndOps.error) return valsAndOps;
    const {ops: opsIn, vals: valsIn} = valsAndOps;
    let [ops, vals] = [[...opsIn], [...valsIn]];
    if (ops.length !== valsIn.length - 1) return {error: "array-length mismatch"};
    let index = 0;
    // loop thru "ops" vector, evaluating operations in order of their precedence
    while (ops.length) {
        if (index < ops.length && precedence(ops[index]) < precedence(ops[index + 1])) {
            // postpone this operation because of its lower prececence
            index++;
        } else {
            // perform this operation NOW, because of EMDAS rule
            const result = binary(vals[index], ops[index], vals[index + 1]);
            if (result.error) return result;
            vals.splice(index, 2, result.value);
            ops.splice(index, 1);
            index -= (index ? 1 : 0);
        }
    }
    return {value: vals[0]};
}

// console.log("5 = ", evalEMDAS(['+', '*', '-', '^', '/'], [7, 6, 5, 4, 3, 2]), "?");
module.exports = { evalEMDAS };
