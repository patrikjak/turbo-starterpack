const Turbo = require("./turbo");

class Validator extends Turbo {

    constructor() {
        super();

        /**
         * Errors with parameters should have {additionalValue} replacement
         * You can put custom field name too - {fieldName}
         */
        this.settings.rulesErrors = {
            required: 'Pole {fieldName} je povinné',
            string: 'Pole {fieldName} musí byť reťazec znakov',
            integer: 'Pole {fieldName} musí byť číslo',
            max: 'Maximálna dĺžka pola {fieldName} je {additionalValue}',
            min: 'Minimálna dĺžka pola {fieldName} je {additionalValue}',
            maxNum: 'Maximálne číslo je {additionalValue}',
            minNum: 'Minimálne číslo je {additionalValue}',
        }

        this.settings.rulesMethods = {
            required: this.notEmpty,
            string: this.isString,
            integer: this.isNumber,
            max: this.maxLength,
            min: this.minLength,
            maxNum: this.maxNumber,
            minNum: this.minNumber,
        };
    }

    /**
     * Get object to validate
     * @param formData form data from getFormData method
     * @param rules string separated by pipe - see turboValidator.js for rules
     */
    addValidationRules(formData, rules) {
        let preparedToValidate = {};

        for (const inputName in formData) {
            preparedToValidate[inputName] = {
                value: formData[inputName],
                rules: rules[inputName],
            };
        }

        return preparedToValidate;
    }

    /**
     * Validate data
     * @param data data with input name, value and rules - {inputName: {value: inputValue, rules: validationRules}}
     * @param stopAfterFirst stop validation after first error
     * @return {{}}
     */
    validator(data, stopAfterFirst = false) {
        const validationData = {};
        let validForm = true;

        if (!this.isEmpty(data)) {
            for (const inputData in data) {
                if (typeof data[inputData].rules !== 'undefined') {
                    const validation = this.turboValidate(inputData, data[inputData]);

                    if (typeof validation !== 'undefined') {
                        validationData[inputData] = validation;
                        if (stopAfterFirst) {
                            break;
                        }
                    }
                }
            }
        }

        for (const inputName in validationData) {
            if (typeof validationData[inputName] !== 'undefined' && !validationData[inputName].isValid) {
                validForm = false;
            }
        }

        return {
            isValid: validForm,
            data: validationData,
        };
    }

    /**
     * Prepare data for validation and validate form
     * @param form object with settings or form
     * @param validationRules object with validation rules
     * @param stopAfterFirst show just first error
     * @param errors setting for errors
     * @return boolean
     */
    validate(form, validationRules, stopAfterFirst = false, errors = {show: true, floatingPlaceholders: true}) {
        this.hideFormErrors(form);

        const formData = this.collectFormData(form);

        const dataToValidate = this.addValidationRules(formData, validationRules);
        const validation = this.validator(dataToValidate, stopAfterFirst);

        if (!validation.isValid) {
            if (!this.isEmpty(errors) && errors.show) {
                this.showFormErrors(form, validation.data, !!errors.floatingPlaceholders);
            }
            return false;
        }

        return true;
    }

    turboValidate(inputName, dataAndRules) {
        const testValue = dataAndRules['value'];
        const validationRules = dataAndRules['rules'] ? dataAndRules['rules'].split('|') : [];

        if (validationRules.length > 0) {
            for (const rule of validationRules) {
                let valid;
                let ruleName;
                let fieldName = '';
                let additionalValue = '';
                const colonIndex = rule.indexOf(':');
                const nameIndex = rule.indexOf('>');

                if (colonIndex !== -1) {
                    if (nameIndex !== -1) {
                        if (nameIndex < colonIndex) return false;

                        ruleName = rule.substr(0, colonIndex);
                        fieldName = rule.substr(nameIndex + 1);
                        additionalValue = rule.substr(colonIndex + 1, nameIndex - colonIndex - 1);
                    } else {
                        additionalValue = rule.substr(colonIndex + 1);
                        ruleName = rule.substr(0, colonIndex);
                    }
                    valid = this.settings.rulesMethods[ruleName](testValue, additionalValue);
                } else {
                    if (nameIndex !== -1) {
                        ruleName = rule.substr(0, nameIndex);
                        fieldName = rule.substr(nameIndex + 1);
                        this.settings.rulesMethods[ruleName](testValue);
                    } else {
                        ruleName = rule;
                        valid = this.settings.rulesMethods[rule](testValue);
                    }
                }

                if (!valid) {
                    let ruleError = this.settings.rulesErrors[ruleName];

                    if (ruleError.indexOf('{additionalValue}') > -1) {
                        ruleError = ruleError.replace('{additionalValue}', additionalValue);
                    }

                    if (ruleError.indexOf('{fieldName}') > -1) {
                        ruleError = ruleError.replace('{fieldName}', fieldName);
                    }

                    return ruleError;
                }
            }
        }
    }

    /**
     * Show errors in form
     * @param form form where errors should be showed
     * @param errors error data where object property is input name attribute
     * @param floatingPlaceholder input has floating placeholders
     */
    showFormErrors(form, errors, floatingPlaceholder = true) {
        form = this.beNode(form);

        for (const inputName in errors) {
            let errorMessage = document.createElement('div');
            errorMessage.classList.add('turbo-error');
            errorMessage.innerHTML = `<p class="form-error">${errors[inputName]}</p>`;
            const input = floatingPlaceholder ? (form.querySelector(`input[name="${inputName}"]`) ? form.querySelector(`input[name="${inputName}"]`).parentElement.querySelector('label') : false) : form.querySelector(`input[name="${inputName}"]`);
            if (input) {
                this.showElement(errorMessage, input, 'insertAfter');
            }
        }
    }

    /**
     * Remove all errors from form
     * @param form
     */
    hideFormErrors(form) {
        form = this.beNode(form);
        const errors = form.querySelectorAll('.turbo-error');

        if (errors) {
            for (let i = 0; i < errors.length; i++) {
                errors[i].remove();
            }
        }
    }

    notEmpty(testValue) {
        return !(testValue === '');
    }

    isString(testValue) {
        return typeof testValue === 'string';
    }

    isNumber(testValue) {
        return typeof testValue === 'number';
    }

    maxLength(testValue, max) {
        return testValue.length <= max;
    }

    minLength(testValue, min) {
        return testValue.length >= min;
    }

    maxNumber(testValue, max) {
        return testValue <= max;
    }

    minNumber(testValue, min) {
        return testValue >= min;
    }

    email(testValue) {
        return /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/.test(testValue);
    }

}

module.exports = Validator;