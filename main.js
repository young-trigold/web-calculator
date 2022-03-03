const $ = document.querySelectorAll.bind(document);

const inputEle = $("*#input")[0];
const resultEle = $("*#result")[0];
const items = $(".item");

/**
 * -1+1 => (-1)+1
 * @param {string} form 
 * @returns {string}
 */
function normalize(form) {
  let tempStr = form;
  const badNegNumPattern = /^-\d+(\.\d+)?%?/g;

  if (badNegNumPattern.test(tempStr)) {
    let badNegNum = tempStr.match(badNegNumPattern)[0];
    let goodNegNum = "(" + badNegNum + ")";
    tempStr = tempStr.replace(badNegNum, goodNegNum);
  }

  return tempStr;
}

/**
 * 
 * @param {string} numStr 
 * @returns 
 */
function denormalize(numStr) {
  let tempStr = numStr;
  const badNegNumPattern = /^\(-\d+(\.\d+)?\)/g;

  if (badNegNumPattern.test(tempStr)) {
    let badNegNum = tempStr.match(badNegNumPattern)[0];
    let goodNegNum = badNegNum.slice(1, -1);
    tempStr = tempStr.replace(badNegNum, goodNegNum);
  }

  return tempStr;
}

/**
 * 
 * @param {*} str 
 * @returns 
 */
function calculateALLMA(str) {
  // 处理 0.1 + 0.2
  function getPrecision(num1, num2, type) {
    const num1Precision_ =
      num1.toString().length - (~~num1).toString().length - 1;
    const num1Precision = num1Precision_ < 0 ? 0 : num1Precision_;
    const num2Precision_ =
      num2.toString().length - (~~num2).toString().length - 1;
    const num2Precision = num2Precision_ < 0 ? 0 : num2Precision_;

    switch (type) {
      case "×":
        const MPrecision = num1Precision + num2Precision;
        return MPrecision;
      case "+/-":
        const APrecision = Math.max(num1Precision, num2Precision);
        return APrecision;
      default:
        break;
    }
  }

  const NegNumPattern = /\(-\d+(\.\d+)?%?\)/g;

  /**
   * 
   * @param {*} numStr 
   * @returns 
   */
  function parseNum(numStr) {
    if (numStr.search(NegNumPattern) === -1) {
      if (numStr.lastIndexOf("%") === -1) {
        return parseFloat(numStr);
      } else {
        return parseFloat(numStr) / 100;
      }
    } else {
      if (numStr.lastIndexOf("%") === -1) {
        return parseFloat(numStr.slice(1, -1));
      } else {
        return parseFloat(numStr.slice(1, -1)) / 100;
      }
    }
  }

  /**
   * 
   * @param {*} E 
   * @returns 
   */
  function calculateAllM(E) {
    function calculateM(form) {
      let tempStr = normalize(form);

      let NegNums = [];
      if (tempStr.search(NegNumPattern) !== -1) {
        NegNums = tempStr.match(NegNumPattern);
      }
      let fooStr = tempStr;
      if (NegNums.length === 1) {
        fooStr = tempStr.replace(NegNums[0], "_".repeat(NegNums[0].length));
      } else if (NegNums.length === 2) {
        const fooStr1 = tempStr.replace(
          NegNums[0],
          "_".repeat(NegNums[0].length)
        );
        fooStr = fooStr1.replace(NegNums[1], "_".repeat(NegNums[1].length));
      }
      const operatorIndex = fooStr.search(/(×|÷)/g);
      const operator = tempStr[operatorIndex];
      const num1Str = tempStr.slice(0, operatorIndex);
      const num2Str = tempStr.slice(operatorIndex + 1);

      const num1 = parseNum(num1Str);
      const num2 = parseNum(num2Str);
      const MPrecision = getPrecision(num1, num2, "×");
      if (operator === "×") {
        const result = (num1 * num2).toFixed(MPrecision);
        return result.toString();
      } else {
        const result = num1 / num2;
        return result.toString();
      }
    }

    let tempStr = normalize(E);
    const MExprPattern =
      /((\(-\d+(\.\d+)?%?\))|(\d+(\.\d+)?%?))(×|÷)((\(-\d+(\.\d+)?%?\))|(\d+(\.\d+)?%?))/;
    while (tempStr.search(MExprPattern) !== -1) {
      const MForm = tempStr.match(MExprPattern)[0];
      const result = normalize(calculateM(MForm));
      tempStr = tempStr.replace(MForm, result);
    }
    return tempStr;
  }

  /**
   * 
   * @param {*} E 
   * @returns 
   */
  function calculateAllA(E) {
    function calculateA(form) {
      let tempStr = normalize(form);

      const NegNumPattern = /\(-\d+(\.\d+)?%?\)/g;
      let NegNums = [];
      if (tempStr.search(NegNumPattern) !== -1) {
        NegNums = tempStr.match(NegNumPattern);
      }
      let fooStr = tempStr;
      if (NegNums.length === 1) {
        fooStr = tempStr.replace(NegNums[0], "_".repeat(NegNums[0].length));
      } else if (NegNums.length === 2) {
        const fooStr1 = tempStr.replace(
          NegNums[0],
          "_".repeat(NegNums[0].length)
        );
        fooStr = fooStr1.replace(NegNums[1], "_".repeat(NegNums[1].length));
      }
      const operatorIndex = fooStr.search(/(\+|-)/g);
      const operator = tempStr[operatorIndex];
      const num1Str = tempStr.slice(0, operatorIndex);
      const num2Str = tempStr.slice(operatorIndex + 1);

      const num1 = parseNum(num1Str);
      const num2 = parseNum(num2Str);

      if (operator === "+") {
        const result = (num1 + num2).toFixed(getPrecision(num1, num2, "+/-"));
        return result.toString();
      } else {
        const result = (num1 - num2).toFixed(getPrecision(num1, num2, "+/-"));
        return result.toString();
      }
    }

    let tempStr = normalize(E);
    const AExprPattern =
      /((\(-\d+(\.\d+)?%?\))|(\d+(\.\d+)?%?))(\+|-)((\(-\d+(\.\d+)?%?\))|(\d+(\.\d+)?%?))/;
    while (tempStr.search(AExprPattern) !== -1) {
      const AForm = tempStr.match(AExprPattern)[0];
      const result = normalize(calculateA(AForm));
      tempStr = tempStr.replace(AForm, result);
    }
    return tempStr;
  }
  const MResult = calculateAllM(str);
  const AResult = calculateAllA(MResult);
  if (AResult.search(/^\(-\d+(\.\d+)?%?\)$|^\d+(\.\d+)?%?$/) !== -1) {
    return denormalize(AResult);
  } else {
    return "Error!";
  }
}

/**
 * 
 * @param {*} e 
 */
function update(e) {
  const inputStr = e.srcElement.value;
  const result = calculateALLMA(inputStr);
  resultEle.textContent = result;
}

inputEle.addEventListener("input", update);
inputEle.addEventListener("change", update);

let eqFlag = false;

$("#eq")[0].addEventListener("click", () => {
  eqFlag = true;
  inputEle.value = resultEle.textContent;
  resultEle.textContent = "";
});

$("#backspace")[0].addEventListener("click", () => {
  inputEle.value = inputEle.value.slice(0, inputEle.value.length - 1);
  inputEle.dispatchEvent(new Event("change"));
});

$("#allClear")[0].addEventListener("click", () => {
  inputEle.value = "";
  resultEle.textContent = "";
});

$("#pos-neg")[0].addEventListener("click", () => {
  const inputStr = inputEle.value;
  const tempStr = normalize(inputStr);
  const numStrs = tempStr.match(/((\(-\d+(\.\d+)?%?\))|(\d+(\.\d+)?%?))/g);
  const numStr = numStrs[numStrs.length - 1];
  const numStrIndex = tempStr.lastIndexOf(numStr);

  let _numStr_ = "";
  const isNeg = /\(-\d+(\.\d+)?\)/g.test(numStr);

  if (isNeg) {
    _numStr_ = numStr.match(/(\d+(\.\d+)?)/)[0];
  } else {
    _numStr_ = "(-" + numStr + ")";
  }

  const replacement = denormalize(
    tempStr.slice(0, numStrIndex) +
      _numStr_ +
      tempStr.slice(numStrIndex + numStr.length)
  );
  inputEle.value = replacement;
  inputEle.dispatchEvent(new Event("change"));
});

for (const item of items) {
  let specialOperators = ["AC", "⌫", "=", "±"];

  if (specialOperators.every((ele) => item.textContent !== ele)) {
    item.addEventListener("click", () => {
      if (eqFlag) inputEle.value = "";
      eqFlag = false;
      inputEle.value += item.textContent;
      inputEle.dispatchEvent(new Event("change"));
    });
  }
}
