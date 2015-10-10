configuration = {
  music: {
    url: window.location.pathname.substring(0,window.location.pathname.lastIndexOf("/")+1),
    extensions: ["ogg","mp3","wav"],
    autoplay: true,
  },
  log: false,
}

function main () {
  audio = add_element(document.body,"audio",{controls:""});
  audio.onended = ended_handler;
  add_element(document.body,"ul",{id:"list"});
  add_element(document.body,"pre",{id:"console"});

  // check URL parameters
  if (window.location.search.indexOf("debug") >= 0) {
    configuration["log"] = true;
  }

  // Recursion over subfolders
  download(configuration["music"]["url"]);
  document.addEventListener("keydown",keyboard_handler);
}

function log(x) {
  if ( configuration["log"] === true ) {
    console.log(x);
  }
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
      next_song(1);
      break;
    case 37:
      log("Previous song keyboard event.");
      next_song(-1);
      break;
    default:
      log("Unkown key "+event.keyCode);
  }
}

function ended_handler(evt) {
  if (configuration["music"]["autoplay"] === true) {
    next_song(1);
  }
}

function next_song (shift) {
  audio = document.getElementsByTagName("audio")[0];
  audio.pause();
  li = current_song_li();
  if (shift == 1) {
    nli = li.nextElementSibling;
  } else {
    nli = li.previousElementSibling;
  }
  audio.src = nli.attributes.music_path.value;
  audio.play();
  li.className = "";
  nli.className = "playing";
}

function current_song_li () {
  audio = document.getElementsByTagName("audio")[0];
  if (audio.attributes.src !== undefined) {
    list = document.getElementById("list").childNodes;
    for (var i = 0; i < list.length - 1; i++ ) {
      if (list[i].attributes.music_path.value === audio.attributes.src.value) {
        return list[i];
      }
    }
  }
}

function add_element(_parent,nature,attributes) {
  // function which appendChild a <nature> element to _parent
  // the <nature> element will have attributes. see main().
  var x = document.createElement(nature);
  for (var key in attributes) {
    if (attributes.hasOwnProperty(key)) {
      x.setAttribute(key,attributes[key]);
    }
  }
  _parent.appendChild(x);
  return x;
}

function download(path) {
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
        // launch download on all subfolders
        // recursion
        download(path+href);
      } else {
        log("Skipping folder « "+href+" »");
      }
    } else {
      // identify music files
      if (correct_filename(href) === true) {
        log("Found music file « "+decodeURIComponent(href)+" » in "+path);
        // add music files to playlist
        add_music(path,href);
      }
    }
  }
}

function add_music(path,href) {
  li = add_element(document.getElementById("list"),"li",{
    music_path:[path,href].join('')
  });
  f = add_element(li,"span",{class:"album"});
  f.appendChild(document.createTextNode(decodeURIComponent(path)));
  n = add_element(li,"span",{class:"track"});
  n.appendChild(document.createTextNode(decodeURIComponent(href)));
  li.addEventListener("click",change_track);
}

function correct_filename(filename) {
  if (configuration["music"]["extensions"].indexOf( filename.split(".").slice(-1)[0] ) >=0 ) {
    return true;
  } else {
    return false;
  }
}

function change_track(event) {
  li = current_song_li();
  if (typeof(li) === "object") {
    li.className = "";
  }

  target = event.target;
  // find the parent <li>
  li = target;
  while (li.tagName.toLowerCase() !== "li") {
    li = li.parentElement;
  }
  li.className = "playing";
  src = li.attributes.music_path.value;
  audio = document.getElementsByTagName("audio")[0];
  audio.src = src;
  audio.play();
}

window.addEventListener("DOMContentLoaded", main);
