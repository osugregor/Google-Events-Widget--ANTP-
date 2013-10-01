ShayJS.DEBUG = true;

ShayJS.extend(ShayJS.defaults, {

	'days_to_show': 25,
	'header_text': 'Google Events',

	'date_format_sameDay': 'MMM D (ddd) - [Today]',
	'date_format_nextDay': 'MMM D (ddd) - [Tomorrow]',
	'date_format_else': 'MMM D (ddd)',
	'use_24hr_format': "false",

	'bg_color': '#000000',
	'header_color_1': '#81a8ce',
	'header_color_2': '#5e87b0',

	'date_color': '#505050',
	'event_title_color': '#ffffff',
	'event_time_color': '#ffffff',
	'event_location_color': '#ffffff',

	'event_old_fade_amount': .5,
	'fetch_interval': 10*60,
	'show_events_which_ended': "true",

    'lastFetch': 'unknown'

});