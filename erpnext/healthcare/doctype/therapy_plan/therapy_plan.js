// Copyright (c) 2020, Frappe Technologies Pvt. Ltd. and contributors
// For license information, please see license.txt

frappe.ui.form.on('Therapy Plan', {
	setup: function(frm) {
		frm.get_field('therapy_plan_details').grid.editable_fields = [
			{fieldname: 'therapy_type', columns: 6},
			{fieldname: 'no_of_sessions', columns: 2},
			{fieldname: 'sessions_completed', columns: 2}
		];
	},

	refresh: function(frm) {
		if (!frm.doc.__islocal && frm.doc.status != 'Completed') {
			let therapy_types = (frm.doc.therapy_plan_details || []).map(function(d){ return d.therapy_type });
			const fields = [{
				fieldtype: 'Link',
				label: __('Therapy Type'),
				fieldname: 'therapy_type',
				options: 'Therapy Type',
				reqd: 1,
				get_query: function() {
					return {
						filters: { 'therapy_type': ['in', therapy_types]}
					}
				}
			}];

			frm.add_custom_button(__('Therapy Session'), function() {
				frappe.prompt(fields, data => {
					frappe.call({
						method: 'erpnext.healthcare.doctype.therapy_plan.therapy_plan.make_therapy_session',
						args: {
							therapy_plan: frm.doc.name,
							patient: frm.doc.patient,
							therapy_type: data.therapy_type
						},
						freeze: true,
						callback: function(r) {
							if (r.message) {
								frappe.model.sync(r.message);
								frappe.set_route('Form', r.message.doctype, r.message.name);
							}
						}
					});
				}, __('Select Therapy Type'), __('Create'));
			}, __('Create'))
		}
	}
});

frappe.ui.form.on('Therapy Plan Detail', {
	no_of_sessions: function(frm) {
		let total = 0;
		$.each(frm.doc.therapy_plan_details, function(_i, e) {
			total += e.no_of_sessions;
		});
		frm.set_value('total_sessions', total);
		refresh_field('total_sessions');
	}
});