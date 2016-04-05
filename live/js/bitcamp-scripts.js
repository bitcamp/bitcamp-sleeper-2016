(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict'

module.exports = {
	registerNav: function (navbar, pinFunc) {
		var handleNav = function () {
			if (pinFunc()) {
				navbar.addClass('fixed');
			} else {
				navbar.removeClass('fixed');
			}
		};
		$(window).resize(function () {
			handleNav();
		});
		$(window).scroll(function () {
			handleNav();
		});
	},

	initializeNav: function (navbar, headingOffset) {
		var navLinks = $('.nav-links a:not(.nav-slider)');
		var numLinks = navLinks.length;
		var navTargets = [];
		for (var i=0; i < numLinks; i++) {
			navTargets.push($(navLinks[i]).attr('href'));
		}

		var getOffset = function () {
			return -navbar.find('.nav-header').height() + headingOffset;
		}

		var handleNavSlider = function () {
			var topOffset = getOffset();
			var section=0;
			var scrollPos = $(window).scrollTop();

			navLinks.removeClass('active');
			while (section < numLinks && scrollPos > $(navTargets[section]).offset().top + topOffset) {
				$(navLinks[section]).addClass('active');
				section++;
			}
			var prevTop = 0;
			var prevLeft = $('.nav-links').offset().left + 15;
			if (section > 0) {
				prevTop = $(navTargets[section-1]).offset().top + topOffset;
				prevLeft = $(navLinks[section-1]).offset().left + $(navLinks[section-1]).width() / 2;
			}
			var sectionTop;
			var sectionLeft;
			if (section < numLinks) {
				sectionTop = $(navTargets[section]).offset().top + topOffset;
				sectionLeft = $(navLinks[section]).offset().left + $(navLinks[section]).width() / 2;
			} else {
				sectionTop = $(document).height() - $(window).height();
				sectionLeft = $('.nav-links').offset().left + $('.nav-links').width();
			}
			var percentBetween = (scrollPos - prevTop) / (sectionTop - prevTop);

			var fullWidth = $('.nav-links').width() - 15;
			var leftSide = $('.nav-links').offset().left + 15;
			var prevPercent = (prevLeft - leftSide) / fullWidth;
			var nextPercent = (sectionLeft - leftSide) / fullWidth;

			var percent = (1 - percentBetween) * prevPercent + (percentBetween) * nextPercent;
			$('#nav-slider').css('width', percent*100 + "%");
		};
		navLinks.click(function (e) {
			$("html, body").animate({ scrollTop: $($(e.target).attr('href')).offset().top + getOffset() + 2 }, 300);
			e.preventDefault();
		});
		$(window).resize(function () {
			handleNavSlider();
		});
		$(window).scroll(function () {
			handleNavSlider();
		});	
	},

	registerCollapse: function (navbar, collapseFunc) {
		var handleNav = function () {
			if (collapseFunc()) {
				navbar.addClass('collapse');
			} else {
				navbar.find('.nav-collapse').css('display', '');
				navbar.removeClass('collapse').removeClass('collapse-in');
			}
		};
		$(window).resize(function () {
			handleNav();
		});	
		$(window).load(function() {
			handleNav();
		})
	},

	initializeCollapse: function () {
		$('.nav-expand').click(function (e) {
			e.preventDefault();
			var navbar = $(this).closest('.pennapps-nav');
			var drawer = navbar.find('.nav-collapse');

			if (navbar.hasClass('collapse-in')) {
				drawer.slideUp(300, function () {
					navbar.removeClass('collapse-in');
				});
			} else {
				drawer.slideDown(300, function () {
					navbar.addClass('collapse-in');
					$('.nav-links a').click(function (e) {
						drawer.slideUp(300, function () {
							navbar.removeClass('collapse-in');
						});
					});
				});
			}
		});
	}
}
},{}],2:[function(require,module,exports){
window.nav = require('./navbar');
},{"./navbar":1}]},{},[2]);
