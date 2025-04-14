const { evalEMDAS } = require('./evalEMDAS.js');
const { methods, methodLetters } = require('./unaries.js');

const PI = 2 * Math.asin(1);

const isNumeric = str => {
	const num = Number(str);
	return !isNaN(num) && isFinite(num);
}

const processArg = expr => {
	// The leading (open)paren has been found by calling function.
	let nParen = 1;
	for (let i = 0; i < expr.length; i++) {
		const char = expr[i];
		if (char === "(") nParen++;
		if (char === ")") nParen--;
		if (!nParen) {
			const [arg, expression] = [expr.slice(0	, i), expr.slice(i + 1)];
			return {...evalEMDAS(loadEMDAS(arg)), expression};
		}
	}
	return {error: `No closing parenthesis was found for string: (${expr}`};
}

const getValue = expression => {
	if (!expression) return {error: "Your expression truncates prematurely."};
	if (methodLetters.has(expression[0])) {
		let parts = expression.split("(");
		const name = parts[0];
		if (!methods.hasOwnProperty(name)) return {error: `unknown function: ${name}.`};
		let result = processArg(parts.slice(1).join("("));
		if (result.error) return result;
		result.value = methods[name](result.value).value;
		return result;
	} else if (expression[0] === "(") {
		return processArg(expression.slice(1));
	} else {
		let p = 1; // index which tracks progress thru expression
		let xStr, value;
		while (p <= expression.length) {
			xStr = expression.slice(0, p);
			if (!['.', '-', '-.'].includes(xStr)) { // It's OK to parse for a #.
				if (!isNumeric(xStr)) break;
				value = Number(xStr);
			}
			p++;
		}
		if (value === undefined) return {
			error: `cannot find a number when parsing ${expression} from left to right`,
		}
		expression = expression.slice(p - 1);
		return {value, expression};
	}
}

const loadEMDAS = expression => {
	if (!expression) return {error: "Expression is empty."};
	expression = expression.split("PI").join(`(${PI})`);
	// The following changes corner cases like -(2+3) to 0-(2+3)
	if (expression[0] === "-") expression = "0" + expression;
	// Elements of these two arrays are interleaved: val/op/val/op.../op/val
	const [vals, ops] = [[], []];
	let result = getValue(expression);
	if (result.error) return result;
	vals.push(result.value);
	expression = result.expression;
	while (expression) {
		let [char, i] = [expression[0], 1];
		// The following handles implied multiplication.
		if (char === "(" || methodLetters.has(char)) [char, i] = ["*", 0];
		ops.push(char);
		expression = expression.slice(i);
		result = getValue(expression);
		if (result.error) return result;
		vals.push(result.value);
		expression = result.expression;
	}
	return {vals, ops};
}

const str = "san(0)";
console.log("str/evalEMDAS = ", str, evalEMDAS(loadEMDAS(str)));
