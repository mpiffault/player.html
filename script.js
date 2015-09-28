configuration = {
  music: {
    url: "//localhost/",
    extensions: ["ogg","mp3","wav"], // too much information ?
  },
  console: {
    log: true,
    visible: true,
  }
}
music_tree = {}

// http://stackoverflow.com/questions/1418050/string-strip-for-javascript
if(typeof(String.prototype.trim) === "undefined")
{
  String.prototype.trim = function()
  {
    return String(this).replace(/^\s+|\s+$/g, '');
  };
}

function main () {
  // Prepare environment
  prepare_environment();
  log("Elements created.");
  // Elegant recursion over subfolders
  recursion(configuration["music"]["url"]);
  // that's all.
}

function log(msg) {
  if ( configuration["console"]["log"] === true ) {
    if (configuration["console"]["visible"] === true ) {
      // use <pre id="console">
      var c = document.getElementById("console");
      if (c === null) {
        // no viewable console
        // log error ? lolol
        console.log(msg);
      } else {
        // todo: strip
        c.appendChild(document.createTextNode(msg.trim()+"\n"));
      }
    } else {
      // use browser console
      console.log(msg);
    }
  }
}

function prepare_environment () {
  // create HTML elements
  // audio
  add_element("audio",{controls:""});
  // folder list
  add_element("ul",{id:"list"});
  // console
  add_element("pre",{id:"console"});

}

function add_element(nature,attributes) {
  // function which appendChild a <nature> element to document.body
  // the <nature> element will have attributes. see prepare_environment().
  var x = document.createElement(nature);
  for (var key in attributes) {
    if (attributes.hasOwnProperty(key)) {
      x.setAttribute(key,attributes[key]);
    }
  }
  document.body.appendChild(x);
}

function recursion(path) {
  // Launch request on path
  log("Downloading « "+path+" »");
  var request = new XMLHttpRequest();
  request.open("GET", '//'+path);
  request.onreadystatechange = function () {
    if (request.readyState === 4 && request.status === 200) {
      parse_page(request.responseText,path);
    }
  }
  request.send(null)
}

function parse_page(page,path) {
  log("Got page « "+path+" »");
  // log(page);
  var parser = new DOMParser();
  var doc = parser.parseFromString(page, "text/html");
  // todo find all hrefs (with native XML/DOM parsing)
  var links = doc.getElementsByTagName("a");
  // delete parameters (apache sort-by indexes)
  var length = links.length;
  for (var i = 0; i < length; i++) {
    var href = links[i].getAttribute("href");
    // identify folders (ending in «/»)
    if (href.slice(-1) === "/") {
      // no dot folder (.git)
      // filter out those pointing to ../
      if (href.slice(0,1) !== ".") {
        log("Going in subfolder « "+href+" »");
        // launch recursion on all subfolders
        recursion(path+href);
      } else {
        log("Skipping folder « "+href+" »");
      }
    } else {
      // identify music files
      if (correct_filename(href) === true) {
        log("YAY WE FOUND "+decodeURIComponent(href));
        // add music files to playlist
        // TODO
      }
    }
  }
}

function correct_filename(filename) {
  /*
  if filename.split(".")[-1] in configuration["music"]["extensions"]:
    return True
  */
  var parts = filename.split(".");
  if (parts.length === 1 || ( parts[0] === "" && parts.length === 2 ) ) { return false; }
  if (configuration["music"]["extensions"].indexOf(parts.slice(-1)[0]) >=0) { return true; }
  return false;
}

window.addEventListener("DOMContentLoaded", main);
