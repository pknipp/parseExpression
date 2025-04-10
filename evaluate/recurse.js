let loadEMDAS;

const isNumeric = str => {
	const num = Number(str);
	return !isNaN(num) && isFinite(num);
}

const getValue = expressionIn => {
	if (!expressionIn) return {message: "Your expression truncates prematurely."};
	let expression = expressionIn;
	let p = 0; // index which tracks progress thru expression
	let xStr, value;
	while (p < expression.length) {
		p++;
		xStr = expression.slice(0, p);
		if (!['.', '-', '-.'].includes(xStr)) { // It's OK to parse for a #.
			if (!isNumeric(xStr)) break;
			value = Number(xStr);
		}
	}
	if (value === undefined) return {
		message: `cannot find a number when parsing ${expression} from left to right`,
	}
	expression = expression.slice(p - 1);
	return {value, expression};
}

loadEMDAS = expression => {

	// if x.starts_with("-") && p == 2 && expression.len() > 1 { // examples of this edge case: -sin(x) or -(x+1)**2
		// value = -1.;
		// found_value = true;
	// }
//
	// preparse(&mut expression, 0.);
	// expression = str::replace(&expression, "pi", &format!("({})", PI)); // important constant
  	// for stri in ["div", "DIV", "d", "D"] {
    	// expression = str::replace(&expression, stri, "/"); // division operation is a special URL char
  	// }
	// expression = str::replace(&expression, "**", "^"); // in case user chooses ^ instead of **
//
//
	// Elements of these two vectors are interleaved: val/op/val/op.../op/val
	// let mut vals = vec![];
	// let mut ops = vec![];
	// trim & push leading number from expression
	// vals.push(match get_value(&mut expression) {
		// Err(message) => return Err(message),
		// Ok(value) => value,
	// });
	// let op_string = "+-*/^";
	// loop thru the expression, while trimming & pushing operation/number pairs
	// while !expression.is_empty() {
		// let op = expression.chars().next().unwrap();
		// The following ternary includes an implied multiplication, if appropriate.
		// ops.push(if op_string.contains(op) {expression.remove(0)} else {'*'});
		// vals.push(match get_value(&mut expression) {
			// Err(message) => return Err(message),
			// Ok(value) => value,
		// });
}

const str = "-12.34abc";
console.log("str/getValue(str) = ", str, getValue(str));
