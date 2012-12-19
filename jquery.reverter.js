/*
 * jquery.reverter.js
 *
 * Keeps an element's attributes versioned. Has two methods, commit and revert, which take a single parameter object of the following format:
 * {
 *   attributes: string /,  // Optional. A string or RegExp describing the attribute(s) to commit or revert to. Defaults to /.+/ (all).
 *   unchain:    boolean,   // Optional. If true, returns the changeset number committed or reverted to. Defaults to false.
 *   changeset:  integer    // Optional. changeset number to commit or revert to. Defaults to a new changeset on commit, and the previous changeset to current on revert.
 * }
 *
 * Because each attribute is of a different variable type, you can ommit object notation and pass any, all, or none of them as distinct parameters for tersness.
 *
 * Default settings can be read or written via $.reverter
 *
 * TODO: 
 * - Cater for forced deletion of unversioned attributes?
 */
 
void function buildReverter($,context){

	// Little bit of underscore to help us with types
	var _ = context._ || {
		has         : function(obj, key) {return hasOwnProperty.call(obj, key)},
		isBoolean   : function(obj) {return obj === true || obj === false || toString.call(obj) == '[object Boolean]'},
		isNumber    : function(obj) {return toString.call(obj) == '[object Number]'},
		isObject    : function(obj) {return obj === Object(obj)},
		isRegExp    : function(obj) {return toString.call(obj) == '[object RegExp]'},
		isString    : function(obj) {return toString.call(obj) == '[object String]'},
		isUndefined : function(obj) {return obj === void 0}
	};
	
	// Default settings
	var defaults = {
		attributes : /.+/,
		unchain    : false
	};
	
	// The state object
	var nativeState = {
		changesets: [],
		current:    -1
	};
	
	// The possible settings, with sanity checks
	var settingTypes = {
		attributes : function(a){return _.isString(a) || _.isRegExp(a)},
		unchain    : function(a){return _.isBoolean(a)},
		changeset  : function(a){return _.isNumber(a)}
	};
	
	// Return all attributes of el, optionally filtered by RegExp 
	function getAttrs(el, expr){ 
		var attrHash = {};
		var attrs    = el.attributes;

		$.each(attrs,function(i, attr){
			if(expr.test(attr.nodeName)) 
				attrHash[attr.nodeName] = attr.nodeValue;
		});

		return attrHash;
	}
		
	// Set attributes of el
	function setAttrs(el, expr, attrHash){
		var $el   = $(el);
		var attrs = el.attributes;

		$.each(attrs, function setAttr(i, attr, NIH){
			if(_.has(attrHash, attr.nodeName)){
				$el.attr(attr.nodeName, attrHash[attr.nodeName]);
			}
			// TODO: NIH (Not Invented Here) caters for situations where you might want to clear any attributes that weren't versioned. 
			// Current API doesn't allow its use, and would require a bit of re-write for it.
			else if(NIH)
				$el.removeAttr(attr.nodeName);
		});
	}
	
	// Super function for parsing logic and housekeeping, handing off to esoteric operations in the middle
	function superReverter(method, a){
		var $el           = this;
		var el            = this.get();
		var reverterState = this.data('reverter') || nativeState;
		
		// Painstakingly determine what settings are desired from our very flexible passed arguments logic
		var passedArgs = [].slice.call(arguments, 1);
		
		var settings = (function determineSettings(){
			var settings = {};
			
			if(a && _.isObject(a)){
				var tempSettings = a;
				
				$.each(tempSettings, function(tempKey, tempVal){
					if(_.has(settingTypes, tempkey) && settingTypes[tempKey](tempVal))
						settings[tempKey] = tempVal;
				});
			}
			else {
				$.each(passedArgs, function(i, arg){
					$.each(settingTypes, function(setting, check){
						if(check(arg))
							settings[setting] = arg;
					});
				});
			}
			
			// To avoid forking about later on, let's force attribute to RegExp
			if(_.isString(settings.attributes))
				settings.attributes = RegExp(settings.attributes);
			
			return $.extend({}, defaults, settings);
		}());
		
		// Do actual stuff
		if(method === 'commit'){
			// TODO: refactor this, it's ugly as fuck
			void function commit(){
				var changeset;

				if(settings.changeset){
					changeset = settings.changeset;
				}
				else{
					changeset = reverterState.changesets.length;
				}
				
				reverterState.changesets[changeset] = getAttrs($el[0], settings.attributes);
				reverterState.current = changeset;
			}();
		}
		else{
			void function revert(){
				var changeset;

				if(settings.changeset && reverterState.history[settings.changeset]){
					changeset = settings.changeset;
				}
				else if(reverterState.current > 0){
					changeset = reverterState.length - 1;
				}
				else {
					return false;
				}
				
				setAttrs($el[0], reverterState.history);
				reverterState.changeset = changeset;
			}();
		}
		
		// Merge data back into the element's history
		$el.data('reverter', reverterState);
		
		if(settings.unchain === true){
			return reverterState.current;
		}
		else{
			return $el;
		}
	}

	function forkReverterMethods(method){
		return function callSuperReverter(){
			var args = [].slice.call(arguments); 
			var args.unshift(method);
			superReverter.apply(this, args)
		}
	};
	
	// Bind jQuery methods
	$.fn.extend({
		'commit' : fork('commit'),
		'revert' : fork('revert')
	});

	// Read or modify default settings. Pass a string to read that default, pass two to change key a to value b, or pass an object to extend.
	$.reverter = function reverterSettings(key, value){
		var params;
		
		if(_.isObject(key)){
			params = key;
		}
		else if(_.isString(key)){
			if(_.isUndefined(value)){
				return defaults[key];
			}
			
			params[key] = value;
		}
		
		if(_.isObject(params)){
			defaults = $.extend({}, defaults, params);
		}
		
		return defaults;
	};
}(jQuery,this);
