window.refreshEventKey = 'form-auto-save-refresh';
window.refreshedKey = 'form-auto-save-refreshed';
window.isSaveEnabled = () => true;
window.autoSaveKey = () => Math.floor(Math.random() * 10000);

const prefix = 'form-save-';
function saveForm() {
    if (isSaveEnabled()) {
        const formObj = {};
        Array.from(getForm().elements).filter(x => x.hasAttribute('data-auto-save')).forEach(x =>
            // if is checkbox, get checked state instead of value
            formObj[x.name] = x.type === 'checkbox' ? x.checked : x.value
        );

        localStorage.setItem(prefix + autoSaveKey(), JSON.stringify(formObj));
        refresh();
    }
}

function loadForm() {
    getForm().reset();
    const formSave = localStorage.getItem(prefix + getFormSelect().value);
    if (formSave) {
        const formObj = JSON.parse(formSave);
        for (const [key, value] of Object.entries(formObj)) {
            const field = getForm().elements.namedItem(key);
            if (field) {
                field[x.type === 'checkbox' ? "checked" : "value"] = value;
            }
        }
    }

    refresh();
    document.dispatchEvent(new CustomEvent(window.formLoadedKey));
}

function deleteForm() {
    localStorage.removeItem(prefix + autoSaveKey());
    getForm().reset();
    refresh();
}

function getFormSaveKeys() {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(prefix)) {
            keys.push(key.substring(prefix.length));
        }
    }

    return keys;
}

function refreshSaveStatusNotification() {
    if (isSaveEnabled()) {
        getSaveEnabledNotice().style.display = 'block';
        getSaveDisabledNotice().style.display = 'none';
    } else {
        getSaveEnabledNotice().style.display = 'none';
        getSaveDisabledNotice().style.display = 'block';
    }
}

function refreshFormSelect() {
    getFormSelect().innerHTML = `<option>-- Select an option --</option>`;
    getFormSaveKeys().forEach(x =>
        getFormSelect().innerHTML += `<option value="${x}" ${x === autoSaveKey() ? "selected" : ""}>${x}</option>`
    );
}

function refresh() {
    refreshSaveStatusNotification();
    refreshFormSelect();
    document.dispatchEvent(new CustomEvent(window.refreshedKey));
}

function getSaveEnabledNotice() {
    return document.querySelector(`[data-save-enabled-notice]`);
}

function getSaveDisabledNotice() {
    return document.querySelector(`[data-save-disabled-notice]`);
}

function getFormSelect() {
    return document.querySelector(`select[data-form-saves]`);
}

function getDeleteFormButton() {
    return document.querySelector(`button[data-delete-form-save]`);
}

function getForm() {
    return document.querySelector(`form[data-auto-save-form]`);
}

getForm().addEventListener('input', saveForm);
getForm().addEventListener('submit', deleteForm);
getFormSelect().addEventListener('input', loadForm);
getDeleteFormButton().addEventListener('click', deleteForm);
document.addEventListener(refreshEventKey, refresh);
refresh();
