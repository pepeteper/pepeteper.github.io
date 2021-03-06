export function setupArticleComments(targetElm, articleId, page, commentPage, serverUrl) {
	let commentOffset = (Number(commentPage) - 1) * commentsPerPage;
	fetch(`${serverUrl}/article/${articleId}/comment/?max=${commentsPerPage}&offset=${commentOffset}`)
		.then(response => {
			if (response.ok) {
				return response.json();
			} else { //if we get server error
				return Promise.reject(new Error(`Failed to access comments of the article with url ${response.url}.`));
			}
		})
		.then((responseJSON) => {
			let comments = responseJSON.comments;

			let parsedHTML = "";
			comments.forEach(comment => {
				comment.created = (new Date(comment.dateCreated)).toLocaleString();
				comment.updated = (new Date(comment.lastUpdated)).toLocaleString();

				parsedHTML += Mustache.render(document.getElementById("template-article-comment").innerHTML, comment);
			});
			document.getElementById(targetElm).innerHTML = parsedHTML;

			setupCommentNav(responseJSON.meta);
			sessionStorage.latestCommentPage = commentPage;
			return Promise.resolve();
		})
		.catch(error => {
			const errMsgObj = {
				errMessage: error
			};
			document.getElementById(targetElm).innerHTML =
				Mustache.render(
					document.getElementById("template-articles-error").innerHTML,
					errMsgObj
				);
		});

	function setupCommentNav(meta) {
		const navTemplate = document.getElementById("template-article-comment-add").innerHTML;

		let obj = {};

		if (Number(meta.offset) + commentsPerPage < meta.totalCount) {
			obj.nextComm = Number(commentPage) + 1;
			obj.nextCommLink = `#artComment/${articleId}/${page}/${obj.nextComm}`;
		}
		if (commentPage > 1) {
			obj.previousComm = Number(commentPage) - 1;
			obj.previousCommLink = `#artComment/${articleId}/${page}/${obj.previousComm}`;
		}
		
		if(obj.nextComm || obj.previousComm) {
			document.getElementById(targetElm).innerHTML += Mustache.render(navTemplate, obj);
		}
	}
}

export function setupAddComment(targetElm, articleId, page, serverUrl) {
	const commentForm = document.getElementById("addCommentForm");

	if(googleUser) {
		document.getElementById("author").value = googleUser.getBasicProfile().getName();
	}

	commentForm.addEventListener("submit", submitComment);

	function submitComment(event) {
		event.preventDefault();

		const authorVal = commentForm.elements.namedItem("author").value.trim();
		const textVal = commentForm.elements.namedItem("text").value.trim();

		if (authorVal == "" || textVal == "") {
			return;
		}

		const request = {
			author: authorVal,
			text: textVal,
		};

		const options = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(request)
		};

		let completeUrl = `${serverUrl}/article/${articleId}/comment`;

		fetch(completeUrl, options)
			.then(response => {
				if (response.status == 201) {
					return response.json();
				} else {
					return Promise.reject(new Error(`Server answered with ${response.status}: ${response.statusText}.`));
				}
			})
			.then(comment => {
				setupArticleComments(targetElm, articleId, page, sessionStorage.latestCommentPage, serverUrl);
				return Promise.resolve();
			})
			.catch(error => {
				console.error("Failed to add comment, " + error);
			}).finally(() => {
				document.getElementById('articleCommentForm').classList.add("hidden");
				commentForm.reset();
			});		
	}
}