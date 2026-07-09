# Track Form Changes

This Bootstrap5/jQuery plugin annotates a form with the form changes since
last visit.  Within this project, the same logic may be implemented for
other frameworks.

## Generic concept

Although you can use a generic way to explain what happened with the
form, you will also have front-end specific alternatives to
integrate the information with font-end specific syntax.

It all starts with maintaining the version of the form which was used
to produce the submitted data.  You will need to store that version
with the data itself.  This library will handle the differences between
the current version of the form, and the version of the form when the
data was saved last.  That's the concept.

There's only one 'current' version of the form.  When there is no data
yet, then the form will show as any form you are used to.  However, when
the data is edited (hidden form field data-version), then difference
may be explained.

Differences can be expressed in `change-note` blocks (usually a fieldset)
which explain the changes in words, placed anywhere on the webpage.
Every form field can also explain changes made to that specific field.
Effort is made to show that information only when it has an effect,
in interplay with the browser's validation framework.

## Supported front-end libraries

  * Tested for Bootstrap 5.3.8 and jQuery 1.7.1

Please help me port this plugin to other front-ends.

## Visual representation

  * "Andriod style" orange dot (configurable)

  * badges

