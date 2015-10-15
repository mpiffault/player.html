var SPACE = 32;
var LEFT = 37;
var RIGHT = 39;

configuration = {
  extensions: ["ogg","mp3","wav"],
  autoplay: true
};

function main () {
  var audio = addElement(document.body,"audio",{controls:""});
  audio.onended = endedHandler;
  addElement(document.body,"ul",{id:"list"});
  addElement(document.body,"pre",{id:"console"});

  var autoplay_song = window.location.search.match(/auto=[^&]*/);
  if (autoplay_song !== null) {
    configuration["autoplay_song"] = new RegExp(autoplay_song[0].slice(5),'i');
  }

  // Recursion over subfolders
  download(window.location.pathname.substring(0,window.location.pathname.lastIndexOf("/")+1));
  document.addEventListener("keydown",keyboard_handler);
}

function keyboard_handler(event) {
  var player = document.getElementsByTagName("audio")[0];
  if (event.keyCode === SPACE) {
    if (player.paused === true) {
      player.play();
    } else {
      player.pause();
    }
    event.preventDefault();
  } else if (event.keyCode === LEFT) {
    changeSong(1);
  } else if (event.keyCode === RIGHT) {
    changeSong(-1);
  }
}

function endedHandler(evt) {
  if (configuration["autoplay"] === true) {
    changeSong(1);
  }
}

function changeSong (shift) {
  var audio = document.getElementsByTagName("audio")[0];
  audio.pause();
  var li = playingListElement();
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

function playingListElement () {
  var audio = document.getElementsByTagName("audio")[0];
  if (audio.attributes.src !== undefined) {
    var list = document.getElementById("list").childNodes;
    for (var i = 0; i < list.length - 1; i++ ) {
      if (list[i].attributes.music_path.value === audio.attributes.src.value) {
        return list[i];
      }
    }
  }
}

function addElement(_parent,nature,attributes) {
  var newElement = document.createElement(nature);
  for (var key in attributes) {
    if (attributes.hasOwnProperty(key)) {
      newElement.setAttribute(key,attributes[key]);
    }
  }
  _parent.appendChild(newElement);
  return newElement;
}

function download(path) {
  // Launch request on path
  var request = new XMLHttpRequest();
  request.open("GET", path);
  request.onreadystatechange = function () {
    if (request.readyState === 4 && request.status === 200) {
      parsePage(request.responseText,path);
    }
  };
  request.send(null)
}

function parsePage(page,path) {
  var parser = new DOMParser();
  var doc = parser.parseFromString(page, "text/html");
  var links = doc.getElementsByTagName("a");
  for (var i = 0; i < links.length; i++) {
    var href = links[i].getAttribute("href");
    if (href.slice(-1) === "/") {
      if (href.slice(0,1) !== ".") {
        download(path+href);
      }
    } else if (correctFilename(href) === true) {
      addMusicUri(path, href);
    }
  }
}

function addMusicUri(dirPath,href) {
  var li = addElement(document.getElementById("list"),"li",{
    music_path:[dirPath,href].join('')
  });

  var directory = addElement(li,"span",{"class":"album"});
  directory.appendChild(document.createTextNode(decodeURIComponent(dirPath)));

  var fileName = addElement(li,"span",{"class":"track"});
  fileName.appendChild(document.createTextNode(decodeURIComponent(href)));

  li.addEventListener("click",changeTrack);
  if (href.search(configuration["autoplay_song"]) !== -1) {
    li.click();
    configuration["autoplay_song"] = /^$/;
  }
}

function correctFilename(filename) {
  return configuration["extensions"].indexOf(filename.split(".").slice(-1)[0]) >= 0;
}

function changeTrack(event) {
  var li = playingListElement();
  if (typeof(li) === "object") {
    li.className = "";
  }

  // find the parent <li>
  li = event.target;
  while (li.tagName.toLowerCase() !== "li") {
    li = li.parentElement;
  }
  li.className = "playing";
  var src = li.attributes.music_path.value;
  var audio = document.getElementsByTagName("audio")[0];
  audio.src = src;
  audio.play();
}

window.addEventListener("DOMContentLoaded", main);
