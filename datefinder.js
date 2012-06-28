(function() {
	if(!String.prototype.replaceAll) {
		String.prototype.replaceAll = function(searchvalue,newvalue) {
			var result = this;
			while (result.indexOf(searchvalue) != -1)
				result = result.replace(searchvalue,newvalue);
			return result;
		}
	}
	var DateFinder = function(settings) {
		if(settings && settings.keywords) {
			this.keywords = settings.keywords;
		}
		this.regExps = [];
		for(var i = 0; i < this.keywords.patterns.length; i++) {
			var regExp = this.keywords.patterns[i];
			var monthRegExp = this._prepareMonthRegExp();
			var shortMonthRegExp = this._prepareShortMonthRegExp();
			var separatorRegExp = this._prepareSeparatorRegExp();
			regExp = regExp.replace("dd","[0-9]{2}");
			regExp = regExp.replace("d","[0-9]{1,2}");
			regExp = regExp.replace("mm","[0-9]{2}");
			regExp = regExp.replace("m","[0-9]{1,2}");
			regExp = regExp.replace("yyyy","[0-9]{4}");
			regExp = regExp.replace("yy","[0-9]{2}");
			regExp = regExp.replace("MM",monthRegExp);
			regExp = regExp.replace("M",shortMonthRegExp);
			regExp = regExp.replaceAll("%",separatorRegExp);
			this.regExps[i] = new RegExp(regExp,"i");
		}

	};
	DateFinder.prototype = {
		keywords: {
			day: ["día","dia","dias","días"],
			weekdays: ["lunes","martes","miércoles","miercoles","jueves","viernes","sábado","sabado","domingo"],
			shortWeekdays: ["lun","mar","mie","jue","vie","sab","dom"],
			separators: ["-"," - "," -","- ","/"," /", "/ "," del "," de ", " del año ", " del mes ", " del día "],
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
			shortMonths: ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"],
			year: ["año","años","ano","anos"]
		},
		_prepareRegExp: function(theKeywords) {
			var regExp = "(";
			for(var i = 0; i < theKeywords.length; i++) {
				if(i>0) {
					regExp += "|";
				}
				regExp += theKeywords[i];
			}
			regExp += ")";
			return regExp;
		},
		_prepareSeparatorRegExp: function() {
			return this._prepareRegExp(this.keywords.separators);
		},
		_prepareMonthRegExp: function() {
			return this._prepareRegExp(this.keywords.months);
		},
		_prepareShortMonthRegExp: function() {
			return this._prepareRegExp(this.keywords.shortMonths);
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
				if(nearestDif == -1 || dif < nearestDif) {
					nearestDif = dif;
					nearestIndex = i;
				}
			}

			return numbers[nearestIndex];
		},
		_isBestMatch: function(index) {
			return this.keywords.patterns[index].indexOf("yy") > -1  && this.keywords.patterns[index].toLowerCase().indexOf("m")>-1 && this.keywords.patterns[index].toLowerCase().indexOf("d")>-1;
		},
		_isBetterMatch: function(index0, index1) {
			var val0 = 0;
			var val1 = 0;
			var zeroPattern = this.keywords.patterns[index0];
			var onePattern = this.keywords.patterns[index1];
			val0 = zeroPattern.indexOf("yy") > -1? val0 + 1:val0;
			val1 = onePattern.indexOf("yy") > -1? val1+1:val1;
			val0 = zeroPattern.indexOf("m") > -1? val0 + 1:val0;
			val1 = onePattern.indexOf("m") > -1? val1+1:val1;
			val0 = zeroPattern.indexOf("d") > -1? val0 + 1:val0;
			val1 = onePattern.indexOf("d") > -1? val1+1:val1;
			return val0 >= val1?0:1;

		},
		_searchPatterns: function(text) {
			// Search all regexp in text
			var matchs = [];
			var bestMatch = null;
			for(var i = 0; i < this.regExps.length; i++) {
				var matched = text.match(this.regExps[i]);
				if(matched) {
					if(!bestMatch) {
						bestMatch = {
							matched: matched,
							index: i
						};
						if(this._isBestMatch(i)) {
							break;
						}
					} else {
						if(this._isBetterMatch(bestMatch.index,i) == 1) {
							bestMatch = {
								matched: matched,
								index: i
							};
							if(this._isBestMatch(i)) {
								break;
							}
						}
					}
				}
			}
			if(bestMatch) {
				return bestMatch.matched[0];
			}
			return null;
		},
		searchDateInText: function(text) {
			if(!text || text === "") {
				return null;
			}
			var matched = this._searchPatterns(text);
			return matched;
/*
			// Search year to date
			var yearInText = -1;
			for(var i = 0; i < this.keywords.year.length; i++) {
				var index = text.search(this.keywords.year[i]);
				if (index > -1) {
					yearInText = this._searchNearestNumber(text,index);
				}
			}
			return "01/01/"+yearInText;
			*/
		}
	};
	window.DateFinder = DateFinder;
})();

