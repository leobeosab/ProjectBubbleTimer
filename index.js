//electron imports
const { ipcMain } = require('electron');
const { apiKey, domain } = require("./constants");

console.log(apiKey);

const apiBase = "https://api.projectbubble.com/v2/";

let projectSelect;
let taskSelect;
let subTaskSelect;

function init() {
  projectSelect = document.getElementById("project_select");
  taskSelect = document.getElementById("task_select");
  subTaskSelect = document.getElementById("subtask_select");
  
  //Populate projects
  updateProjects();
  
  //Populate Projects + Tasks
  projectSelect.onchange = () => updateTasks();
  taskSelect.onchange = () => updateSubTasks();
}

function updateProjects() {
  taskSelect.innerHTML = "";
  requestApi("projects", (response) => {
    addToSelect(projectSelect, "Select a project", "");
    for (project of response.data) {
      if (project.active == "1") {
          addToSelect(projectSelect, project.project_name, project.project_id);
      }
    }
  });
}

function updateTasks() {
  taskSelect.innerHTML = "";
  subTaskSelect.innerHTML = "";
  requestApi("tasks", (response) => {
    addToSelect(taskSelect, "Select a task", "");
    for (task of response.data) {
      addToSelect(taskSelect, task.task_name, task.task_id);
    }
  }, [{ name: "project_id", value: projectSelect.value }]);
}

function updateSubTasks() {
  requestApi("subtasks", (response) => {
    console.log(response);
    if (response.data) {
      addToSelect(subTaskSelect, "Select a task", "");
      for (subtask of response.data) {
        addToSelect(taskSelect, subtask.subtask_name, subtask.subtask_id);
      }
    }
  }, [{ name: "task_id", value: taskSelect.value }]);
}

function requestApi(request, callback, getVars) {
  var headers = new Headers({
    'key': apiKey,
    'domain': domain
  });
  
  let url = apiBase + request;
  
  if (getVars && getVars.length > 0) {
    url += "?";
    for (item of getVars) {
      url += item.name;
      url += "=";
      url += item.value;
      url += "&";
    }
    url = url.slice(0, -1);
  }
  console.log(url);
  fetch(url, {
    headers: headers
  }).then((response) => response.json())
  .then((response) => callback(response))
  .catch((err) => console.log(err)); 
}

function addToSelect(select, text, value) {
  select.options[select.options.length] = new Option(text, value);
}

document.addEventListener("DOMContentLoaded", () => init());