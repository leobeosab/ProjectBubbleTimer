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
  requestApi("projects", (response) => {
    for (project of response.data) {
      if (project.active == "1") {
          addToSelect(projectSelect, project.project_name, project.project_id);
      }
    }
  });
  
  //Populate Tasks
  projectSelect.onchange = () => {
    subTaskSelect.innerHTML = "";
    requestApi("tasks", (response) => {
      for (task of response.data) {
        addToSelect(taskSelect, task.task_name, task.task_id);
      }
    }, [{ name: "project_id", value: projectSelect.value }]);
  }
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