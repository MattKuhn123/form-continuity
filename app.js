function onFormSubmit() {
    showFormSubmitResultsDialog();
    return false; // Prevent actual form submission
}

function getFormSubmitResultDialog() {
    return document.getElementById('form-submit-result');
}

function showFormSubmitResultsDialog() {
    getFormSubmitResultDialog().innerHTML = `<header><h2>Submitted!</h2></header>`;
    for (const [key, value] of new FormData(getForm()).entries()) {
        getFormSubmitResultDialog().innerHTML += `${key}: ${value}<br>`;
    }

    getFormSubmitResultDialog().innerHTML += `<footer><button onclick="this.parentElement.parentElement.close()" class="full-width">Close</button></footer>`;
    getFormSubmitResultDialog().showModal();
}

function getEmailFieldValue() {
    return getEmailField() ? getEmailField().value : '';
}

function getEmailField() {
    return getForm().elements.namedItem('email');
}

function getConfirmEmailField() {
    return getForm().elements.namedItem('confirm-email');
}

function isEmailConfirmed() {
    return getEmailField()
        && getEmailField().checkValidity()
        && getEmailField().value !== ''
        && getEmailField().value === getConfirmEmailField().value;
}

window.isSaveEnabled = isEmailConfirmed;
window.autoSaveKey = getEmailFieldValue;
document.querySelectorAll("#email, #confirm-email").forEach(x => x.addEventListener('input', function () {
    document.dispatchEvent(new CustomEvent(window.refreshEventKey));
}));
