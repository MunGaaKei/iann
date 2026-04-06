const COLOR_1 = "#000";
const COLOR_2 = "#212121";

const SPEED = 0.35;
const SCALE = 1.35;
const BRIGHTNESS = 0.9;
const NOISE_FREQUENCY = 2.1;
const NOISE_AMPLITUDE = 1;
const BAND_HEIGHT = 0.5;
const BAND_SPREAD = 1.15;
const OCTAVE_DECAY = 0.35;
const LAYER_OFFSET = 0.25;
const COLOR_SPEED = 0.6;
const ENABLE_MOUSE_INTERACTION = true;
const MOUSE_INFLUENCE = 0.18;

const TARGET_FPS = 30;
const DPR_CAP = 1;
const RENDER_SCALE = 0.7;

function clamp(value, min, max) {
	return Math.min(max, Math.max(min, value));
}

function hexToRgb(hex) {
	const raw = String(hex || "")
		.trim()
		.replace("#", "");
	if (raw.length === 3) {
		const r = parseInt(raw[0] + raw[0], 16);
		const g = parseInt(raw[1] + raw[1], 16);
		const b = parseInt(raw[2] + raw[2], 16);
		return { r, g, b };
	}
	if (raw.length === 6) {
		const r = parseInt(raw.slice(0, 2), 16);
		const g = parseInt(raw.slice(2, 4), 16);
		const b = parseInt(raw.slice(4, 6), 16);
		return { r, g, b };
	}
	return { r: 255, g: 255, b: 255 };
}

function mix(a, b, t) {
	return a + (b - a) * t;
}

function mixRgb(c1, c2, t) {
	return {
		r: Math.round(mix(c1.r, c2.r, t)),
		g: Math.round(mix(c1.g, c2.g, t)),
		b: Math.round(mix(c1.b, c2.b, t)),
	};
}

function fade(t) {
	return t * t * t * (t * (t * 6 - 15) + 10);
}

function lerp(a, b, t) {
	return a + (b - a) * t;
}

function hash2(ix, iy) {
	let x = (ix | 0) * 374761393 + (iy | 0) * 668265263;
	x = (x ^ (x >>> 13)) * 1274126177;
	return ((x ^ (x >>> 16)) >>> 0) / 4294967296;
}

function hash1(i) {
	let x = (i | 0) * 374761393;
	x = (x ^ (x >>> 13)) * 1274126177;
	return ((x ^ (x >>> 16)) >>> 0) / 4294967296;
}

function grad1(i) {
	return hash1(i) * 2 - 1;
}

function perlin1(x) {
	const x0 = Math.floor(x);
	const x1 = x0 + 1;
	const sx = x - x0;
	const g0 = grad1(x0);
	const g1 = grad1(x1);
	const dx0 = x - x0;
	const dx1 = x - x1;
	const n0 = g0 * dx0;
	const n1 = g1 * dx1;
	return lerp(n0, n1, fade(sx));
}

function fbm1(x, octaves, decay) {
	let amp = 0.55;
	let freq = 1;
	let sum = 0;
	let norm = 0;
	for (let i = 0; i < octaves; i++) {
		sum += perlin1(x * freq) * amp;
		norm += amp;
		amp *= clamp(1 - decay, 0, 1);
		freq *= 2;
	}
	return norm > 0 ? sum / norm : 0;
}

function readCssVar(el, name) {
	try {
		const v = getComputedStyle(el).getPropertyValue(name);
		return String(v || "").trim();
	} catch {
		return "";
	}
}

function readColors(el) {
	const c1 = readCssVar(el, "--aurora-color-1") || COLOR_1;
	const c2 = readCssVar(el, "--aurora-color-2") || COLOR_2;
	return { c1: hexToRgb(c1), c2: hexToRgb(c2) };
}

function main() {
	const host = document.getElementById("background");
	if (!host) return;

	const canvas = document.createElement("canvas");
	const ctx = canvas.getContext("2d", { alpha: true });
	if (!ctx) return;
	host.appendChild(canvas);

	let w = 0;
	let h = 0;
	let dpr = 1;
	let raf = 0;
	let lastDraw = 0;

	let mouseX = 0.5;
	let mouseY = 0.5;

	const onPointerMove = (e) => {
		if (!ENABLE_MOUSE_INTERACTION) return;
		const x = e.clientX / Math.max(1, window.innerWidth);
		const y = e.clientY / Math.max(1, window.innerHeight);
		mouseX = clamp(x, 0, 1);
		mouseY = clamp(y, 0, 1);
	};

	const onResize = () => {
		dpr = Math.max(1, Math.min(DPR_CAP, window.devicePixelRatio || 1));
		w = Math.max(1, Math.floor(window.innerWidth));
		h = Math.max(1, Math.floor(window.innerHeight));
		const scale = dpr * RENDER_SCALE;
		canvas.width = Math.floor(w * scale);
		canvas.height = Math.floor(h * scale);
		canvas.style.width = `${w}px`;
		canvas.style.height = `${h}px`;
		ctx.setTransform(scale, 0, 0, scale, 0, 0);
	};

	window.addEventListener("resize", onResize, { passive: true });
	window.addEventListener("pointermove", onPointerMove, { passive: true });
	onResize();

	const drawLayer = (time, layerIndex, colors) => {
		const t = time * 0.001 * SPEED + layerIndex * LAYER_OFFSET;
		const mx = ENABLE_MOUSE_INTERACTION
			? (mouseX - 0.5) * MOUSE_INFLUENCE
			: 0;
		const my = ENABLE_MOUSE_INTERACTION
			? (mouseY - 0.5) * MOUSE_INFLUENCE
			: 0;

		const bandCenter = h * BAND_HEIGHT + my * h * 0.25;
		const bandWidth = h * 0.22 * BAND_SPREAD;
		const bandHalf = bandWidth * 0.5;

		const step = Math.max(4, Math.floor(w / 160));
		const xScale = (NOISE_FREQUENCY * SCALE) / 260;

		const colorT =
			(Math.sin((time * 0.001 + layerIndex * 0.8) * COLOR_SPEED) + 1) *
			0.5;
		const mixed = mixRgb(colors.c1, colors.c2, colorT);
		const alphaOuter = clamp(0.22 * BRIGHTNESS, 0, 0.5);
		const alphaInner = clamp(0.38 * BRIGHTNESS, 0, 0.75);

		const ox = mx * w * 0.03;
		const oy = layerIndex === 0 ? -h * 0.01 : h * 0.01;

		const top = [];
		const bottom = [];
		for (let x = -20; x <= w + 20; x += step) {
			const nx = (x + ox) * xScale + t * 0.9 + layerIndex * 120;
			const n = fbm1(nx, 3, OCTAVE_DECAY) * NOISE_AMPLITUDE;
			const y = bandCenter + oy + n * bandWidth * 0.78;
			top.push({ x, y: y - bandHalf });
			bottom.push({ x, y: y + bandHalf });
		}

		const gradShift = (t * 140) % (w * 1.2);
		const grad = ctx.createLinearGradient(
			-w * 0.2 + gradShift,
			0,
			w * 1.2 + gradShift,
			0,
		);
		grad.addColorStop(
			0,
			`rgba(${colors.c1.r}, ${colors.c1.g}, ${colors.c1.b}, 1)`,
		);
		grad.addColorStop(0.5, `rgba(${mixed.r}, ${mixed.g}, ${mixed.b}, 1)`);
		grad.addColorStop(
			1,
			`rgba(${colors.c2.r}, ${colors.c2.g}, ${colors.c2.b}, 1)`,
		);

		ctx.globalCompositeOperation = "screen";
		ctx.lineCap = "round";
		ctx.lineJoin = "round";

		ctx.beginPath();
		for (let i = 0; i < top.length; i++) {
			const p = top[i];
			if (i === 0) ctx.moveTo(p.x, p.y);
			else ctx.lineTo(p.x, p.y);
		}
		for (let i = bottom.length - 1; i >= 0; i--) {
			const p = bottom[i];
			ctx.lineTo(p.x, p.y);
		}
		ctx.closePath();

		ctx.fillStyle = grad;

		ctx.filter = "blur(46px)";
		ctx.globalAlpha = alphaOuter;
		ctx.fill();

		ctx.filter = "blur(22px)";
		ctx.globalAlpha = alphaInner;
		ctx.fill();

		ctx.filter = "none";
		ctx.globalAlpha = 1;
	};

	let cachedColors = readColors(host);
	let lastColorRead = 0;

	const frame = (time) => {
		const minInterval = 1000 / Math.max(1, TARGET_FPS);
		if (time - lastDraw < minInterval) {
			raf = window.requestAnimationFrame(frame);
			return;
		}
		lastDraw = time;

		if (time - lastColorRead > 1000) {
			cachedColors = readColors(host);
			lastColorRead = time;
		}

		ctx.globalCompositeOperation = "source-over";
		ctx.clearRect(0, 0, w, h);

		drawLayer(time, 0, cachedColors);
		drawLayer(time, 1, cachedColors);

		raf = window.requestAnimationFrame(frame);
	};

	raf = window.requestAnimationFrame(frame);

	const cleanup = () => {
		window.removeEventListener("resize", onResize);
		window.removeEventListener("pointermove", onPointerMove);
		if (raf) window.cancelAnimationFrame(raf);
		raf = 0;
	};

	window.addEventListener("pagehide", cleanup, { once: true });
}

main();
