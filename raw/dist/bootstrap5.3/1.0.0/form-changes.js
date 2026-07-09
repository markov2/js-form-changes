class FormChanges {

	#form;
	#data_version;
	#style;

	form() { return this.#form }
	data_version() { return this.#data_version }

	#start_empty_form() {
		// remove all changes: start with a clean slate.
		$('.change, .change-note', this.#form).remove();
	}

	#pick_values() {
		// Insert the values, we check later whether the changes were successful.
		const form = this.#form;

		$('SELECT[data-pick]', form).map(function () {
			var el = $(this);
			el.val(el.data('pick').split(','));
		});

		$('[data-radio]', form).map(function () {
			var el = $(this);
			$('[name="' + el.data('radio') + '"]', el).val([el.data('pick')]);
		});

		$('[data-checkbox]', form).map(function () {
			var el = $(this);
			$('[name="' + el.data('checkbox') + '"]', el).val(el.data('pick').split(','));
		});
	}

	#remove_expired_notes() {
		const version = this.#data_version;
		$('.change-note[data-change-hide]', this.#form).map(function () {
			var el = $(this);
			if(el.data('change-hide') < version)
			{	el.remove();
			}
		});
	}

	#remove_older_notes() {
		const version = this.#data_version;
		$('.change-note[data-changed-in]', this.#form).map(function () {
			var el = $(this);
			if(el.data('changed-in') < version)
			{	el.remove();
			}
		});
	}

	#install_note_dismissable() {
		$('.change-note.dismissable', this.#form).map(function () {
			var el = $(this);
			el.prepend('<button type="button" class="btn-close change-close" aria-label="Close"></button>');
		});
		$('.change-close').map(function () {
			$(this).on('click', function () {
				$(this).closest('.change').remove();
			});
		});
	}

	#install_changes_new() {
		const form  = this.#form;
		const style = this.#style;

		$('.change-new', form).map(function () {
			var change   = $(this);
			var id       = change.attr('for');
			var field    = $('#' + id, form);
			var required = field.attr('required');
			var missing  = required && field.val()=='';
			var color    = missing ? 'change-fix' : 'change-accept';

			var summary  = '';
			if(style=='pill') {
				summary  = change.data('summary') || (required ? '<b>★</b>' : '<b>+</b>');
			}

			field.replaceWith(
	'<div class="position-relative" id="l-' + id + '">' +
	field.get(0).outerHTML +
	'<span class="change-mark style-' + style + ' ' + color + '">' + summary + '</span>' +
	'</div>'
			);

			$('#l-' + id, form)
				.on('mouseover', function () { change.show() })
				.on('mouseout',  function () { change.hide() });

			$('#' + id, form).on('focusout', function () {
				var f = $(this);
				if(f.val() != '' || !required) {
					$('.change-mark', f.parent()).remove();
				}
			});
		});
	}

	#install_changes_req() {
		const form  = this.#form;
		const style = this.#style;

		$('.change-req', form).map(function () {
			var change  = $(this);
			var id      = change.attr('for');
			var field   = $('#' + id, form);
			if(field.val()!='') { return }

			var summary = '';
			if(style=='pill') {
				summary = change.data('summary') || '<b>★</b>';
			}

			field.replaceWith(
	'<div class="position-relative" id="l-' + id + '">' +
	field.get(0).outerHTML +
	'<span class="change-mark style-' + style + ' change-fix">' + summary + '</span>' +
	'</div>'
			);

			$('#l-' + id,form)
				.on('mouseover', function () { change.show() })
				.on('mouseout',  function () { change.hide() });

			$('#' + id, form).on('focusout', function () {
				var f = $(this);
				if(f.val() != '') {
					$('.change-mark', f.parent()).remove();
				}
			});
		});
	}

	#install_changes_autoreq() {
		const form  = this.#form;
		const style = this.#style;

		$('INPUT[required]', form).map(function () {
			var input = $(this);
			var type  = input.attr('type') || 'text';
			if(type=='checkbox' || type=='radio' || input.val() != '') { return }

			var id = input.attr('id');
			var changes = $('.change[for="' + id + '"]', form);
			if(changes.length != 0) { return }

			var summary = '';
			if(style=='pill') {
				summary = '<b>★</b>';
			}

			input.replaceWith(
	'<div class="position-relative">' +
	input.get(0).outerHTML +
	'<span class="change-mark style-' + style + ' change-fix">' + summary + '</span>' +
	'</div>'
			);

			$('INPUT#' + id, form).on('focusout', function (e) {
				var input = $(this);
				if(input.val() != '') {
					$('.change-mark', input.parent()).remove();
				}
			});
		});
	}

	#install_changes_select() {
		const version = this.#data_version;
		const form    = this.#form;
		const style   = this.#style;

		$('OPTION[data-removed-in]', form).map(function () { $(this).prop('disabled', true) });

		$('.change-sel', form).map(function () {
			var change  = $(this);
			var id      = change.attr('for');
			var select  = $('SELECT#' + id, form);
			if(select.length!=1)
			{	console.log('select#' + id + ' not found');
				return;
			}

			var pick	= select.data('pick') || '';

			// For unclarified reasons, we need to remove the options
			// before wrapping the select with replaceWith().
			$('OPTION[data-removed-in]', select).map(function () {
				var option = $(this);
				if(option.val()!=pick) {
					option.remove();
					return;
				}
				// following changes do not work on Firefox
				option.addClass('change-fix');
				var alt = $("OPTION:not(:disabled):first", select);
				alt.prop('selected', true);
			});

			var added = 0;
			$('OPTION[data-added-in]', select).map(function () {
				var option = $(this);
				added++;
				// following changes do not work on Firefox
				option.addClass('change-accept');
			});

			if(select.val() != pick) {
				var summary = '';
				if(style=='pill') {
					summary = change.data('summary-help') || '<b>?</b>';
				}

				select.replaceWith(
	'<div class="position-relative" id="l-' + id + '">' +
	select.get(0).outerHTML +
	'<span class="change-mark style-' + style + ' change-fix">' + summary + '</span>' +
	'</div>'
				);
			}
			else if(added) {
				var summary = '';
				if(style=='pill') {
					summary = change.data('summary-add') || '<b>+</b>';
				}
				select.replaceWith(
	'<div class="position-relative" id="l-' + id + '">' +
	select.get(0).outerHTML +
	'<span class="change-mark style-' + style + ' change-accept">' + summary + '</span>' +
	'</div>'
				);
			}

			$('#l-' + id, form)
				.on('mouseover', function () { change.show() })
				.on('mouseout',  function () { change.hide();
					$('DIV#l-' + id + ' .change-mark', form).remove();
				 });
		});
	}

	#install_cbrb_change_descr() {
		const form = this.#form;
		$('.change-cb, .change-rb', form).map(function () {
			var change  = $(this);
			var id      = change.attr('for');
			var block   = $('#' + id, form);
			if(block.length!=1)
			{	console.log('block#' + id + ' not found');
				return;
			}

			block.on('mouseover', function () { change.show() })
				 .on('mouseout',  function () { change.hide() });
		});
	}

	#install_changes_checkbox() {
		const form    = this.#form;
		const version = this.#data_version;
		const style   = this.#style;

		$("DIV[data-checkbox] .form-check[data-removed-in]", form).map(function () {
			var cb       = $(this);
			var checkbox = $(".form-check-input", cb);
			var label    = $(".form-check-label", cb);
			if(checkbox.is(":checked") && style=='pill') {
				checkbox.prop('disabled', true);
				var summary = cb.data('summary') || '<b>&mdash;</b>';
				label.prepend('<span class="change-mark badge change-fix">' + summary + '</span> ');
				checkbox.attr('name', '');
			}
			else {
				cb.remove();   // away and not selected: no show
			}
		});

		// both for checkbox as radio the same, at the moment
		$(".form-check[data-added-in]", form).map(function () {
			var cb       = $(this);
			var checkbox = $(".form-check-input", cb);
			var label    = $(".form-check-label", cb);
			var required = checkbox.is(':required');   // f.i. confirm license
			var checked  = checkbox.is(':checked');

			if(style=='pill') {
				var color    = required && !checked ? 'change-fix' : 'change-accept';
				var summary  = cb.data('summary') || (required && !checked ? '<b>★</b>' : '<b>&nbsp;+&nbsp;</b>');
				label.prepend('<span class="change-mark badge ' + color + '">' + summary + '</span> ');
			}
			else if(required && !checked) {
				label.prepend('<span class="change-mark change-fix">&nbsp;⌾&nbsp;</span>&nbsp;');
			}
			else {
				return;
			}

			checkbox.on('click', function () { $('.change-mark', label).remove() });
		});
	}

	#install_changes_radio() {
		const form    = this.#form;
		const version = this.#data_version;
		const style   = this.#style;

		$("DIV[data-radio] .form-check[data-removed-in]", form).map(function () {
			var rb    = $(this);
			var block = rb.parent();
			var radio = $(".form-check-input", rb);
			var label = $(".form-check-label", rb);
			if(radio.is(":checked")) {
				radio.prop('disabled', true);
				var summary = rb.data('summary') || '<b>&mdash;</b>';
				label.prepend('<span class="change-mark badge change-fix">' + summary + '</span> ');
				radio.attr('name', '');
				var alt = $("INPUT[type=radio]:not(:disabled):first", block);
				alt.prop('checked', true);
				$(".form-check-label", alt.parent()).prepend('<span class="change-mark badge change-fix"><b>&nbsp;?&nbsp;</b></span> ');
				alt.trigger('change');

				block.on('click', function () {
					$(".change-mark", block).remove();
					rb.remove();
				});
			}
			else {
				rb.remove();   // away and not selected: no show
			}
		});
		// data-added-in handled by checkbox
	}

	constructor(form, options) { 
		this.#form = form;
		form.addClass('changes');

		const version = $('INPUT#data-version', form).val() || '';
		if(version=='') {
			// new form
			start_empty_form(form);
			// may still pickup some implicit things, continue
		}
		this.#data_version = version;
		this.#style = options.style || form.attr('data-change-style') || 'pill';

		this.#pick_values();
		this.#remove_expired_notes();
		this.#remove_older_notes();
		this.#install_note_dismissable();
		this.#install_changes_new();
		this.#install_changes_req();
		this.#install_changes_autoreq();
		this.#install_changes_select();
		this.#install_changes_checkbox();
		this.#install_changes_radio();
		this.#install_cbrb_change_descr();
	}
}

// https://learn.jquery.com/plugins/basic-plugin-creation/
$.fn.changes = function (options) {
	this.each(function () { new FormChanges($(this), options) });
	return this;
};
