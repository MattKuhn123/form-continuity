# form-auto-save

A library that saves the state of a form in local storage as the user fills it out. 

## demo

The email field is used as a unique identifier for each contact. The user can confirm the email by entering it twice. Once
confirmed, the form state will be saved automatically as the user makes changes. The user can select a saved contact from the dropdown to load its state back into the form.

## limitations

- can only support one form on the page.
- the mechanism for selecting a saved form submission is locked-in as a `<select>`, and the options are locked-in as `<option>`s.
- there is no mechanism for deleting saves (besides submitting the `<form>`).
- there is no limit to the number of saves.
- each `input:not([type=radio])` must have a unique name.