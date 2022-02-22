class Turbo {

    constructor() {
        this.settings = {
            loaderPath: '/images/misc/loader.svg',

            animation: {
                duration: 300,
                showClass: 'animation-slide-in-fwd-center',
                hideClass: 'animation-slide-out-bck-center',
            },

            text: {
                save: 'Uložiť',
                confirm: 'Potvrdiť',
                cancel: 'Zrušiť',
                dialog_window: 'Dialógové okno',
                info: 'Info',
                hide: 'Skryť',
                empty: 'Je tu prázdno',
            },

            notification: {
                autoHideTime: 5000,
            },

            logger: {
                custom: false,
            },
        };
    }

    /**
     * Like default function but check if element does not exists
     * @param element
     * @param type
     * @param listener
     * @param options
     */
    addEventListener(element, type, listener, options = {}) {
        element = this.beNode(element);
        if (element) {
            element.addEventListener(type, listener, options);
        }
    }

    /**
     * Log some messages
     * @param message
     */
    log(message) {
        this.settings.logger.custom ? this.settings.logger.custom(message) : console.log(message);
    }

    /**
     * Check if object is empty
     * @param object
     * @returns {boolean}
     */
    isEmpty(object) {
        return Object.keys(object).length === 0;
    }

    /**
     * Show element right after another element
     * @param newNode
     * @param referenceNode
     */
    insertAfter(newNode, referenceNode) {
        referenceNode = this.beNode(referenceNode);
        referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
    }

    /**
     * Convert selector to node
     * @param element
     * @return {Node}
     */
    beNode(element) {
        if (!(element instanceof Node) && typeof element === 'string') {
            element = document.querySelector(element);
        }

        return element;
    }

    /**
     * Get data-* attribute
     * @param element
     * @param dataAttribute
     * @return {string}
     */
    getData(element, dataAttribute) {
        element = this.beNode(element);
        return element.getAttribute(`data-${dataAttribute}`);
    }

    /**
     * Loader function, nice loader will show
     */
    startLoader() {
        let loader = document.createElement('div');

        loader.classList.add('turbo-loader');
        loader.innerHTML = `<img src="${this.settings.loaderPath}" alt="loader">`;

        this.showElement(loader, 'body', 'append');
        loader.style.left = (loader.offsetLeft - loader.offsetWidth / 2) + 'px';
        loader.style.top = (loader.offsetTop - loader.offsetHeight / 2) + 'px';
    }

    /**
     * Hide loader
     */
    endLoader() {
        this.hideElement(document.querySelector('body > .turbo-loader'), this.settings.animation.hideClass, 100);
    }

    showElement(element, destination = 'body', position = 'append', display = 'block', duration = this.settings.animation.duration, animationClass = this.settings.animation.showClass) {
        destination = this.beNode(destination);
        element.classList.add(animationClass);

        if (duration !== 0) {
            element.style.animationDuration = duration + 'ms';
        }
        element.style.display = display;

        if (position === 'prepend') {
            destination.prepend(element);
        } else if (position === 'insertAfter') {
            this.insertAfter(element, destination);
        } else {
            destination.appendChild(element);
        }
    }

    hideElement(element, animationClass = this.settings.animation.hideClass, duration = this.settings.animation.duration) {
        if (element) {
            element = this.beNode(element);
            const startAnimationRegex = /^animation-.+$/;
            let classToDelete = '';

            for (let className of element.classList) {
                let match = startAnimationRegex.exec(className);
                if (match !== null) {
                    classToDelete = match;
                    break;
                }
            }

            if (classToDelete !== '') {
                element.classList.remove(classToDelete);
            }
            element.classList.add(animationClass);

            if (duration !== 0) {
                element.style.animationDuration = duration + 'ms';
            }

            setTimeout(() => {
                element.remove();
            }, duration);
        }
    }

    /**
     * Get all or style property of element
     * @param element
     * @param property
     * @return {string|CSSStyleDeclaration}
     */
    getCss(element, property = '') {
        element = this.beNode(element);
        const style = getComputedStyle(element);

        if (property === '') {
            return style;
        }

        return style.getPropertyValue(property);
    }

    /**
     * Get data from form
     * @param form
     * @param except
     * @return {{}}
     */
    collectFormData(form, except = ['_method', '_token']) {
        form = this.beNode(form);

        const inputs = form.querySelectorAll('input');
        const selects = form.querySelectorAll('select');
        const textareas = form.querySelectorAll('textarea');

        let collectedData = {};

        for (let i = 0; i < inputs.length; i++) {
            const inputName = inputs[i].getAttribute('name');

            if (!except.includes(inputName)) {
                collectedData[inputName] = inputs[i].value;
            }
        }

        for (let i = 0; i < selects.length; i++) {
            const selectName = selects[i].getAttribute('name');

            if (!except.includes(selectName)) {
                collectedData[selectName] = selects[i].value;
            }
        }

        for (let i = 0; i < textareas.length; i++) {
            const textareaName = textareas[i].getAttribute('name');

            if (!except.includes(textareaName)) {
                collectedData[textareaName] = textareas[i].value;
            }
        }

        return collectedData;
    }

    /**
     * Show confirmation dialog with confirmation and cancel buttons
     * @param confirmationText
     * @return {Promise<unknown>}
     */
    confirmation(confirmationText) {
        const confirmation = document.createElement('div');
        confirmation.setAttribute('class', 'overlay');
        confirmation.setAttribute('id', 'turbo-confirmation-dialog');

        confirmation.innerHTML =
            `<div class="turbo-confirmation">
                <div class="turbo-confirmation-content">
                   <p>${confirmationText}</p>
                </div>
                <div class="turbo-confirmation-controls">
                    <button class="confirmation-reject">${this.settings.text.cancel}</button>
                    <button class="confirmation-resolve">${this.settings.text.confirm}</button>
                </div>
            </div>`;

        this.showElement(confirmation, 'body', 'append', 'block', this.settings.animation.duration, this.settings.animation.showClass);

        const confirmationOverlay = document.querySelector('#turbo-confirmation-dialog');

        return new Promise((resolve, reject) => {
            this.addEventListener('.turbo-confirmation .confirmation-resolve', 'click', () => {
                this.hideElement(confirmationOverlay);
                resolve();
            });

            this.addEventListener('.turbo-confirmation .confirmation-reject', 'click', () => {
                this.hideElement(confirmationOverlay);
            });
        });
    }

    /**
     * Show turbo dialog, nice dialog window with custom content, there is default buttons - Save and Cancel
     * After clicking on cancel button, dialog will be closed
     * Automatically append -dialog to id
     * @param heading
     * @param content
     * @param buttons
     * @param id
     */
    showDialog(heading, content, buttons = {}, id = '') {
        const dialogHeading = heading ? heading : this.settings.text.dialog_window;
        const dialogContent = content ? content : `<h1>${this.settings.text.empty}</h1>`;
        const dialogPrimaryButton = {
            value: buttons.primaryButton?.value ? buttons.primaryButton.value : this.settings.text.save,
            class: buttons.primaryButton?.class ? buttons.primaryButton.class : '',
            id: buttons.primaryButton?.id ? buttons.primaryButton.id : '',
            hide: buttons.primaryButton?.hide ? buttons.primaryButton.hide : '',
            callback: buttons.primaryButton?.callback ? buttons.primaryButton.callback : '',
        };
        const dialogCancelButton = {
            value: (buttons.cancelButton?.value) ? buttons.cancelButton.value : this.settings.text.cancel,
            class: (buttons.cancelButton?.class) ? buttons.cancelButton.class : '',
            id: (buttons.cancelButton?.id) ? buttons.cancelButton.id : '',
            hide: (buttons.cancelButton?.hide) ? buttons.cancelButton.hide : '',
        };

        let dialog = document.createElement('div');
        dialog.setAttribute('class', 'overlay');
        dialog.setAttribute('id', id + '-dialog');

        let primaryClasses = dialogPrimaryButton.class !== "" ? ' ' + dialogPrimaryButton.class : '';
        let cancelClasses = dialogCancelButton.class !== "" ? ' ' + dialogCancelButton.class : '';
        let primaryId = dialogPrimaryButton.id === '' ? '' : ` id="${dialogPrimaryButton.id}"`;
        let cancelId = dialogCancelButton.id === '' ? '' : ` id="${dialogCancelButton.id}"`;

        dialog.innerHTML = `<div class="turbo-dialog">
                <h1 class="turbo-dialog-heading">${dialogHeading}</h1>
                <div class="turbo-dialog-content">
                    ${dialogContent}
                </div>
                <div class="turbo-dialog-footer">
                    <div class="turbo-dialog-main-buttons">` +
            (dialogCancelButton.hide ? '' : `<button class="turbo-cancel${cancelClasses}"${cancelId}>${dialogCancelButton.value}</button>`) +
            (dialogPrimaryButton.hide ? '' : `<button class="turbo-primary${primaryClasses}"${primaryId}>${dialogPrimaryButton.value}</button>`) +
            `</div>
                </div>
            </div>`;

        this.showElement(dialog, 'body', 'append');

        if (dialogPrimaryButton.callback !== '') {
            this.addEventListener('.turbo-dialog .turbo-primary', 'click', () => {
                dialogPrimaryButton.callback();
            });
        }

        this.addEventListener(document.querySelector('.turbo-dialog .turbo-cancel'), 'click', (e) => {
            document.querySelector('.turbo-dialog .turbo-cancel').disabled = true;
            let overlay = e.target.closest('.overlay');
            this.hideElement(overlay, 'animation-slide-out-bck-center', this.settings.animation.duration);
        });
    }

    /**
     * Get Turbo Notification
     * This notification can be closed by clicking on button and it is automatically hiding after some time
     * @param message
     * @param heading
     * @param level
     */
    notify(message, heading = this.settings.text.info, level = 'error') {
        const possibleNotificationLevels = ['success', 'info', 'warning', 'error'];

        if (possibleNotificationLevels.includes(level)) {
            let notification = document.createElement('div');
            notification.classList.add('turbo-notification', `turbo-${level}`);
            notification.innerHTML =
                `<i class="turbo-notification-close far fa-times-circle"></i>
                    <div class="notification-level"></div>
                    <div class="turbo-notification-content">
                        <h1>${heading}</h1>
                        <p>${message}</p>
                    </div>`;

            this.showElement(notification, 'body', 'append', 'inline-flex', this.settings.animation.duration, 'animation-slide-in-fwd-left');

            let isHidden = false;

            notification.querySelector('.turbo-notification-close').addEventListener('click', () => {
                this.hideElement(notification, 'animation-slide-out-bck-left', this.settings.animation.duration);
                isHidden = true;
            });

            setTimeout(() => {
                if (!isHidden) {
                    this.hideElement(notification, 'animation-slide-out-bck-left', this.settings.animation.duration);
                    isHidden = true;
                }
            }, this.settings.notification.autoHideTime);
        }
    }

    /**
     * Cancel default enter action
     */
    disableEnter() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
            }
        });
    }

    floatingPlaceholders(element = '') {
        let floatingPlaceholders;
        let searchIn;

        if (element === '') {
            element = this.beNode(element);
            searchIn = element;
        } else {
            searchIn = document;
        }

        floatingPlaceholders = searchIn.querySelectorAll('.input-wrap input:not([type="submit"])');

        for (let i = 0; i < floatingPlaceholders.length; i++) {
            if (floatingPlaceholders[i].value !== '') {
                floatingPlaceholders[i].classList.add('filled');
            }

            turbo.addEventListener(floatingPlaceholders[i], 'input', (e) => {
                if (e.target.value !== '') {
                    e.target.classList.add('filled');
                } else {
                    e.target.classList.remove('filled');
                }
            });
        }
    }

    /**
     * Show and hide dropdown
     * @param dropdown
     * @param dropdownStyle
     * @param arrow
     * @param inverseArrow
     */
    toggleDropdown(dropdown, dropdownStyle = {}, arrow = '', inverseArrow = false) {
        dropdown = this.beNode(dropdown);

        const isOpened = dropdown.classList.contains('opened');

        if (isOpened) {
            if (arrow !== '') {
                this.toggleArrow(arrow, true, inverseArrow);
            }
            dropdown.classList.remove('animation-slide-in-fwd-center', 'opened');
            dropdown.classList.add('animation-slide-out-bck-center', 'hidden');
        } else {
            this.toggleArrow(arrow, false, inverseArrow);
            if (!this.isEmpty(dropdownStyle)) {
                if (inverseArrow) {
                    dropdown.style.bottom = dropdownStyle.y + 'px';
                } else {
                    dropdown.style.top = dropdownStyle.y + 'px';
                }
                dropdown.style.left = dropdownStyle.x + 'px';
                dropdown.style.width = dropdownStyle.width + 'px';
            }

            dropdown.classList.remove('animation-slide-out-bck-center', 'hidden');
            dropdown.classList.add('animation-slide-in-fwd-center', 'opened');
        }
    }

    /**
     * Toggle arrow, top and bottom
     * @param arrow
     * @param open
     * @param inverse
     */
    toggleArrow(arrow, open = true, inverse = false) {
        arrow = this.beNode(arrow);

        if (open) {
            arrow.classList.remove(inverse ? 'arrow-bottom' : 'arrow-top');
            arrow.classList.add(inverse ? 'arrow-top' : 'arrow-bottom');
        } else {
            arrow.classList.remove(inverse ? 'arrow-top' : 'arrow-bottom');
            arrow.classList.add(inverse ? 'arrow-bottom' : 'arrow-top');
        }
    }

}

module.exports = Turbo;