(function() {
  'use strict';

  var SPACE = 32;
  var LEFT = 37;
  var RIGHT = 39;
  var player, tracksList;

  var configuration = {
    extensions: ['ogg', 'mp3', 'wav'],
    autoplay: true
  };

  function main() {
    player = addElement(document.body, 'audio', {controls: ''});
    player.onended = endedHandler;

    tracksList = addElement(document.body, 'ul', {id: 'list'});

    var autoplay_song = window.location.search.match(/auto=[^&]*/);
    if (autoplay_song !== null) {
      configuration.autoplay_song = new RegExp(autoplay_song[0].slice(5), 'i');
    }

    // Recursion over subfolders
    download(window.location.pathname.substring(0,
        window.location.pathname.lastIndexOf('/') + 1));
    document.addEventListener('keydown', keyboardHandler);
  }

  function keyboardHandler(event) {
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
    if (configuration.autoplay === true) {
      changeSong(1);
    }
  }

  function changeSong(shift) {
    player.pause();
    var currentTrackElement = playingListElement();
    var nextTrackElement;
    if (shift === 1) {
      nextTrackElement = currentTrackElement.nextElementSibling;
    } else {
      nextTrackElement = currentTrackElement.previousElementSibling;
    }
    player.src = nextTrackElement.attributes.music_path.value;
    player.play();
    currentTrackElement.className = '';
    nextTrackElement.className = 'playing';
  }

  function playingListElement() {
    if (player.attributes.src !== undefined) {
      var list = document.getElementById('list').childNodes;
      for (var i = 0; i <= list.length; i++) {
        if (list[i].attributes.music_path.value === player.attributes.src.value) {
          return list[i];
        }
      }
    }
  }

  function addElement(_parent, nature, attributes) {
    var newElement = document.createElement(nature);
    for (var key in attributes) {
      if (attributes.hasOwnProperty(key)) {
        newElement.setAttribute(key, attributes[key]);
      }
    }
    _parent.appendChild(newElement);
    return newElement;
  }

  function download(path) {
    var request = new XMLHttpRequest();
    request.open('GET', path);
    request.onreadystatechange = function () {
      if (request.readyState === 4 && request.status === 200) {
        parsePage(request.responseText, path);
      }
    };
    request.send(null);
  }

  function parsePage(page, path) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(page, 'text/html');
    var links = doc.getElementsByTagName('a');
    for (var i = 0; i < links.length; i++) {
      var href = links[i].getAttribute('href');
      if (href.slice(-1) === '/') {
        if (href.slice(0, 1) !== '.') {
          download(path + href);
        }
      } else if (isFileNameValid(href) === true) {
        addMusicUri(path, href);
      }
    }
  }

  function addMusicUri(dirPath, href) {
    var newEntry = addElement(document.getElementById('list'), 'li', {
      music_path: [dirPath, href].join('')
    });

    var directory = addElement(newEntry, 'span', {'class': 'album'});
    directory.appendChild(document.createTextNode(decodeURIComponent(dirPath)));

    var fileName = addElement(newEntry, 'span', {'class': 'track'});
    fileName.appendChild(document.createTextNode(decodeURIComponent(href)));

    newEntry.addEventListener('click', playTrack);
    if (href.search(configuration.autoplay_song) !== -1) {
      newEntry.click();
      configuration.autoplay_song = /^$/;
    }
  }

  function isFileNameValid(filename) {
    var extension = filename.split('.').slice(-1)[0];
    return configuration.extensions.indexOf(extension) >= 0;
  }

  function playTrack(event) {
    var currentTrackElement = playingListElement();
    if (typeof(currentTrackElement) === 'object') {
      currentTrackElement.className = '';
    }

    var nexTrackElement = event.target;
    while (nexTrackElement.tagName.toLowerCase() !== 'li') {
      nexTrackElement = nexTrackElement.parentElement;
    }
    nexTrackElement.className = 'playing';
    player.src = nexTrackElement.attributes.music_path.value;
    player.play();
  }

  window.addEventListener('DOMContentLoaded', main);
}());