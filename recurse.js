const { evalEMDAS } = require('./evalEMDAS.js');
const { methodNames } = require('./methodNames.js');
const methodLetters = methodNames.reduce((methodLetters, name) => {
	methodLetters.add(name[0]);
	return methodLetters;
}, new Set());

// This declaration hoisting is needed because of this fn's recursive call in getValue.
// let loadEMDAS;

const isNumeric = str => {
	const num = Number(str);
	return !isNaN(num) && isFinite(num);
}

const processArg = expr => {
	// The leading (open)paren has been found by calling function.
	let nParen = 1;
	for (let i = 1; i < expr.length; i++) {
		const char = expr[i];
		if (char === "(") nParen++;
		if (char === ")") nParen--;
		if (!nParen) {
			const [arg, expression] = [expr.slice(1, i), expr.slice(i + 1)];
			console.log("processArg: arg/expression = ", arg, expression);
			let result = loadEMDAS(arg);
			console.log("27: result = ", result);
			if (result.message) return result;
			console.log("29: result = ", result);
			const {vals, ops} = result;
			result = evalEMDAS(vals, ops);
			console.log("32: result = ", result);
			if (result.message) return result;
			const {value} = result;
			return {value: result.value, expression};
		}
	}
	return {message: `No closing parenthesis was found for string: (${expr}`};
}

const getValue = expressionIn => {
	if (!expressionIn) return {message: "Your expression truncates prematurely."};
	let expression = expressionIn;
	if (methodLetters.has(expression[0])) {
		console.log("top of method arm: expression = ", expression);
		let parts = expression.split("(");
		const methodName = parts[0];
		expression = parts.slice().join("(");
		let result = processArg(expression);
		console.log("result = ", result);
		if (result.message) return result.message;
		console.log("methodName/result.value = ", methodName, result.value);
		return {
			value: Math[methodName](result.value),
			expression: result.expression,
		};
	} else if (expression[0] === "(") {
		let result = processArg(expression);
		if (result.message) return result;
		console.log("result.value = :", result.value);
		return {
			value: result.value,
			expression: result.expression,
		};
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
			message: `cannot find a number when parsing ${expression} from left to right`,
		}
		expression = expression.slice(p - 1);
		return {value, expression};
	}
}

const loadEMDAS = expressionIn => {
	if (!expressionIn) return {message: "Expression is empty."};
	let expression = expressionIn;
	// The following changes corner cases like -(2+3) to 0-(2+3)
	if (expression[0] === "-") expression = "0" + expression;
	// Elements of these two arrays are interleaved: val/op/val/op.../op/val
	const [vals, ops] = [[], []];
	let result = getValue(expression);
	if (result.message) return result;
	vals.push(result.value);
	expression = result.expression;
	while (expression) {
		let [char, i] = [expression[0], 1];
		// The following handles implied multiplication.
		if (char === "(") [char, i] = ["*", 0];
		ops.push(char);
		expression = expression.slice(i);
		result = getValue(expression);
		if (result.message) return result;
		vals.push(result.value);
		expression = result.expression;
	}
	return {vals, ops};
}

const str = "1+2(-exp(3+1)^2)-5";
const {vals, ops} = loadEMDAS(str);
console.log("str/evalEMDAS = ", str, evalEMDAS(vals, ops));
