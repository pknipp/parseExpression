// This declaration hoisting is needed because of this fn's recursive call in getValue.
let loadEMDAS;

const isNumeric = str => {
	const num = Number(str);
	return !isNaN(num) && isFinite(num);
}

const findSize = expr => {
	// The leading (open)paren has been found by calling function.
	let nParen = 1;
	for (let size = 0; size < expr.length; size++) {
		const char = expr[size];
		if (char === "(") nParen++;
		if (char === ")") nParen--;
		if (!nParen) return {size};
	}
	return {message: `No closing parenthesis was found for string: (${expr}`};
}

const str = "(a)";
console.log("str/findSize(str) = ", str, findSize(str));

const getValue = expressionIn => {
	if (!expressionIn) return {message: "Your expression truncates prematurely."};
	let expression = expressionIn;
	// TO: following is only one if-block.  Other two are parens and unaries.
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

// const str = "-12.34abc";
// console.log("str/getValue(str) = ", str, getValue(str));

loadEMDAS = expressionIn => {
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
	console.log(vals, ops);
	while (expression) {
		let [char, i] = [expression[0], 1];
		// The following handles implied multiplication.
		if (char === "(") [char, i] = ["*", 0];
		ops.push(char);
		expression = expression.slice(j);
		result = getValue(expression);
		if (result.message) return result;
		vals.push(result.value);
		expression = result.expression;
	}
	return {vals, ops};
}

// const str = "-1.2+3.4*5.6-7.8^9";
// console.log("str/loadEMDAS(str) = ", str, loadEMDAS(str));
