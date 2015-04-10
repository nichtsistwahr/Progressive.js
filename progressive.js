/*****************************************
Progressive.js v0.1 - Brought to you by James Allardice (@james_allardice) and Keith Clark (@keithclarkcouk), freely distributable under the terms of the MIT license.
******************************************/

/*jslint browser: true, plusplus: true */

var Progressive = (function () {

	"use strict";

	var d = document,
	    styleElem = d.createElement("style"),
	    animationSupport = false,
	    keyframePrefix = "";

	// Detect type of element selector and choose fastest DOM selection method
	function getElements (selector) {
		var selectorType = selector.match(/[^a-zA-Z0-9-]/g), elements;

		if (null === selectorType) {
			elements = d.getElementsByTagName(selector);
		} else if ((selectorType.length === 1) && (selectorType[0] === ".") && (d.getElementsByClassName !== undefined)) {
			elements = d.getElementsByClassName(selector.slice(1));
		} else if ((selectorType.length === 1) && (selectorType[0] === "#")) {
			elements = [d.getElementById(selector.slice(1))];
		} else {
			elements = d.querySelectorAll(selector);
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
	function enhance (enhancements) {
		// Issue callback (if it did not fire for this DOM element before)
		function issueCallback (enhancement, target) {
			var elems = enhancement.elems, i;
			for (i = elems.length-1; i >= 0; --i) {
				if (elems[i] === target) return;
			}
			elems.push(target);
			enhancement.callback.call(target);
		}

		// The fallback function is executed on DOMContentLoaded / window.onload.
		// It will handle any elements not handled by the animation callbacks (e.g. if they are invisible)
		function fallback () {
			var enhancement,
			    elems,
			    numElems,
			    i;
			for (enhancement in enhancements) {
				if (enhancements.hasOwnProperty(enhancement)) {
					elems = getElements(enhancements[enhancement].selector);
					numElems = elems.length;
					for (i = 0; i < numElems; i++) {
						issueCallback(enhancements[enhancement], elems[i]);
					}
				}
			}
			if (window.removeEventListener) {
				d.removeEventListener("animationstart", onNodeInserted);
				d.removeEventListener("webkitAnimationStart", onNodeInserted);
			}
		}

		// This is used as a callback to the CSS animation events. It's used to fire the supplied enhancements, in the context of each element
		function onNodeInserted (e) {
			var enhancement = enhancements[e.animationName];
			if (enhancement) issueCallback(enhancement, e.target);
		}

		if (animationSupport) {
			d.getElementsByTagName('script')[0].parentNode.appendChild(styleElem);
			var styleSheet = styleElem.sheet;
			// Build up a set of CSS rules to run animations on newly inserted elements
			for (var enhancement in enhancements) {
				if (enhancements.hasOwnProperty(enhancement)) {
					enhancements[enhancement].elems = [];
					styleSheet.insertRule(enhancements[enhancement].selector + "{" + keyframePrefix + "animation:" + enhancement + " 0.001s;} ", styleSheet.cssRules.length);
					styleSheet.insertRule("@" + keyframePrefix + "keyframes " + enhancement + "{from{opacity:0.99;}to{opacity:1;}}", styleSheet.cssRules.length);
				}
			}

			// Register cross-browser CSS animation event handlers
			d.addEventListener("animationstart", onNodeInserted, false);
			d.addEventListener("webkitAnimationStart", onNodeInserted, false);
		}
		// Register fallback event handlers
		if (window.addEventListener) { window.addEventListener("DOMContentLoaded", fallback); }
		else { window.attachEvent("onload", fallback); }
	}

	// Expose public methods
	return {
		enhance: enhance
	};

}());
