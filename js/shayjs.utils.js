//Ensure That ShayJS exists, else fail
if (typeof (ShayJS) == "undefined") {
	window.console.error("The ShayJS.Utils libray depends on the ShayJS base Library");
}

if (typeof (ShayJS.Utils) == "undefined") {

	ShayJS.Utils = {};
	
	/**
	 * Parse ISO 8601 date/time into a JavaScript date.
	 * ** This function adapted from GData's JavaScript Date/time parser. **
	 * @param {string|jQuery} s ISO 8601 date as a string.
	 * @return {Moment} Parsed JavaScript date object.
	 */
	ShayJS.Utils.fromIso8601 = function(s) {
	  if (!s) {
		return null;
	  }

	  s = s.replace('Z', '+00:00');
	  return moment(s, [
		'YYYY-MM-DDTHH:mm:ssZZ', 'YYYY-MM-DDTHHmmssZZ', 'YYYYMMDDTHHmmssZZ',
		'YYYY-MM-DDTHH:mm:ss',   'YYYY-MM-DDTHHmmss',   'YYYYMMDDTHHmmss',
		'YYYY-MM-DDTHH:mmZZ',    'YYYY-MM-DDTHHmmZZ',   'YYYYMMDDTHHmmZZ',
		'YYYY-MM-DDTHH:mm',      'YYYY-MM-DDTHHmm',     'YYYYMMDDTHHmm',
		'YYYY-MM-DDTHH',                                'YYYYMMDDTHH',
		'YYYY-MM-DD',                                   'YYYYMMDD'
	  ]);
	};
	
	
	
	
	
	

}