document.addEventListener("DOMContentLoaded", () => {
	const d = document;
	const PARAM = "tab";
	const params = new URLSearchParams(window.location.search);
	const actions = params.get(PARAM);
	let el = null;

	console.log(actions);

	const inits = {
		photograph: false,
		codes: false,
	};

	// 是否为 WINDOWS 系统
	if (/windows|win32/i.test(navigator.userAgent)) {
		d.documentElement.classList.add("os-windows");
	}

	compileActs(actions);

	d.addEventListener("mousedown", (e) => {
		el = e.target;
	});

	d.addEventListener("mouseup", (e) => {
		const tar = e.target;
		if (el !== tar) return;
		el = null;

		compileActs(tar.dataset.action);
	});

	d.addEventListener("keydown", (e) => {
		if (e.key === "Escape") {
			e.preventDefault();
			close();
		}
	});

	function compileActs(action) {
		const acts = action?.split("/");

		if (!acts) return;

		const [act, ...rest] = acts;

		params.set(PARAM, action);
		history.pushState(null, "", "?" + params.toString());

		switch (act) {
			case "open":
				open(...rest);
				break;
			case "close":
				close();
				break;
			default:
				break;
		}
	}

	function open(pa, child) {
		const c = d.querySelector(".page.active");
		if (c && c.id !== pa) {
			c.classList.remove("active");
		}

		switch (pa) {
			case "photograph":
				!inits.photograph && initPhotographs();
				break;
			case "codes":
				!inits.codes && initCodes();
				break;
			default:
				break;
		}

		d.getElementById(pa).classList.add("active");
	}

	function close() {
		const c = d.querySelector(".page.active");
		c && c.classList.remove("active");
	}

	function closeItem(id) {
		console.log(`close item ${id}`);
	}

	function initPhotographs() {
		const list = [
			{
				items: ["./photograph/1.jpg"],
				// style: "grid-auto-flow: column;",
			},
			{
				items: ["./photograph/2.jpg"],
			},
			{
				items: ["./photograph/3.jpg"],
			},
			{
				items: ["./photograph/4.jpg"],
				rowSpan: 2,
				ratio: "unset",
			},
			{
				items: ["./photograph/5.jpg"],
				colSpan: 2,
				rowSpan: 2,
			},
		];
		const grid = d.querySelector(".p-grids");
		const html = list
			.map((o) => {
				const {
					items,
					colSpan = 1,
					rowSpan = 1,
					ratio = 1,
					style = "",
				} = o;
				const imgs = items
					.map((p, i) => {
						return `<img src="${p}" data-pindex="${i}" class="p-img" />`;
					})
					.join("");
				return `<div class="p-item" style="grid-row: span ${rowSpan}; grid-column: span ${colSpan}; aspect-ratio: ${ratio}; ${style}" data-plist="${items}">${imgs}</div>`;
			})
			.join("");

		grid.innerHTML = html;
		inits.photograph = true;
	}

	function initCodes() {
		const projects = [
			{
				link: "https://ioca-react.vercel.app/",
				title: '<h2 class="jaini">IOCA / REACT</h2>',
				icon: '<img src="https://ioca-react.vercel.app/logo.png"/>',
			},
			{
				link: "https://rho-admin.vercel.app/",
				title: '<h2 class="jaini">Rho ADMIN</h2>',
				icon: "<b>ρ</b>",
			},
		];

		const list = d.querySelector(".c-items");
		const html = projects
			.map((o) => {
				const { link, title, icon } = o;

				return `<a href="${link}" target="_blank" class="c-item link">
				<div class="c-icon">${icon}</div>
				${title}
			</a>`;
			})
			.join("");

		list.innerHTML = html;
		inits.codes = true;
	}
});
