//electron imports
const { ipcMain, remote } = require('electron');
const storage = require('electron-json-storage');
const path = require('path');

const apiBase = "https://api.projectbubble.com/v2/";

let projectSelect;
let taskSelect;
let subTaskSelect;
let date;
let hours;
let description;
let apikey;
let domain;
let name;

function init() {
    
  projectSelect = document.getElementById("project_select");
  taskSelect = document.getElementById("task_select");
  subTaskSelect = document.getElementById("subtask_select");
  
  date = document.getElementById("date_input");
  hours = document.getElementById("hours_input");
  description = document.getElementById("description");

  //Prevent number scrolling
  hours.onscroll = (e) => e.preventDefault();
  
  //Populate projects
  updateProjects();
  
  //Populate Projects + Tasks
  projectSelect.onchange = () => updateTasks();
  taskSelect.onchange = () => updateSubTasks();
}

function updateProjects() {
  projectSelect.innerHTML = "";
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
      addToSelect(subTaskSelect, "Select a sub task", "");
      for (subtask of response.data) {
        addToSelect(taskSelect, subtask.subtask_name, subtask.subtask_id);
      }
    }
  }, [{ name: "task_id", value: taskSelect.value }]);
}

function submitToProjectBubble() {
  let dateString = date.value.replace(/\-/g, "");
  let seconds = parseFloat(hours.value) * 60 * 60;
  let descriptionString = description.value;
  
  if (projectSelect.value == "" || taskSelect.value == "") {
    alert("Project and task are required");
    return false;
  }
  
  if (dateString == "") {
    alert("Error date is required");
    return false;
  }
  
  if (seconds <= 0) {
    alert("Error valid time is required");
    return false;
  }
  
  var headers = new Headers({
    'key': apiKey,
    'domain': domain,
    'Content-Type': "application/json"
  });
  console.log(dateString);
  fetch(apiBase + "time_entries/" + taskSelect.value + "?project_id=" + projectSelect.value, {
    method: "POST",
    body: JSON.stringify({
      description: descriptionString,
      seconds: seconds,
      date: dateString,
      subtask_id: subTaskSelect.value
    }),
    headers: headers
  }).then((response) => response.json()).then( (response) => {
    console.log(response)
    taskSelect.innerHTML = "";
    subTaskSelect.innerHTML = "";
    date.value = "";
    hours.value = 0.00;
    description.value = "";
    updateProjects();
  });
  
  return false;
}

function requestApi(request, callback, getVars) {
  var headers = new Headers({
    'key': apikey,
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

document.addEventListener("DOMContentLoaded", 
() => storage.get("login", (error, obj) => {
  if (error || Object.keys(obj).length == 0) {
    remote.getCurrentWindow().loadURL(`file://${path.join(__dirname, 'login.html')}`);
  } else {
    domain = obj.domain;
    apikey = obj.apikey;
    name = obj.name;
    document.getElementById("name").innerHTML = name;
    init();
  }
}));