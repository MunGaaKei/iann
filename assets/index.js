document.addEventListener("DOMContentLoaded", () => {
	const d = document;
	let el = null;
	let photoInit = false;

	// 是否为 WINDOWS 系统
	if (/windows|win32/i.test(navigator.userAgent)) {
		d.documentElement.classList.add("os-windows");
	}

	d.addEventListener("mousedown", (e) => {
		el = e.target;
	});

	d.addEventListener("mouseup", (e) => {
		const tar = e.target;
		if (el !== tar) return;
		el = null;
		const acts = tar.dataset.action?.split("/");

		if (!acts) return;

		const [act, ...rest] = acts;

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
	});

	d.addEventListener("keydown", (e) => {
		if (e.key === "Escape") {
			e.preventDefault();
			close();
		}
	});

	function open(pa, child) {
		const c = d.querySelector(".page.active");
		if (c && c.id !== pa) {
			c.classList.remove("active");
		}
		if (pa === "photograph" && !photoInit) {
			initPhotographs();
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
	}
});
