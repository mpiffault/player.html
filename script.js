
configuration = {
  music: {
    // url: "//localhost/",
    url: window.location.pathname.substring(0,window.location.pathname.lastIndexOf("/")+1),
    extensions: ["ogg","mp3","wav","flac"], // too much information ?
  },
  console: {
    log: false,
    visible: false,
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
  add_element(document.body,"audio",{controls:""});
  // folder list
  add_element(document.body,"ul",{id:"list"});
  // console
  add_element(document.body,"pre",{id:"console"});

  // check URL parameters
  if (window.location.search.indexOf("debug") >= 0) {
    configuration["console"]["visible"] = true;
  }

  document.addEventListener("keydown",keyboard_handler);
}

function keyboard_handler(event) {
  switch (event.keyCode) {
    case 0x20:
      log("Toggle pause keyboard event.");
      var player = document.getElementsByTagName("audio")[0];
      if (player.paused === true) {
        player.play();
      } else {
        player.pause();
      }
      break;
    case 39:
      log("Next song keyboard event.");
      break;
    case 37:
      log("Previous song keyboard event.");
      break;
    case 38:
    case 40:
      // Scroll up/down to see the console, don't append to console :D
      break;
    default:
      log("Unkown key "+event.keyCode);
  }
}

function add_element(_parent,nature,attributes) {
  // function which appendChild a <nature> element to document.body
  // the <nature> element will have attributes. see prepare_environment().
  var x = document.createElement(nature);
  for (var key in attributes) {
    if (attributes.hasOwnProperty(key)) {
      x.setAttribute(key,attributes[key]);
    }
  }
  _parent.appendChild(x);
  return x;
}

function recursion(path) {
  // Launch request on path
  log("Downloading « "+path+" »");
  var request = new XMLHttpRequest();
  request.open("GET", path);
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
        log("Found music file « "+decodeURIComponent(href)+" » in "+folderlist(path).join('/'));
        // add music files to playlist
        add_music(path,href);
      }
    }
  }
}

function add_music(path,href) {
  li = add_element(document.getElementById("list"),"li",{
    music_folder:path,
    music_filename:href,
    music_path:[path,href].join('')
  });
  f = add_element(li,"span",{class:"album"});
  f.appendChild(document.createTextNode(decodeURIComponent(folderlist(path).join('/'))));
  n = add_element(li,"span",{class:"track"});
  n.appendChild(document.createTextNode(decodeURIComponent(href)));
  li.addEventListener("click",change_track);
}

function folderlist(path) {
  list = path.split('/');
  nl = [];
  for (i=0;i<list.length+1;i++) {
    if (list[i] != '') {
      nl.push(list[i]);
    }
  }
  return nl;
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

function change_track(event) {
  target = event.target;
  // find the parent <li>
  li = target;
  while (li.tagName.toLowerCase() !== "li") {
    li = li.parentElement;
  }
  src = li.attributes.music_path.value;
  audio = document.getElementsByTagName("audio")[0];
  audio.src = src;
  audio.play();
}

window.addEventListener("DOMContentLoaded", main);
