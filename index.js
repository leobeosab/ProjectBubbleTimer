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
  
  
}

function requestApi(request) {
  var header
}