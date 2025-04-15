const { methods, methodLetters } = require('./unaries.js');

const [PI, E] = ["PI", "E"].map(name => Math[name]);
const precedence = op => op === '^' ? 2 : ['*', '/'].includes(op) ? 1 : 0;
const isNumeric = str => {
	const num = Number(str);
	return !isNaN(num) && isFinite(num);
}
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

class ParseExpression {
    constructor(string) {
        this.string = string;
        this.vals = [];
        this.ops = [];
        this.warnings = [];
        this.error = "";
    }

    processArg() {
        // The leading (open)paren has been found and removed by calling function.
        let nParen = 1;
        for (let i = 0; i < this.string.length; i++) {
            const char = this.string[i];
            if (char === "(") nParen++;
            if (char === ")") nParen--;
            if (!nParen) {
                const argExpression = new ParseExpression(this.string.slice(0, i));
                this.string = this.string.slice(i + 1);
                argExpression.loadEMDAS();
                this.warnings.push(...argExpression.warnings);
                if (argExpression.error) {
                    this.error = argExpression.error;
                    return this;
                }
                argExpression.evalEMDAS();
                this.warnings.push(...argExpression.warnings);
                if (argExpression.error) {
                    this.error = argExpression.error;
                    return this;
                }
                return {value: argExpression.vals[0]};
            }
        }
        this.error = `No closing parenthesis was found for string: ${this.string}`;
        return this;
    }

    getValue() {
        if (!this.string) {
            this.error = "Your expression truncates prematurely.";
            return this;
        }
        if (methodLetters.has(this.string[0])) {
            let parts = this.string.split("(");
            const name = parts[0];
            if (!methods.hasOwnProperty(name)) {
                this.error = `unknown function: ${name}.`;
                return this;
            }
            this.string = parts.slice(1).join("(");
            let {error, value} = this.processArg();
            if (error) {
                this.error = error;
                return this;
            }
            const result = methods[name](value);
            value = result.value;
            this.warnings.push(...result.warnings);
            return {value};
        } else if (this.string[0] === "(") {
            this.string = this.string.slice(1);
            const {error, value} = this.processArg();
            if (error) {
                this.error = error;
                return this;
            }
            return {value};
        } else {
            let p = 1; // index which tracks progress thru expression
            let xStr, value;
            while (p <= this.string.length) {
                xStr = this.string.slice(0, p);
                if (!['.', '-', '-.'].includes(xStr)) { // It's OK to parse for a #.
                    if (!isNumeric(xStr)) break;
                    value = Number(xStr);
                }
                p++;
            }
            if (value === undefined) {
                this.error = `cannot find a number when parsing ${this.string} from left to right`;
                return this;
            }
            this.string = this.string.slice(p - 1);
            return {value};
        }
    }

    loadEMDAS() {
        if (!this.string) {
            this.error = "Expression is empty.";
            return this;
        }
        this.string = this.string.split("PI").join(`(${PI})`).split("E").join(`(${E})`);
        // The following changes corner cases like -(2+3) to 0-(2+3)
        if (this.string[0] === "-") this.string = "0" + this.string;
        // Elements of these two arrays are interleaved: val/op/val/op.../op/val

        // First val:
        let result = this.getValue();
        if (result.error) {
            this.error = result.error;
            return this;
        }
        this.vals.push(result.value);

        // Remaining op-val pairs:
        while (this.string) {
            let [char, i] = [this.string[0], 1];
            // The following handles implied multiplication.
            if (char === "(" || methodLetters.has(char)) [char, i] = ["*", 0];
            this.ops.push(char);
            this.string = this.string.slice(i);
            result = this.getValue();
            if (result.error) {
                this.error = result.error;
                return this;
            }
            this.vals.push(result.value);
        }
        return this;
    }

    evalEMDAS() {
        if (this.error) return this;
        if (this.ops.length !== this.vals.length - 1) {
            this.error = "array-length mismatch";
            return this;
        }
        let index = 0;
        // loop thru "ops" vector, evaluating operations in order of their precedence
        while (this.ops.length) {
            if (index < this.ops.length && precedence(this.ops[index]) < precedence(this.ops[index + 1])) {
                // postpone this operation because of its lower prececence
                index++;
            } else {
                // perform this operation NOW, because of EMDAS rule
                const result = binary(this.vals[index], this.ops[index], this.vals[index + 1]);
                this.warnings.push(...result.warnings || []);
                if (result.error) {
                    this.error = result.error;
                    return this;
                }
                this.vals.splice(index, 2, result.value);
                this.ops.splice(index, 1);
                index -= (index ? 1 : 0);
            }
        }
        return this.vals[0];
    }
}

module.exports = { ParseExpression };
