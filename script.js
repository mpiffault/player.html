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
  init_env();
  log("Elements created.");
  // Elegant recursion over subfolders
  get_files();
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

function init_env () {
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
  // the <nature> element will have attributes. see init_env().
  var x = document.createElement(nature);
  for (var key in attributes) {
    if (attributes.hasOwnProperty(key)) {
      x.setAttribute(key,attributes[key]);
    }
  }
  document.body.appendChild(x);
}

function get_files() {
  recursion(configuration["music"]["url"]);
}

function recursion(path) {
  log("lol todo"+path);
}
// When all this project will be put in one file, I'll use onDomContentLoaded or some other hipster trick.
window.addEventListener("load",main);
