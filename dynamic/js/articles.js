export function setupArticles(page, serverUrl, tagToFilter) {
	let offset = (Number(page) - 1) * 20;
	let articlesElement = document.getElementById("articlesContainer");
	let pageNavElement = document.getElementById("pageNav")

	/*
	let pageFooter = document.getElementsByTagName("footer")[0];
	let banner = document.getElementById("intro");
	*/
	/*
	console.log("scroll " + document.documentElement.scrollTop);
	console.log("articles " + articlesElement.offsetHeight);
	console.log("footer " + pageFooter.offsetTop);
	*/
	let scrolling = false;

	document.addEventListener("scroll", () => {
		scrolling = true;
	});

	setInterval(() => {
		if (scrolling) {
			scrolling = false;

			let docEl = document.documentElement;
			let bodyEl = document.body;

			if ((docEl && docEl.scrollTop > articlesElement.offsetHeight + articlesElement.offsetTop - window.innerHeight) ||
				(bodyEl && bodyEl.scrollTop > articlesElement.offsetHeight + articlesElement.offsetTop - window.innerHeight)) {
				pageNavElement.classList.add("no-fixed");
			} else {
				pageNavElement.classList.remove("no-fixed");
			}
		}
	}, 250);


	const url = serverUrl + "/articles";
	let fetchUrl = url + `/?max=20&offset=${offset}`;

	if(tagToFilter) {
		fetchUrl += `&tag=${tagToFilter}`;
	}

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
			
			if(articlesList.length > 0) {
				setupPageNav(responseJSON.meta);
			}

			parseArticles();
			return Promise.resolve();
		})
		/*.then(() => {
			let cntRequests = articlesList.map(
				article => fetchOneByOne(article)
			);

			return Promise.all(cntRequests);
		})*/
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
			article.tags = article.tags.filter(tag => tag != "aniNeh");

			parsedHTML += Mustache.render(document.getElementById("template-article").innerHTML, article);
		})
		articlesElement.innerHTML = parsedHTML;

		scrolling = true;
	}

	function setupPageNav(meta) {
		let obj = {};

		if (Number(meta.offset) + 20 < meta.totalCount) {
			obj.next = Number(page) + 1;
		}
		if (page > 1) {
			obj.previous = Number(page) - 1;
		}
		
		pageNavElement.innerHTML = Mustache.render(document.getElementById("template-page-nav").innerHTML, obj);

		localStorage.latestPage = page;
	}
}