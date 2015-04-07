/*****************************************
Progressive.js v0.1 - Brought to you by James Allardice (@james_allardice) and Keith Clark (@keithclarkcouk), freely distributable under the terms of the MIT license.
******************************************/

/*jslint browser: true, plusplus: true */

var Progressive = (function () {

	"use strict";

	var styleElem = document.createElement("style"),
		animationSupport = false,
		animationString,
		keyframePrefix = "",
		domPrefixes = ["Webkit", "Moz", "O", "ms", "Khtml"],
		numPrefixes = domPrefixes.length,
		prefix,
		getElements,
		enhance,
		i;

	// Detect type of element selector and choose fastest DOM selection method
	getElements = function (selector) {
		var selectorType = selector.match(/[^a-zA-Z-]/g), elements;
		if (null === selectorType) {
			elements = document.getElementsByTagName(selector);
		} else if ((selectorType.length === 1) && (selectorType[0] === ".")) {
			elements = document.getElementsByClassName(selector.slice(1));
		} else if ((selectorType.length === 1) && (selectorType[0] === "#")) {
			elements = [document.getElementById(selector.slice(1))];
		} else {
			elements = document.querySelectorAll(selector);
		}
		return elements;
	}

	// Feature/vendor prefix detection for CSS animations
	if (styleElem.style.animationName) {
		animationSupport = true;
	} else {
		for (i = 0; i < numPrefixes; i++) {
			if (styleElem.style[domPrefixes[i] + "AnimationName"] !== undefined) {
				prefix = domPrefixes[i];
				animationString = prefix + "Animation";
				keyframePrefix = "-" + prefix.toLowerCase() + "-";
				animationSupport = true;
				break;
			}
		}
	}

	// The main `enhance` method to register callbacks that will be executed when certain DOM elements are inserted
	enhance = function (enhancements) {
		var ruleText,
			styleRules = {},
			enhancement,
			onNodeInserted,
			// The fallback function is executed on window load. It will handle any elements not handled by the animation callbacks
			fallback = function () {
				var enhancement,
					elems,
					numElems,
					i;
				for (enhancement in enhancements) {
					if (enhancements.hasOwnProperty(enhancement)) {
						elems = getElements(enhancements[enhancement].selector || ("."+enhancements[enhancement].className));
						numElems = elems.length;
						if (!enhancements[enhancement].count || enhancements[enhancement].count < numElems) {
							for (i = 0; i < numElems; i++) {
								enhancements[enhancement].callback.call(elems[i]);
							}
						}
					}
				}
			};
		ruleText = "";
		// This is used as a callback to the CSS animation events. It's used to fire the supplied enhancements, in the context of each element
		onNodeInserted = function (e) {
			var enhancement = enhancements[e.animationName];
			if (enhancement) {
				enhancement.count = ++enhancement.count || 1;
				enhancement.callback.call(e.target);
			}
		};

		if (animationSupport) {
			// Build up a set of CSS rules to run animations on newly inserted elements
			for (enhancement in enhancements) {
				if (enhancements.hasOwnProperty(enhancement)) {
					ruleText += (enhancements[enhancement].selector || "."+enhancements[enhancement].className) + "{";
					ruleText += keyframePrefix + "animation:" + enhancement + " 0.001s;";
					ruleText += "}";
					ruleText += "@" + keyframePrefix + "keyframes " + enhancement + "{from{clip:rect(1px,auto,auto,auto);}to{clip:rect(0px,auto,auto,auto);}}";
				}
			}

			styleRules = document.createTextNode(ruleText);
			styleElem.type = "text/css";
			if (styleElem.styleSheet) {
				styleElem.styleSheet.cssText = styleRules.nodeValue;
			} else {
				styleElem.appendChild(styleRules);
			}

			document.getElementsByTagName("script")[0].parentNode.appendChild(styleElem);

			// Register cross-browser CSS animation event handlers
			document.addEventListener("animationstart", onNodeInserted, false);
			document.addEventListener("oanimationstart", onNodeInserted, false);
			document.addEventListener("MSAnimationStart", onNodeInserted, false);
			document.addEventListener("webkitAnimationStart", onNodeInserted, false);
		}

		// Register fallback event handlers
		if (window.addEventListener) {
			window.addEventListener("load", fallback);
		} else if (window.attachEvent) {
			window.attachEvent("onload", fallback);
		}
	};

	// Expose public methods
	return {
		enhance: enhance
	};

}());
