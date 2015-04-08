/*****************************************
Progressive.js v0.1 - Brought to you by James Allardice (@james_allardice) and Keith Clark (@keithclarkcouk), freely distributable under the terms of the MIT license.
******************************************/

/*jslint browser: true, plusplus: true */

var Progressive = (function () {

	"use strict";

	var styleElem = document.createElement("style"),
		animationSupport = false,
		keyframePrefix = "",
		getElements,
		enhance;

	// Detect type of element selector and choose fastest DOM selection method
	getElements = function (selector) {
		var selectorType = selector.match(/[^a-zA-Z0-9-]/g), elements;
		// simple polyfill for getElementsByClassName
		document.getElementsByClassName = document.getElementsByClassName || function(e){ return document.querySelectorAll("."+e) };

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
	if (styleElem.style.animationName !== undefined) {
		animationSupport = true;
	} else if (styleElem.style.WebkitAnimationName !== undefined) {
		keyframePrefix = "-webkit-";
		animationSupport = true;
	}

	// The main `enhance` method to register callbacks that will be executed when certain DOM elements are inserted
	enhance = function (enhancements) {
		var ruleText,
			styleRules = {},
			enhancement,
			onNodeInserted,
			// The fallback function is executed on DOMContentLoaded. It will handle any elements not handled by the animation callbacks
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
					ruleText += "@" + keyframePrefix + "keyframes " + enhancement + "{from{opacity:0.99;}to{opacity:1;}}";
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
			document.addEventListener("webkitAnimationStart", onNodeInserted, false);
		} else {
			// Register fallback event handlers
			if (window.addEventListener) { window.addEventListener("DOMContentLoaded", fallback); }
			else { window.attachEvent("onload", fallback); }
		}
	};

	// Expose public methods
	return {
		enhance: enhance
	};

}());
