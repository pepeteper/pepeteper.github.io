import {
	setupScrollBehaviour,
	refreshScroll
} from './scrollingNav.js';

export function setupArticles(targetElm, page, serverUrl) {
	let offset = (Number(page) - 1) * articlesPerPage;
	let articlesElement = document.getElementById("articlesContainer");
	let pageNavElement = document.getElementById("pageNav")

	setupScrollBehaviour(articlesElement);

	const url = serverUrl + "/articles";
	let fetchUrl = url + `/?max=${articlesPerPage}&offset=${offset}`;

	filteredTags.forEach((tag) => {
		fetchUrl += `&tag=${tag}`
	});

	let articlesList = [];

	fetch(fetchUrl)
		.then(response => {
			if (response.ok) {
				return response.json();
			} else { //if we get server error
				return Promise.reject(new Error(`Server answered with ${response.status}: ${response.statusText}.`));
			}
		})
		.then(responseJSON => {
			articlesList = responseJSON.articles;

			setupPageNav(responseJSON.meta.offset, responseJSON.meta.totalCount);

			return Promise.resolve();
		})
		.then(() => {
			let div = document.createElement("div");
			let fetchUrl = serverUrl + "/article";
			let requests = articlesList.map(article =>
				fetch(`${fetchUrl}/${article.id}`)
				.then(response => {
					if (response.ok) {
						return response.json();
					} else { //if we get server error
						return Promise.reject(new Error(`Failed to access the content of the articles with urls ${response.url}.`));
					}
				})
				.then(articleF => {
					div.innerHTML = articleF.content;
					article.content = div.textContent;
					
					// toto je tu na to, že nebudeme musieť čakat kým sa načítajú všetky prispevky, ale už hned po prvom sa zobrazí zoznam
					// postupne sa budú zobrazovat obsahy aj ďalších
					parseArticles(); 
					return Promise.resolve();
				})
			);
			return Promise.all(requests);
		}).then(() => {
			parseArticles();
		})
		.catch(error => { ////here we process all the failed promises
			const errMsgObj = {
				errMessage: error
			};
			articlesElement.innerHTML =
				Mustache.render(
					document.getElementById("template-articles-error").innerHTML,
					errMsgObj
				);
		});

	function parseArticles() {
		let parsedHTML = "";
		articlesList.forEach(article => {
			article.articleLink = `#article/${article.id}/${page}/1`;
			article.created = (new Date(article.dateCreated)).toLocaleString();

			article.tags = article.tags.filter(tag => !filteredTags.includes(tag));
			parsedHTML += Mustache.render(document.getElementById("template-article").innerHTML, article);
		})
		articlesElement.innerHTML = parsedHTML;

		refreshScroll();
		//scrolling = true;
	}

	function setupPageNav(offset, totalCount) {
		let obj = {};

		if (Number(offset) + articlesPerPage < totalCount) {
			obj.next = Number(page) + 1;
		}
		if (page > 1) {
			obj.previous = Number(page) - 1;
		}

		if (obj.next || obj.previous) {
			pageNavElement.innerHTML = Mustache.render(document.getElementById("template-page-nav").innerHTML, obj);
		}

		localStorage.latestPage = page;
	}
}