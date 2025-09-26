window.test = async function () {
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

    function consoleAssert(condition, description) {
        console.assert(condition, description);
        if (condition) {
            window.testResults += `✅ ${description}\n`;
        } else {
            window.testResults += `❌ ${description}\n`;
            window.failedTests++;
        }
    }

    const tests = [
        {
            name: "It should show the save-disabled notice if the emails are different",
            fn: async () => {
                setField(`#email`, 'test@mail.com');
                setField(`#confirm-email`, 'x-test@mail.com-x');
                consoleAssert(isVisible('[data-save-disabled-notice]'), 'Save disabled notice should be visible');
                consoleAssert(isNotVisible('[data-save-enabled-notice]'), 'Save enabled notice should not be visible');
            }
        },
        {
            name: "It should show the save-enabled notice if the emails are the same",
            fn: async () => {
                setField(`#email`, 'test@mail.com');
                setField(`#confirm-email`, 'test@mail.com');
                consoleAssert(isVisible('[data-save-enabled-notice]'), 'Save enabled notice should be visible');
                consoleAssert(isNotVisible('[data-save-disabled-notice]'), 'Save disabled notice should not be visible');
            }
        },
        {
            name: "It should populate the form-saves select with saved forms",
            fn: async () => {
                localStorage.setItem('form-save-mlkkuhn@live.com', JSON.stringify({ "email":"mlkkuhn@live.com", "confirm-email":"mlkkuhn@live.com" }));
                localStorage.setItem('form-save-test@mail.com', JSON.stringify({ "email":"test@mail.com", "confirm-email":"test@mail.com" }));

                document.dispatchEvent(new CustomEvent(window.refreshEventKey));

                const options = document.querySelectorAll(`[data-form-saves] option`);
                consoleAssert(options.length === 3, 'There should be 3 options in the form-saves select');
                consoleAssert(options[0].value === '-- Select an option --', 'The first option value should be -- Select an option --');
                consoleAssert(Array.from(options.entries()).map(x => x[1].value).some(x => x === 'mlkkuhn@live.com'), 'The first option value should be mlkkuhn@live.com');
                consoleAssert(Array.from(options.entries()).map(x => x[1].value).some(x => x === 'test@mail.com'), 'The second option value should be test@mail.com');
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
                        consoleAssert(getValue(`#email`) === 'x@mail.com', 'Email field should be populated with "x@mail.com"');
                        consoleAssert(getValue(`#confirm-email`) === 'x@mail.com', 'Confirm email field should be populated with "x@mail.com"');
                        consoleAssert(getValue(`#first-name`) === 'test', 'First name field should be populated with "test"');
                        consoleAssert(getValue(`#last-name`) === '', 'Last name field should be reset because it was not in the saved data');
                        consoleAssert(getValue(`#favorite-food`) === 'pizza', 'Favorite food field should be populated with "pizza"');
                        consoleAssert(document.querySelector(`[name=gender]:checked`).value === 'male', 'Gender should be male');
                        consoleAssert(document.querySelector(`#confirm`).checked === true, 'Confirm checkbox should be checked');
                    }

                    setField(`#last-name`, 'Kuhn');
                    localStorage.setItem('form-save-x@mail.com', JSON.stringify({ "email":"x@mail.com", "confirm-email":"x@mail.com", "first-name":"test", "favorite-food": "pizza", "gender": "male", "confirm": true }));
                    document.dispatchEvent(new CustomEvent(window.refreshEventKey));
                    setTimeout(() => {
                        consoleAssert(formLoaded, 'formLoaded event should have been triggered');
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
                consoleAssert(save["first-name"] === "Matt", 'first-name should be saved in localStorage because it is marked with data-auto-save');
                consoleAssert(save["ssn"] === undefined, 'SSN should not be saved in localStorage because it is not marked with data-auto-save');
            }
        },
        {
            name: "It should delete the saved form and reset the form when the delete button is clicked",
            fn: async () => {
                return new Promise(resolve => {
                    document.addEventListener(window.refreshedKey, onRefreshed_preDelete, { once: true });
                    function onRefreshed_preDelete() {
                        const options = document.querySelectorAll(`[data-form-saves] option`);
                        consoleAssert(options.length === 3, 'There should be 3 options in the form-saves select before delete');
                        consoleAssert(options[0].value === '-- Select an option --', 'The first option value should be -- Select an option --');
                        consoleAssert(options[1].value === 'test@mail.com', 'The second option value should be test@mail.com');
                        consoleAssert(options[2].value === 'mlkkuhn@live.com', 'the third option value should be mlkkuhn@live.com');
                        document.addEventListener(window.formLoadedKey, onFormLoaded, { once: true });
                        document.querySelector(`[data-form-saves]`).selectedIndex = 1;
                        document.querySelector(`[data-form-saves]`).dispatchEvent(new Event('input', { bubbles: true }));
                    }

                    function onFormLoaded() {
                        document.addEventListener(window.refreshedKey, onRefreshed_postDelete, { once: true });
                        document.querySelector(`button[data-delete-form-save]`).dispatchEvent(new Event('click', { bubbles: true }));
                    }

                    function onRefreshed_postDelete() {
                        const options = document.querySelectorAll(`[data-form-saves] option`);
                        consoleAssert(options.length === 2, 'There should be 2 options in the form-saves select after delete');
                        consoleAssert(options[0].value === '-- Select an option --', 'The first option value should be -- Select an option --');
                        consoleAssert(options[1].value === 'mlkkuhn@live.com', 'The second option value should be mlkkuhn@live.com');
                        resolve();
                    }
    
                    localStorage.setItem('form-save-mlkkuhn@live.com', JSON.stringify({ "email":"mlkkuhn@live.com", "confirm-email":"mlkkuhn@live.com" }));
                    localStorage.setItem('form-save-test@mail.com', JSON.stringify({ "email":"test@mail.com", "confirm-email":"test@mail.com" }));
                    document.dispatchEvent(new CustomEvent(window.refreshEventKey));
                });
            }
        }
    ];
    
    for (const test of tests) {
        beforeEach(test.name);
        await test.fn();
        afterEach(test.name);
    }
}

window.executeTests = async () => {
    window.testResults = "";
    window.failedTests = 0;
    await window.test();
    const blob = new Blob([`Test Results\n============\n\n${window.testResults}\nFailed tests: ${window.failedTests}`], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = "test-results.txt"; 
    a.click();
    URL.revokeObjectURL(a.href);
}

window.executeTests();