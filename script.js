configuration = {
  music: {
    url: "//localhost:8000/",
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
  log("Downloading «"+path+"»");
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
  log(page);
  // todo find all hrefs (with native XML/DOM parsing)
  // delete parameters (apache sort-by indexes)
  // identify folders (ending in «/»)
  // filter out those pointing to ../
  // identify music files
  // add music files to playlist
  // launch recursion on all subfolders
}

// When all this project will be put in one file, I'll use onDomContentLoaded or some other hipster trick.
window.addEventListener("load",main);
