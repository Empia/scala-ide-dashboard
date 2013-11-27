var knownProjects = new Array();

function createPullRequestDom(pullRequest) {
	var nPullRequest = document.createElement("a");
	nPullRequest.className = "pr";
	nPullRequest.target = "_blank"
	nPullRequest.href = pullRequest.url
	nPullRequest.appendChild(document.createTextNode(pullRequest.number))

	return nPullRequest;
}

function createProjectDom(project) {
	var projectId = project.githubRepo.replace("/", "_");

	var nProject = document.createElement("div");
	nProject.id = projectId;
	nProject.className = "project"

	var nName = document.createElement("div");
	nName.className = "project-name";
	nProject.appendChild(nName);

	var nNameA = document.createElement("a");
	nNameA.href = "https://github.com/" + project.githubRepo;
	nNameA.target = "_blank";
	nNameA.appendChild(document.createTextNode(project.name));
	nName.appendChild(nNameA);

	var nPR = document.createElement("div");
	nPR.className = "project-pr";
	nProject.appendChild(nPR);

	var nPRLabel = document.createElement("span");
	nPRLabel.className = "label";
	nPRLabel.appendChild(document.createTextNode("open PRs:"))
	nPR.appendChild(nPRLabel);

	var prs = project.pullRequests;

	if (prs.length == 0) {
		nPR.appendChild(document.createTextNode(" -"));
	} else {
		for (var i = 0; i < prs.length; i++) {
			nPR.appendChild(createPullRequestDom(prs[i]));
		}
	}

	return nProject;
}

function updateStats() {
	var nbPRs = 0;

	for (var i = 0; i < knownProjects.length; i++) {
		nbPRs += knownProjects[i].pullRequests.length;
	}

	document.getElementById("open-pr-nb-value").innerHTML = nbPRs;
	document.getElementById("project-nb-value").innerHTML = knownProjects.length;
}

function message(msgText) {
	var msg = JSON.parse(msgText);

	var projects = document.getElementById("projects");

	knownProjects[knownProjects.length] = msg.project;

	projects.appendChild(createProjectDom(msg.project));

	updateStats();
}

var socket = new WebSocket("ws://localhost:9000/ws");

socket.onopen = function() {
	var message = {
		"action" : "go"
	};
	socket.send(JSON.stringify(message));
}

socket.onmessage = function(event) {
	message(event.data);
}