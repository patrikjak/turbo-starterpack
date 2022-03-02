# Installation

``npm install turbo-starter``

# Turbo Helper
___

Some cool methods to use

## Default settings

```javascript
turbo.settings = {
    loaderPath: '/images/misc/loader.svg',

    animation: {
        duration: 300,
        showClass: 'animation-slide-in-fwd-center',
        hideClass: 'animation-slide-out-bck-center',
    },

    text: {
        save: 'Save',
        edit: 'Edit',
        delete: 'Delete',
        confirm: 'Confirm',
        cancel: 'Cancel',
        dialog_window: 'Dialog window',
        info: 'Info',
        hide: 'Hide',
        empty: 'Empty',
    },

    notification: {
        autoHideTime: 5000,
    },

    logger: {
        custom: false,
    },
}
```

## Methods

`showLoader` - appends loader to body

```javascript
turbo.startLoader();
```

`hideLoader` - hide loader

```javascript
turbo.endLoader();
```

`isEmpty` - check if object is empty

```javascript
const obj = {};

turbo.isEmpty(obj);
// > true
```

`beNode` - convert selector to node if exists

```javascript
const selector = '#my-element';

const element = turbo.beNode(selector);
```

`getData` - get element data attribute

```javascript
const el = document.querySelector('#element');

turbo.getData(el, 'name');
// > 'turbo'
```

`showElement` - show element to destination with nice animation

```javascript
const el = document.createElement('div');
const destination = '#destination-element';

// 'append', 'prepend', 'insertAfter'
const position = 'prepend';
const display = 'flex';

turbo.showElement(el, destination, position, display);
```

`hideElement` - convert selector to node if exists

```javascript
turbo.hideElement('#some-element');
```

`getCss` - get element style

```javascript
const el = document.querySelector('#element');

turbo.getCss(el, 'display');
// > 'inline-block'
```

`collectFormData` - collect form data to object

```javascript
const form = '#form';

turbo.collectFormData(form);
// > {
//      name: 'John',
//      email: 'john@example.com,
//      color: 'blue',  
//   }
```

`confirmation` - show confirmation dialog

```javascript
turbo.confirmation('Are you sure?').then(() => {
    // do something
});
```

`showDialog` - show nice dialog window

```javascript
const content = '<p>Hello, I\'m dialog window</p>';
const buttons = {
    primaryButton: {
        value: 'Confirmation text',
        class: 'some classes',
        id: 'cutom-button-id',
        hide: false,
        callback: () => {
            // do something
        }
    },
    cancelButton: {},
};

turbo.showDialog('Information', content, buttons, 'my-dialog');
```

`notify` - show notification

```javascript
const message = 'Just some information';
const heading = 'Hey!';

turbo.notify(message, heading, 'error');
```

`disableEnter` - disable default enter function

```javascript
turbo.disableEnter();
```

`floatingPlaceholders` - get right functionality of floating placeholders

```javascript
const el = '#my-form';

turbo.floatingPlaceholders(el);
```

`toggleDropdown` - show/hide dropdown content

```javascript
const dropdownElement = document.querySelector('#dropdown-element');
const dropdownContent = document.querySelector('#dropdown-content');
const position = dropdownElement.getBoundingClientRect();
const style = {}

style.width = parseFloat(turbo.getCss('.navigation', 'width')) * .9;
style.x = style.width * .05;
style.y = position.bottom - position.top + position.height;

turbo.toggleDropdown(dropdownContent, style, langSwitcher.querySelector('.arrow'), true);
```

`tableActionsBinding` - show edit and delete buttons for table actions, check and uncheck checkboxes in table

```js
const table = document.querySelector('#my-table');

turbo.tableActionsBinding(table, '')
```

`setCheckedState` - check or uncheck checkboxes in table

Empty array of rowsId will mean all checkboxes should be checked or unchecked

```js
const table = document.querySelector('#my-table');
const checked = true;
const rowsId = [1, 3];

turbo.setCheckedState(table, checked, rowsId);
```

# Turbo Validator
___

## Default settings

```javascript
turbo.settings = {
    rulesErrors: {
        required: 'Pole {fieldName} je povinné',
        string: 'Pole {fieldName} musí byť reťazec znakov',
        integer: 'Pole {fieldName} musí byť číslo',
        max: 'Maximálna dĺžka je {additionalValue}',
        min: 'Minimálna dĺžka je {additionalValue}',
        maxNum: 'Maximálne číslo je {additionalValue}',
        minNum: 'Minimálne číslo je {additionalValue}',
    },

    rulesMethods: {
        required: this.notEmpty,
        string: this.isString,
        integer: this.isNumber,
        max: this.maxLength,
        min: this.minLength,
        maxNum: this.maxNumber,
        minNum: this.minNumber,
    },
};
```

## Usage

### Rules

#### Available rules

- **required** - input cannot be empty
- **string** - is string
- **integer** - is number
- **max** - max length
- **min** - min length
- **maxNum** - maximum number
- **minNum** - minimum number

```javascript
{
    inputName: '{ruleName}:{additionalValue}>{label}'
}
```

### Example
```javascript
const form = document.querySelector('#form');

const rules = {
    name: 'min:2>name',
    email: 'required>email',
};

const stopAfterFirstError = false;
const errorSettings = {
    show: true,
    floatingPlaceholders: false,
};

const valid = validator.validate(form, rules, stopAfterFirstError, errorSettings);

if (valid) {
    // is valid
}
```

## Methods

`showFormErrors` - show errors

### Error object

```javascript
{
    inputName: 'Error message';
}
```

### Example

```javascript
const errors = {
    name: 'Name is required'
};
const floatingPlaceholders = false;

validator.showFormErrors('#my-form', errors, floatingPlaceholders);
```
