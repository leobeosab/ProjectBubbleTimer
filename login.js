//electron imports
const { remote } = require('electron');
const storage = require('electron-json-storage');
const path = require("path");

const apiBase = "https://api.projectbubble.com/v2/";

function attemptLogin() {
  let apikey = document.getElementById("api_key").value;
  let domain = document.getElementById("domain").value;
  var headers = new Headers({
    'key': apikey,
    'domain': domain
  });
  
  let url = apiBase + "user";
  
  fetch(url, {
    headers: headers
  })
  .then((response) => response.json())
  .then((response) => storage.set("login", {
        domain: domain,
        apikey: apikey,
        name: response.data.first_name + " " + response.data.last_name
      }, (err) => remote.getCurrentWindow().loadURL(`file://${path.join(__dirname, 'main.html')}`)
  ))
  .catch((err) => alert("Error logging in")); 
  
  return false;
}