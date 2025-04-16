const {
    methods,
    methodLetters,
    binary,
    PI,
    E,
    isNumeric,
    precedence,
} = require('./utils.js');

class ParseExpression {
    constructor(string) {
        this.string = string;
        this.vals = [];
        this.ops = [];
        this.warnings = [];
        this.error = "";
    }

    processArg() {
        const defaultValue = 0; // This gets overwritten in case of no errors.
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
                this.error = argExpression.error;
                if (this.error) return defaultValue;
                argExpression.evalEMDAS();
                this.warnings.push(...argExpression.warnings);
                this.error = argExpression.error;
                if (this.error) return defaultValue;
                return argExpression.vals[0];
            }
        }
        this.error = `No closing parenthesis was found for string: ${this.string}`;
        return defaultValue;
    }

    getValue() {
        const defaultValue = 0;
        if (!this.string) {
            this.error = "Your expression truncates prematurely.";
            return defaultValue;
        }
        if (methodLetters.has(this.string[0])) {
            let parts = this.string.split("(");
            const name = parts[0];
            if (!methods.hasOwnProperty(name)) {
                this.error = `unknown function: ${name}`;
                return defaultValue;
            }
            this.string = parts.slice(1).join("(");
            const value = this.processArg();
            if (this.error) return defaultValue;
            const result = methods[name](value);
            this.warnings.push(...result.warnings);
            return result.value;
        } else if (this.string[0] === "(") {
            this.string = this.string.slice(1);
            const value = this.processArg();
            return (this.error) ? defaultValue : value;
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
                return defaultValue;
            }
            this.string = this.string.slice(p - 1);
            return value;
        }
    }

    loadEMDAS() {
        if (!this.string) {
            this.error = "Expression is empty.";
            return this;
        }
        // Replace PI and E by their numerical values, and replace ** by ^ (to simplify parsing).
        this.string = this.string.split("PI").join(`(${PI})`).split("E").join(`(${E}).split("**").join("^")`);
        // The following changes corner cases like -(2+3) to 0-(2+3)
        if (this.string[0] === "-") this.string = "0" + this.string;
        // A leading "+" can be removed w/no adverse effects.
        if (this.string[0] === "+") this.string = this.string.slice(1);

        // Elements of these two arrays are interleaved: val/op/val/op.../op/val
        // First val:
        let value = this.getValue();
        if (this.error) return this;
        this.vals.push(value);

        // Remaining op-val pairs:
        while (this.string) {
            let [char, i] = [this.string[0], 1];
            // The following handles implied multiplication.
            if (char === "(" || methodLetters.has(char)) [char, i] = ["*", 0];
            this.ops.push(char);
            this.string = this.string.slice(i);
            value = this.getValue();
            if (this.error) return this;
            this.vals.push(value);
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
                const {error, value, warnings} = binary(this.vals[index], this.ops[index], this.vals[index + 1]);
                this.warnings.push(...warnings || []);
                if (error) {
                    this.error = error;
                    return this;
                }
                // Replace two values by one: that returned by the binary operation.
                this.vals.splice(index, 2, value);
                // Remove the operator that was just used in the binary operation.
                this.ops.splice(index, 1);
                index -= (index ? 1 : 0);
            }
        }
        return this.vals[0];
    }
}

module.exports = ParseExpression;
