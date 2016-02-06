(function() {
    'use strict';

    var SPACE = 32;
    var LEFT = 37;
    var RIGHT = 39;
    var player, tracksList, audioWrapper, liste;
    var BASE_URL;
    var elementsCount = 0;

    var configuration = {
        extensions: ['ogg', 'mp3', 'wav'],
        autoplay: true
    };

    function main() {
        var autoplaySong;
        var path_array = [];
        liste = addElement(document.body, 'div', {id: 'liste'});
        //tracksList = addElement(listWrapper, 'ul', {id: 'liste'});

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
            changeSong(-1);
        } else if (event.keyCode === RIGHT) {
            changeSong(1);
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
        var currentTrackNumber = parseInt(currentTrackElement.getAttribute('id').replace("t",""));
        var nextTrackElement;
        var nextTrackNumber = currentTrackNumber + shift;

        if (nextTrackNumber > 0) {
            nextTrackElement = document.getElementById("t" + nextTrackNumber)
        }
        if (nextTrackElement != null) {
            player.src = nextTrackElement.attributes.musicPath.value;
            currentTrackElement.className = currentTrackElement.className.replace(/\ba400\b/,'a100');
            currentTrackElement.className = currentTrackElement.className.replace(/\bplaying\b/,'');

            nextTrackElement.className = currentTrackElement.className.replace(/\ba100\b/,'a400');
            nextTrackElement.className += ' playing';
            player.play();
        }
    }

    function playingListElement() {
        if (player.attributes.src !== undefined) {
            var list = document.getElementsByClassName('track');
            for (var i = 0; i < list.length; i++) {
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
        var albumList = createPath(dirPath);

        var newEntry = addElement(albumList, 'li', {
            class: 'track a100', musicPath: [dirPath.join(''), href].join(''), id: "t" + ++elementsCount
        });

        var fileName = addElement(newEntry, 'span', {});
        fileName.appendChild(document.createTextNode(decodeURIComponent(href)));

        newEntry.addEventListener('click', playTrack);
        if (href.search(configuration.autoplaySong) !== -1) {
            newEntry.click();
            configuration.autoplaySong = /^$/;
        }
    }

    function createPath(dirPath) {
        var parentPath = "";
        var currentPath = "";
        var currentName;
        var currentDiv;
        var parentDiv;
        var currentColor;
        var albumList;
        for (var i = 0; i < dirPath.length; i++) {
            currentName = dirPath[i];
            parentPath = currentPath;
            currentPath += currentName;
            currentColor = "r" + ((9 - i) * 100);
            currentDiv = document.getElementById(currentPath);
            if (currentDiv == null) {
                if (i === 0) {
                    /*rootElement = addElement(liste, 'div', {
                        class: 'root-path red'
                    });*/
                    currentDiv = addElement(liste, 'div', {
                       class: 'path r000 r900 red', id: currentPath
                    });
                } else {
                    parentDiv = document.getElementById(parentPath);
                    if (parentDiv != null) {
                        currentDiv = addElement(parentDiv, 'div', {
                            class: currentColor + ' path', id: currentPath
                        })
                    }
                }
            }
        }
        if (currentDiv.firstChild == null) {
            albumList = addElement(currentDiv, 'ul', {
               class: 'tracks a100'
            });
        } else {
            albumList = currentDiv.firstChild;
        }
        return albumList;
    }

    function isFileNameValid(filename) {
        var extension = filename.split('.').slice(-1)[0];
        return configuration.extensions.indexOf(extension) >= 0;
    }

    function playTrack(event) {
        var currentTrackElement = playingListElement();
        if (typeof(currentTrackElement) === 'object') {
            currentTrackElement.className = currentTrackElement.className.replace(/\ba400\b/,'a100');
            currentTrackElement.className = currentTrackElement.className.replace(/\bplaying\b/,'');
        }

        var nextTrackElement = event.target;
        while (nextTrackElement.tagName.toLowerCase() !== 'li') {
            nextTrackElement = nextTrackElement.parentElement;
        }
        nextTrackElement.className = nextTrackElement.className.replace(/\ba100\b/,'a400');
        nextTrackElement.className += ' playing';
        player.src = nextTrackElement.attributes.musicPath.value;
        player.play();
    }

    window.addEventListener('DOMContentLoaded', main);
}());