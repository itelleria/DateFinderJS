(function() {
	
	var DateFinder = function(settings) {
		if(settings && settings.keywords) {
			this.keywords = settings.keywords;
		}
	};
	DateFinder.prototype = {
		keywords: {
			day: ["día","dia","dias","días"],
			weekdays: ["lunes","martes","miércoles","miercoles","jueves","viernes","sábado","sabado","domingo"],
			shortWeekdays: ["lun","mar","mie","jue","vie","sab","dom"],
			separators: ["-"," - "," -","- ","/"," /", "/ "," del "," de "],
			/*
			dd -> day 01,02,......31
			d -> day 1,2,3,4,.....31
			DD -> day Sunday, Monday...
			D -> day Sun, Mon, Wed...
			mm -> month 01,02,....12
			m -> month 1,2,3......12
			MM -> Month January, February,....
			M -> Month Jan, Feb,...
			yyyy -> year 1999,2000..
			yy -> year 98,99,00,01..
			% -> separator
			*/
			patterns: [
				"dd%mm%yyyy",
				"dd%mm%yy",
				"dd%m%yyyy",
				"dd%m%yy",
				"d%mm%yyyy",
				"d%mm%yy",
				"d%m%yyyy",
				"d%m%yy",

				"dd%MM%yyyy",
				"dd%MM%yy",
				"dd%M%yyyy",
				"dd%M%yy",
				"d%MM%yyyy",
				"d%MM%yy",
				"d%M%yyyy",
				"d%M%yy",

				"dd%mm",
				"dd%m",
				"dd%MM",
				"dd%M",
				"d%mm",
				"d%m",
				"d%MM",
				"d%M"

			],
			month: ["mes","meses"],
			months: ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"],
			year: ["año","años","ano","anos"]
		},
		_searchNearestNumber: function(text, index) {
			var numberPattern = /\d+/g;
			var numbers = text.match(numberPattern);
			if(!numbers) return -1;
			var indexes = [];
			var i = 0;
			var lastIndex = -1;
			var nearestIndex = -1;
			var nearestDif = -1;
			
			for(; i < numbers.length; i++) {
				indexes[i] = text.indexOf(numbers[i],lastIndex+1);
				lastIndex = indexes[i] + numbers[i].length;
				var dif = index - lastIndex;
				dif = dif < 0?(-1)*dif:dif;
				if(nearestDif == -1 || dif < nearestDif) {
					nearestDif = dif;
					nearestIndex = i;
				}
			}

			return numbers[nearestIndex];
		},
		searchDateInText: function(text) {
			if(!text || text === "") {
				return null;
			}
			// Search year to date
			var yearInText = -1;
			for(var i = 0; i < this.keywords.year.length; i++) {
				var index = text.search(this.keywords.year[i]);
				if (index > -1) {
					yearInText = this._searchNearestNumber(text,index);
				}
			}
			return "01/01/"+yearInText;
		}
	};
	window.DateFinder = DateFinder;
})();

