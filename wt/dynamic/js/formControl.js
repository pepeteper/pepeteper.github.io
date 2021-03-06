function showFileUpload() {
	document.getElementById('fileUpload').classList.remove("hidden");
	document.getElementById('btShowFileUpload').classList.add("hidden");
}

function cancelFileUpload() {
	document.getElementById('fileUpload').classList.add("hidden");
	document.getElementById('btShowFileUpload').classList.remove("hidden");
}

function uploadImg(url) {
	const uploadUrl = url + "/fileUpload";

	const files = document.getElementById("flElm").files;

	if (files.length > 0) {
		const imgLinkElement = document.getElementById("imageLink");

		const alertBar = document.getElementById("alertBar");
		const alertSpan = document.getElementById("alertSpan");


		let obj = new FormData();
		obj.append("file", files[0]);

		const options = {
			method: 'POST',
			body: obj
		};

		fetch(uploadUrl, options)
			.then(response => {
				if (response.ok) {
					return response.json();
				} else {
					return Promise.reject(new Error(`Server answered with ${response.status}: ${response.statusText}.`));
				}
			})
			.then(responseJSON => {
				imgLinkElement.value = responseJSON.fullFileUrl;
				cancelFileUpload();
				setSuccessAlert();

				alertSpan.innerText = `Image uploaded successfully`;
				return Promise.resolve();
			})
			.catch(error => {
				setErrorAlert();

				alertSpan.innerText = `Image uploading failed. ${error}.`;

				console.log(`Image uploading failed. ${error}.`);
			});
	}
}
function showSubmitSuccess() {
	const alertBar = document.getElementById("alertSpan");

	setSuccessAlert();
	alertSpan.innerText = "Uspešné odoslanie komentára";
}

function hideAlert() {
	document.getElementById("alertBar").classList.add("invis", "hidden");
}

function hideSlowlyAlert() {
	const alertBar = document.getElementById("alertBar");
	alertBar.classList.add("invis");
	setTimeout(() => alertBar.classList.add("hidden"), 500);
}

function showAlert() {
	document.getElementById("alertBar").classList.remove("invis", "hidden");
}

function setSuccessAlert() {
	const alertBar = document.getElementById("alertBar");

	showAlert();
	alertBar.classList.remove("error");
	alertBar.classList.add("success");
}

function setErrorAlert() {
	const alertBar = document.getElementById("alertBar");

	showAlert();
	alertBar.classList.add("error");
	alertBar.classList.remove("success");
}

function showCommentForm() {
	document.getElementById('articleCommentForm').classList.remove("hidden");
}

function hideCommentForm() {
	document.getElementById('articleCommentForm').classList.add("hidden");
}