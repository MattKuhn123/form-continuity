document.addEventListener('test', () => {
    console.info('Tests starting');
    
    function beforeEach(test) {
        console.info('Test starting: ' + test);
        document.querySelector('form').reset();
        localStorage.clear();
    }

    function afterEach(test) {
        console.info('Test completed: ' + test);
    }

    function newInputEvent() {
        return new Event('input', { bubbles: true });
    }

    function setField(q, value) {
        document.querySelector(q).value = value;
        document.querySelector(q).dispatchEvent(newInputEvent());
    }

    function getValue(q) {
        return document.querySelector(q).value;
    }

    function isVisible(q) {
        return document.querySelector(q).offsetParent !== null;
    }

    function isNotVisible(q) {
        return isVisible(q) === false;
    }

    const tests = [
        {
            name: "It should show the save-disabled notice if the emails are different",
            fn: async () => {
                setField(`#email`, 'test@mail.com');
                setField(`#confirm-email`, 'x-test@mail.com-x');
                console.assert(isVisible('[data-save-disabled-notice]'), 'Save disabled notice should be visible');
                console.assert(isNotVisible('[data-save-enabled-notice]'), 'Save enabled notice should not be visible');
            }
        },
        {
            name: "It should show the save-enabled notice if the emails are the same",
            fn: async () => {
                setField(`#email`, 'test@mail.com');
                setField(`#confirm-email`, 'test@mail.com');
                console.assert(isVisible('[data-save-enabled-notice]'), 'Save enabled notice should be visible');
                console.assert(isNotVisible('[data-save-disabled-notice]'), 'Save disabled notice should not be visible');
            }
        },
        {
            name: "It should populate the form-saves select with saved forms",
            fn: async () => {
                localStorage.setItem('form-save-mlkkuhn@live.com', JSON.stringify({ "email":"mlkkuhn@live.com", "confirm-email":"mlkkuhn@live.com" }));
                localStorage.setItem('form-save-test@mail.com', JSON.stringify({ "email":"test@mail.com", "confirm-email":"test@mail.com" }));

                document.dispatchEvent(new CustomEvent(window.refreshEventKey));

                const options = document.querySelectorAll(`[data-form-saves] option`);
                console.assert(options.length === 3, 'There should be 3 options in the form-saves select');
                console.assert(options[0].value === '-- Select an option --', 'The first option value should be -- Select an option --');
                console.assert(Array.from(options.entries()).map(x => x[1].value).some(x => x === 'mlkkuhn@live.com'), 'The first option value should be mlkkuhn@live.com');
                console.assert(Array.from(options.entries()).map(x => x[1].value).some(x => x === 'test@mail.com'), 'The second option value should be test@mail.com');
            }
        },
        {
            name: "It should reset and load a saved form when selected from the form-saves select",
            fn: async () => {
                return new Promise(resolve => {
                    let formLoaded = false;
                    document.addEventListener(window.refreshedKey, onRefreshed, { once: true });
                    function onRefreshed() {
                        document.addEventListener(window.formLoadedKey, onFormLoaded, { once: true });
                        document.querySelector(`[data-form-saves]`).selectedIndex = 1;
                        document.querySelector(`[data-form-saves]`).dispatchEvent(new Event('input', { bubbles: true }));
                    }

                    function onFormLoaded () {
                        formLoaded = true;
                        console.assert(getValue(`#email`) === 'x@mail.com', 'Email field should be populated with "x@mail.com"');
                        console.assert(getValue(`#confirm-email`) === 'x@mail.com', 'Confirm email field should be populated with "x@mail.com"');
                        console.assert(getValue(`#first-name`) === 'test', 'First name field should be populated with "test"');
                        console.assert(getValue(`#last-name`) === '', 'Last name field should be reset because it was not in the saved data');
                    }

                    setField(`#last-name`, 'Kuhn');
                    localStorage.setItem('form-save-x@mail.com', JSON.stringify({ "email":"x@mail.com", "confirm-email":"x@mail.com", "first-name":"test" }));
                    document.dispatchEvent(new CustomEvent(window.refreshEventKey));
                    setTimeout(() => {
                        console.assert(formLoaded, 'formLoaded event should have been triggered');
                        resolve();
                    }, 100);
                });
            }
        },
        {
            name: "It should not save any fields that aren't marked with data-auto-save",
            fn: async () => {
                setField(`#email`, 'test@mail.com');
                setField(`#confirm-email`, 'test@mail.com');
                setField(`#first-name`, 'Matt');
                setField(`#ssn`, '123-45-6789');

                const save = JSON.parse(localStorage.getItem('form-save-test@mail.com'));
                console.assert(save["first-name"] === "Matt", 'first-name should be saved in localStorage because it is marked with data-auto-save');
                console.assert(save["ssn"] === undefined, 'SSN should not be saved in localStorage because it is not marked with data-auto-save');
            }
        },
        {
            name: "It should delete the saved form and reset the form when the delete button is clicked",
            fn: async () => {
                return new Promise(resolve => {
                    document.addEventListener(window.refreshedKey, onRefreshed_preDelete, { once: true });
                    function onRefreshed_preDelete() {
                        const options = document.querySelectorAll(`[data-form-saves] option`);
                        console.assert(options.length === 3, 'There should be 3 options in the form-saves select before delete');
                        console.assert(options[0].value === '-- Select an option --', 'The first option value should be -- Select an option --');
                        console.assert(options[1].value === 'test@mail.com', 'The second option value should be test@mail.com');
                        console.assert(options[2].value === 'mlkkuhn@live.com', 'the third option value should be mlkkuhn@live.com');
                        document.addEventListener(window.refreshedKey, onRefreshed_postDelete, { once: true });
                        document.querySelector(`[data-form-saves]`).selectedIndex = 1;
                        document.querySelector(`button[data-delete-form-save]`).dispatchEvent(new Event('click', { bubbles: true }));
                    }

                    function onRefreshed_postDelete() {
                        const options = document.querySelectorAll(`[data-form-saves] option`);
                        console.assert(options.length === 2, 'There should be 2 options in the form-saves select after delete');
                        console.assert(options[0].value === '-- Select an option --', 'The first option value should be -- Select an option --');
                        console.assert(options[1].value === 'mlkkuhn@live.com', 'The second option value should be mlkkuhn@live.com');
                        resolve();
                    }
    
                    localStorage.setItem('form-save-mlkkuhn@live.com', JSON.stringify({ "email":"mlkkuhn@live.com", "confirm-email":"mlkkuhn@live.com" }));
                    localStorage.setItem('form-save-test@mail.com', JSON.stringify({ "email":"test@mail.com", "confirm-email":"test@mail.com" }));
                    document.dispatchEvent(new CustomEvent(window.refreshEventKey));
                });
            }
        }
    ];
    
    tests.forEach(async (test) => {
        beforeEach(test.name);
        await test.fn();
        afterEach(test.name);
    });
});
