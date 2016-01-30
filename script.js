(function() {
    'use strict';

    var SPACE = 32;
    var LEFT = 37;
    var RIGHT = 39;
    var player, tracksList, audioWrapper, listWrapper;
    var BASE_URL;

    var configuration = {
        extensions: ['ogg', 'mp3', 'wav'],
        autoplay: true
    };

    function main() {
        var autoplaySong;
        var path_array = [];
        listWrapper = addElement(document.body, 'div', {class: 'listWrapper'});
        tracksList = addElement(listWrapper, 'ul', {id: 'list'});

        audioWrapper = addElement(document.body, 'div', {class: 'audioWrapper'});
        player = addElement(audioWrapper, 'audio', {controls: ''});
        player.onended = endedHandler;

        autoplaySong = window.location.search.match(/auto=[^&]*/);
        if (autoplaySong !== null) {
            configuration.autoplaySong = new RegExp(autoplaySong[0].slice(5), 'i');
        }

        // Recursion over subfolders
        path_array[0] = window.location.pathname.substring(0,
            window.location.pathname.lastIndexOf('/') + 1);
        BASE_URL = window.location.protocol + '//' + window.location.host;
        download(path_array);
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

    function endedHandler() {
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
        player.src = nextTrackElement.attributes.musicPath.value;
        currentTrackElement.className = '';
        nextTrackElement.className = 'playing';
        player.play();
    }

    function playingListElement() {
        if (player.attributes.src !== undefined) {
            var list = document.getElementById('list').childNodes;
            for (var i = 0; i <= list.length; i++) {
                if (list[i].attributes.musicPath.value === player.attributes.src.value) {
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
        if (path[path.length - 1].slice(-2) !== '//') {
            var request = new XMLHttpRequest();
            var requestPath;

            requestPath = path.join('');
            request.open('GET', requestPath);
            request.onreadystatechange = function () {
                var newPath = path.concat();
                if (request.readyState === 4 && request.status === 200) {
                    parsePage(request.responseText, newPath);
                } else if (request.readyState === 4) {
                    console.log("path : " + requestPath);
                    console.log("status : " + JSON.stringify(request));
                }
            };
            request.send(null);
        }
    }

    function parsePage(page, path) {
        var parser = new DOMParser();
        var doc = parser.parseFromString(page, 'text/html');
        var links = doc.getElementsByTagName('a');
        for (var i = 0; i < links.length; i++) {
            var href = links[i].getAttribute('href');
            if (href.slice(-1) === '/' && href.slice(0, 4) !== 'http') {
                if (href.slice(0, 1) !== '.') {
                    path.push(href.substring(0, href.lastIndexOf('/') + 1));
                    download(path.slice(0));
                    path.pop();
                }
            } else if (isFileNameValid(href) === true) {
                addMusicUri(path, href);
            }
        }
    }

    function addMusicUri(dirPath, href) {
        var newEntry = addElement(document.getElementById('list'), 'li', {
            musicPath: [dirPath.join(''), href].join('')
        });

        var directory = addElement(newEntry, 'span', {'class': 'album'});
        directory.appendChild(document.createTextNode(decodeURIComponent(dirPath.join(''))));

        var fileName = addElement(newEntry, 'span', {'class': 'track'});
        fileName.appendChild(document.createTextNode(decodeURIComponent(href)));

        newEntry.addEventListener('click', playTrack);
        if (href.search(configuration.autoplaySong) !== -1) {
            newEntry.click();
            configuration.autoplaySong = /^$/;
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
        player.src = nexTrackElement.attributes.musicPath.value;
        player.play();
    }

    window.addEventListener('DOMContentLoaded', main);
}());