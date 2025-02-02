import { moveContextSubmenu } from "/utilities.js";

let issues;

const list = document.getElementById("list");
const target = document.getElementById("target");
const issue = document.getElementById("issue");
const description = document.getElementById("description");
const audio = document.getElementById("audio");
const words = document.getElementById("words");

loadIssues();

async function loadIssues() {
  await fetch("./JSON/issues2.json")
    .then((response) => response.json())
    .then((json) => (issues = json));

  console.log(issues);

  for (let i = 0; i < Object.keys(issues.targets).length; i++) {
    // console.log(Object.keys(issues.targets)[i]);
    const listFeature = document.createElement("li");
    listFeature.textContent = Object.keys(issues.targets)[i];
    listFeature.addEventListener("mouseover", moveContextSubmenu);
    list.appendChild(listFeature);
    const listFeatureUL = document.createElement("ul");
    listFeatureUL.classList.add("submenu");
    listFeature.appendChild(listFeatureUL);

    for (
      let j = 0;
      j < Object.values(Object.values(issues.targets)[i]).length;
      j++
    ) {
      // console.log(Object.keys(issues.targets)[i].length);
      const listIssue = document.createElement("li");
      listIssue.textContent = Object.keys(Object.values(issues.targets)[i])[j];
      // console.log(Object.keys(Object.values(issues.targets)[i])[j]);
      listIssue.addEventListener("click", adjustViewer);
      listFeatureUL.appendChild(listIssue);
    }
  }
  // viewer.innerHTML = `description: ${issues.targets["KIT"]["sick x seek"]["description"]}`;
}

function adjustViewer(evt) {
  let issueSelected = evt.currentTarget.innerHTML;
  let targetSelectedHTML = evt.currentTarget.parentNode.parentNode.innerHTML;
  let targetNameLength = targetSelectedHTML.search("<ul");
  let targetName = targetSelectedHTML.substring(0, targetNameLength);
  let issueContent = issues.targets[targetName][issueSelected];
  console.log(targetName);
  console.log(issueSelected);
  console.log(issueContent);
  target.innerHTML = targetName;
  issue.innerHTML = issueSelected;
  description.innerHTML = issueContent.description;
  audio.innerHTML = issueContent.audio;
  words.innerHTML = issueContent.words;
}
