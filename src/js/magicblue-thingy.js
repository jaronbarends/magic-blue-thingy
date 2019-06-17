// import {MagicBlue} from '../../src/magicblue.js';
import Thingy from "./vendor/thingy/index.js";

(function() {

	'use strict';

	let bulb;
	let bulbObj = {
		toggle: document.getElementById(`toggle--bulb`),
		connectBtn: document.getElementById(`btn--connect-bulb`),
		disconnectBtn: document.getElementById(`btn--disconnect-bulb`),
		isConnected: false,
		isIdle: true
	};

	let thingy;
	let thingyObj = {
		toggle: document.getElementById(`toggle--thingy`),
		connectBtn: document.getElementById(`btn--connect-thingy`),
		disconnectBtn: document.getElementById(`btn--disconnect-thingy`),
		isConnected: false
	};
	let heading = 0;

	const togglePendingClass = 'cb-toggle--is-pending';

	/**
	* init bulb connection toggle
	* @returns {undefined}
	*/
	const initBulbToggle = function() {
		bulbObj.toggle.addEventListener('click', async (e) => {
			const doConnect = bulbObj.toggle.checked;
			if (doConnect) {
				bulbObj.toggle.classList.add(togglePendingClass);
				try {
					bulbObj.isConnected = await bulb.connect();
				} catch(err) {
					bulbObj.isConnected = false;
				}
				setConnectionStatus(bulbObj);
			}
		});
	};

	
	/**
	* init bulb connection toggle
	* @returns {undefined}
	*/
	const initThingyToggle = function() {
		thingyObj.toggle.addEventListener('click', async (e) => {
			const doConnect = thingyObj.toggle.checked;
			if (doConnect) {
				thingyObj.toggle.classList.add(togglePendingClass);
				try {
					thingyObj.isConnected = await thingy.connect();
					console.log(thingyObj.isConnected);
				} catch(err) {
					thingyObj.isConnected = false;
				}
				if (thingyObj.isConnected) {
					// connection was made
					thingy.addEventListener('heading', headingHandler);
					thingy.heading.start();
				}
			} else {
				// go disconnect
				thingyObj.toggle.classList.add(togglePendingClass);
				try {
					thingyObj.isConnected = await !thingy.disconnect();
					console.log(thingyObj.isConnected);
				} catch(err) {
					thingyObj.isConnected = false;// ??
				}
				if (!thingyObj.isConnected) {
					// properly disconnected
					thingy.heading.stop();
					thingy.removeEventListener('heading', headingHandler);
				}
			}
			setConnectionStatus(thingyObj);
		});
	};


	/**
	* init the connect btn
	* @returns {undefined}
	*/
	const initButtons = function() {
		// buttons bulb
		bulbObj.connectBtn.addEventListener('click', async (e) => {
			e.preventDefault();
			bulbObj.isConnected = await bulb.connect();
			setConnectionStatus(bulbObj);
		});
		bulbObj.disconnectBtn.addEventListener('click', (e) => {
			e.preventDefault();
			bulb.disconnect();
			bulbObj.isConnected = false;
			setConnectionStatus(bulbObj);
		});

		// buttons thingy
		thingyObj.connectBtn.addEventListener('click', async (e) => {
			e.preventDefault();
			thingyObj.isConnected = await thingy.connect();
			setConnectionStatus(thingyObj);

			thingy.addEventListener('heading', headingHandler);
			thingy.heading.start();
		});
		thingyObj.disconnectBtn.addEventListener('click', async (e) => {
			e.preventDefault();
			await thingy.disconnect();
			thingyObj.isConnected = false;
			setConnectionStatus(thingyObj);

			thingy.heading.stop();
			thingy.removeEventListener('heading', headingHandler);
		});

	};


	/**
	* handle headingchange
	* @returns {undefined}
	*/
	const headingHandler = function(e) {
		// console.log(e.detail);
		const newHeading = e.detail.heading;
		const minDiff = 1;// minimum difference in heading to do something
		if (Math.abs(heading - newHeading) > minDiff) {
			heading = Math.round(newHeading);
			setRGBByHeading(heading);
		}
	};

	/**
	* set the rgb value based on heading
	* @returns {undefined}
	*/
	const setRGBByHeading = function(heading) {
		const h = heading;
		const s = 100;
		const l = 50;

		let r, g, b;

		({r, g, b} = HSLToRGB(h, s, l));
		if (bulbObj.isConnected) {
			// console.log('go set', rgb);
			setRGB(r, g, b);
		} else {
			console.warn('bulb is not connected');
		}
	};


	/**
	* convert hsl to rgb value
	* https://css-tricks.com/converting-color-spaces-in-javascript/
	* @returns {undefined}
	*/
	function HSLToRGB(h,s,l) {
		// Must be fractions of 1
		s /= 100;
		l /= 100;
	
		let c = (1 - Math.abs(2 * l - 1)) * s,
				x = c * (1 - Math.abs((h / 60) % 2 - 1)),
				m = l - c/2,
				r = 0,
				g = 0,
				b = 0;
	
		if (0 <= h && h < 60) {
			r = c; g = x; b = 0;
		} else if (60 <= h && h < 120) {
			r = x; g = c; b = 0;
		} else if (120 <= h && h < 180) {
			r = 0; g = c; b = x;
		} else if (180 <= h && h < 240) {
			r = 0; g = x; b = c;
		} else if (240 <= h && h < 300) {
			r = x; g = 0; b = c;
		} else if (300 <= h && h < 360) {
			r = c; g = 0; b = x;
		}
		r = Math.round((r + m) * 255);
		g = Math.round((g + m) * 255);
		b = Math.round((b + m) * 255);
	
		// return "rgb(" + r + "," + g + "," + b + ")";
		return {r,g,b};
	}
	
	

	/**
	* get hex value of input by id
	* @returns {undefined}
	*/
	const getValueById = function(id) {
		return parseFloat(document.getElementById(id).value);
	};


	/**
	* set current connection status
	* @returns {undefined}
	*/
	const setConnectionStatus = function(deviceObj) {
		if (deviceObj.isConnected) {
			deviceObj.toggle.checked = true;
			deviceObj.connectBtn.setAttribute('disabled', 'disabled');
			deviceObj.disconnectBtn.removeAttribute('disabled');
		} else {
			deviceObj.toggle.checked = false;
			deviceObj.connectBtn.removeAttribute('disabled');
			deviceObj.disconnectBtn.setAttribute('disabled', 'disabled');
		}

		deviceObj.toggle.classList.remove(togglePendingClass);
	};



	/**
	* change rgb value
	* @returns {undefined}
	*/
	const setRGB = function(r,g,b) {
		if (bulbObj.isIdle) {
			bulbObj.isIdle = false;
			bulb.setRGB(r, g, b)
				.then(() => {
					bulbObj.isIdle = true;
				});
		}
	};


	/**
	* initialize all
	* @param {string} varname Description
	* @returns {undefined}
	*/
	const init = function() {
		bulb = new MagicBlue();
		thingy = new Thingy({logEnabled: true});
		initButtons();
		initBulbToggle();
		initThingyToggle();
	};

	// kick of the script when all dom content has loaded
	document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();

})();
