(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var refreshRate = 1000*60;

var fetchTwitter = (function () {
  var ready = true;
  var script;
  var waitTimeout;
  var numFailues = 0;

  var appendScript = function() {
var src = '//cdn.syndication.twimg.com/widgets/timelines/710898754191228928?&lang=en&rnd=' + Math.random() + '&callback=__twitterCB';    
script = document.createElement('SCRIPT');
    script.src = src;
    document.body.appendChild(script);
    waitTimeout = window.setTimeout(function () {
      numFailures += 1;
    }, refreshRate);
  };

  var stripGarbage = function(text) {
    return text.replace(/<b[^>]*>(.*?)<\/b>/g, function(dataAndEvents, match) {
      return match;
    }).replace(/(?:class|style|data-[a-z-]+|rel|target)=".*?"/g, '');
  }

  return function (cb) {
    window.__twitterCB = function(data) {
      script.parentNode.removeChild(script);

      var mediaInfo, avatar, realMedia, authorInfo, authorHTML, avatarHTML, result, tweet, tweetElement, tweets, _i, _len, _ref;
      result = document.createElement('div');
      result.innerHTML = data.body;
      tweets = [];
      _ref = result.getElementsByClassName('timeline-Tweet');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        tweetElement = _ref[_i];
	if (tweetElement.getElementsByClassName('timeline-Tweet-media')[0]) {
		mediaInfo = tweetElement.getElementsByClassName('timeline-Tweet-media')[0].innerHTML;
		 
		var url = mediaInfo.match(/data-srcset=.+alt=.+"/)	
	        if(url) {
			var newSrc = url[0].match(/https.+large.+https.+(https.+small)\b/)
			mediaInfo =  mediaInfo.replace(/<a(\s|\w|=|\"|:|\/|\.|-|>|<)*<\/a>$/gm,'');
			
		realMedia = stripGarbage(mediaInfo.replace(url, "src=\"" + decodeURIComponent(newSrc[1]) + "\" title=\"View image on Twitter\""));
		} else realMedia = stripGarbage(mediaInfo);

		} else 
		realMedia = "";
        tweet = {
          id: tweetElement.getAttribute('data-tweet-id'),
          isRetweet: 0 < tweetElement.getElementsByClassName('timeline-Tweet-retweetCredit').length,
          content: stripGarbage(tweetElement.getElementsByClassName('timeline-Tweet-text')[0].innerHTML),
          media: realMedia, 
	  time: new Date(tweetElement.getElementsByClassName('timeline-Tweet-metadata')[0].getElementsByClassName("dt-updated")[0].getAttribute('datetime').replace(/-/g, '/').replace('T', ' ').split('+')[0])
        };
        authorHTML = tweetElement.getElementsByClassName('timeline-Tweet-author')[0].getElementsByClassName('TweetAuthor')[0];
        authorInfo = authorHTML.getElementsByClassName('TweetAuthor-link')[0];
	tweet.authorURL = authorInfo.getAttribute('href');
        tweet.author = tweet.authorURL.match(/[^/]+$/)[0];
        tweet.authorFullName = authorInfo.getElementsByClassName('TweetAuthor-name')[0].getAttribute('title');
        avatar     = authorInfo.getElementsByClassName('TweetAuthor-avatar')[0];
	avatarHTML = avatar.getElementsByClassName('Avatar')[0];
        tweet.authorAvatar = "<img src=\"" + (avatarHTML.getAttribute('data-src-1x')) + "\" data-src-2x=\"" + (avatarHTML.getAttribute('data-src-2x')) + "\">";
        tweets.push(tweet);
      }

      cb(tweets, function() {
        window.clearTimeout(waitTimeout);
        numFailures = 0;
        ready = true;
      });
    };

    if (ready || numFailures < 5) {
      ready = false;
      appendScript();
    } else {
      location.reload();
    }
  }

})();

var fetchSchedule = function(cb) {
  $.get('https://spreadsheets.google.com/feeds/list/1Of8KpyJx2rP6sYkzoQBwZMZBiITE3VtanG0aZfgOiGY/od6/public/basic?hl=en_US&alt=json', function (data) {
    var newData = [];
    _.forEach(data.feed.entry, function (row) {
      var content = row.content.$t;
      content = content.split(",");
      var entry = {};
      for (var i = 0; i < content.length; i++) {
        var item = content[i];
        var idx = item.indexOf(":");
        var key = item.substring(0, idx).trim();
        var value = item.substring(idx+1, item.length).trim();
        entry[key] = value;
      }

      var el = {};
      el.start = Date.parse(entry.start);
      el.end = Date.parse(entry.end);
      el.effectiveEnd = el.end;
      el.title = entry.description;
      if (entry.location) {
        el.location = entry.location;
      } else {
        el.location = "";
      }
      newData.push(el);
    });

    cb(Date.parse(data.feed.updated.$t), newData);
  });
}

var App = angular.module('bitcampLive', []).run(function($rootScope) {
  $rootScope.refresh = refreshRate;

  $rootScope.notifQueue = [];

  $rootScope.notify = function(data, type) {
    data.type = type;
    $rootScope.$broadcast('notification', data);
  }

  $rootScope.transitionIn = function(el, t) {
    if (typeof(t)==='undefined') { t = 500; }
    setTimeout(function() {
      el.in = true;
    }, t);
  }

  $rootScope.humanizeTime = function(t) {
    var seconds = Math.floor((t/1000)%60),
        minutes = Math.floor((t/(1000*60))%60),
        hours = Math.floor((t/(1000*60*60))%24),
        days = Math.floor((t/(1000*60*60*24))%7),
        weeks = Math.floor((t/(1000*60*60*24*7))%4),
        months = Math.floor((t/(1000*60*60*24*7*4))%12),
        years = Math.floor((t/(1000*60*60*24*7*4*12)));

    function pluralize(num, str) {
      if (num != 1) {
        str = str + 's';
      }
      return num + ' ' + str;
    }

    if (years > 0) {
      return pluralize(years, 'year');
    }
    if (months > 0) {
      return pluralize(months, 'month');
    }
    if (weeks > 0) {
      return pluralize(weeks, 'week');
    }
    if (days > 0) {
      return pluralize(days, 'day');
    }
    if (hours > 0) {
      return pluralize(hours, 'hour');
    }
    if (minutes > 0) {
      return pluralize(minutes, 'minute');
    }
    if (seconds > 0) {
      return pluralize(seconds, 'second');
    }
    return '0 seconds';

  }

  $rootScope.containsAll = function(fst, snd) {
    for (var property in fst) {
      if (fst.hasOwnProperty(property)) {
        if (!fst[property] && !snd[property]) {
          return true;
        }
        if (fst[property] !== snd[property]) {
          return false;
        }
      }
    }
    return true;
  }


  $rootScope.updateList = function(oldEls, newEls, insertFunc, callback) {
    _.forEach(newEls, function(newEl) {
      var idx = -1;
      for (var i = 0; i < oldEls.length; i++) {
        if (oldEls[i].id === newEl.id) {
          idx = i;
          break;
        }
      }
      if (idx >=0) {
        if (!$rootScope.containsAll(newEl, oldEls[idx])) {
          oldEls[idx] = newEl;
        }
      } else {
        oldEls.push(newEl);
        insertFunc(newEl);
      }
    });

    var removes = []
    _.forEach(oldEls, function(oldEl) {
      idx = -1;
      for (var i = 0; i < newEls.length; i++) {
        if (newEls[i].id === oldEl.id) {
          idx = i;
          break;
        }
      }
      if (idx < 0) {
        removes.push(oldEls.indexOf(oldEl));
      }
    });

    oldEls = $.grep(oldEls, function(n, i) {
      return $.inArray(i, removes) ==-1;
    });

    return callback(oldEls)
  }

});

var addEvents = [];

App.controller('ScheduleController', function($rootScope, $scope, $http, $interval, $timeout) {

  $scope.status = function(event) {
    if (event.start <= Date.now()) {
      if (event.end >= Date.now()) {
        return "ongoing";
      }
    }
    if (event.expiring) {
      return "expiring";
    }
    if (event.expired) {
      return "expired";
    }
  }

  $scope.checkTime = function(event) {
    return event.end >= Date.now() || event.expiring;
  }

  $scope.notify = function(ev) {
    $rootScope.$broadcast('notification', { title: ev.title, time: ev.start, end: ev.end, description: ev.location, type: "event" });
  }

  $scope.lastupdate;

  fetchSchedule(function (lastupdate, data) {
    $scope.events = data;
    for (var i =0; i < $scope.events.length; i++) {
      var ev = $scope.events[i];
      if (ev.effectiveEnd < Date.now() && !ev.expired) {
        ev.expiring = true;
        ev.expired = true;
        expire(ev);
      }
    }

    $scope.lastupdate = lastupdate;
    $('#schedule').css('display', '');
    $scope.$apply();
  });

  $interval(function() {

    fetchSchedule(function (lastupdate, data) {
      /*data = data.concat(addEvents);

      $rootScope.updateList($scope.events, data, function(ev) {
        // inserted new event
      }, function(evs) {
        $scope.events = evs;
      });*/
      if (lastupdate > $scope.lastupdate) {
        $scope.events = data;
        $scope.lastupdate = lastupdate;
        $scope.$apply();
      }
    });

  }, $rootScope.refresh);

  $interval(function() {
    if ($scope.events) {
      for (var i =0; i < $scope.events.length; i++) {
        var ev = $scope.events[i];
        if (ev.effectiveEnd < Date.now() && !ev.expired) {
          ev.expiring = true;
          ev.expired = true;
          expire(ev);
        }

        /*var diff = ev.start - Date.now();
        if (diff >= 1*60000 && diff <= 10*60000 && !ev.notified) {
          if (QueryString.notifications!='false' && $('.modal-backdrop').length==0) {
            ev.notified = true;
            //$rootScope.notify(ev, 'event');
            $rootScope.$broadcast('notification', { title: ev.title, time: ev.start, end: ev.end, description: ev.location, type: "event" });
          }
        }*/
      }
    }
  }, $rootScope.refresh);
});

function expire(ev) {
  setTimeout(function() {
    ev.expiring = false;
  }, 600);
}

App.controller('TweetsController', function($rootScope, $scope, $interval, $sce) {
  $scope.init = function() {
    $scope.tweets = [];

    fetchTwitter(function (tweets, done) {
      _.forEach(tweets, function(tweet) {
        tweet.time = Date.parse(tweet.time.toString());
        Date.parse(tweet.time.toString().replace(/GMT.+/, 'GMT-0000'));
        tweet.in = true;
      });
      $scope.tweets = tweets;
      $scope.$apply();
      $('#bitcamp-twitter').css('display', '');
      done();
    });

    $interval(function() {
      fetchTwitter(function (tweets, done) {
        $scope.tweets = tweets;
        $scope.$apply();
        done();
        /*_.forEach(tweets, function(tweet) {
          tweet.time = Date.parse(tweet.time.toString().replace(/GMT.+/, 'GMT-0000'));
        });
        $rootScope.updateList($scope.tweets, tweets, function(tweet) {
          $rootScope.transitionIn(tweet);
        }, function(data) {
          $scope.tweets = data;
          done();
        });*/
      });
    }, $rootScope.refresh);
  }

  $scope.isIn = function(tweet) {
    if (tweet.in) {
      return "in";
    }
  }

  $scope.timeDiff = function(tweet) {
    if (tweet && tweet.time) {
      var d = new Date();
      d = new Date(d.valueOf() + d.getTimezoneOffset() * 60000);
      var t = Math.round((d.valueOf() - tweet.time))
      return $rootScope.humanizeTime(t) + " ago";
    }
  }

 $scope.trustMedia = function(media) {
	return $sce.trustAsHtml(media);
  }	
});

var QueryString = function () {
  var query_string = {};
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
    if (typeof query_string[pair[0]] === "undefined") {
      query_string[pair[0]] = decodeURIComponent(pair[1]);
    } else if (typeof query_string[pair[0]] === "string") {
      var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
      query_string[pair[0]] = arr;
    } else {
      query_string[pair[0]].push(decodeURIComponent(pair[1]));
    }
  }
    return query_string;
}();

App.filter('cut', function () {
  return function (value, wordwise, max, tail) {
      if (!value) return '';

      max = parseInt(max, 10);
      if (!max) return value;
      if (value.length <= max) return value;

      value = value.substr(0, max);
      if (wordwise) {
          var lastspace = value.lastIndexOf(' ');
          if (lastspace != -1) {
              value = value.substr(0, lastspace);
          }
      }

      return value + (tail || '…');
  };
});

App.filter('filterNull', function() {
  return function (val) {
    if (val=="Invalid Date") {
      return "";
    }
    return val;
  }
});

App.filter('sanitize', function($sce) {
  return function(html) {
    return $sce.trustAsHtml(html);
  };
});



function viewport() {
  var e = window, a = 'inner';
  if (!('innerWidth' in window )) {
      a = 'client';
      e = document.documentElement || document.body;
  }
  return { width : e[ a+'Width' ] , height : e[ a+'Height' ] };
}

function sizeElements() {
  var marginBottom = 34;
  $('#announcements-wrapper').css('height', '');
  $('#announcements-wrapper').css('max-height', '200px');
  $('#schedule-wrapper').css('height', '');

  if (viewport().width >= 992) {
    $('#announcements-wrapper').css('max-height', '');
    $('#schedule-wrapper').css('height', $(window).height() - $('#schedule-wrapper').offset().top - marginBottom);
    $('#announcements-wrapper').css('height', $(window).height() - $('#announcements-wrapper').offset().top - marginBottom);
  }
  sizeTableHead();
}

function sizeTableHead() {
  var row = $($('#schedule tr:not(".expired")')[0]).children();
  
  $('#schedule-head th:nth-child(1)').css('width', $(row[0]).width() + 40);
  $('#schedule-head th:nth-child(2)').css('width', $(row[1]).width() + 40);
  $('#schedule-head th:nth-child(3)').css('width', $(row[2]).width() + 40);

  var diff = $('#schedule-wrapper').width() - $('#schedule-head tr').width();
  if (diff > 0) {
    var last = $('#schedule-head th:nth-child(3)');
    last.css('width', last.width() + diff + 42);
  }
}

$(document).ready(function() {
  $(window).load(function() {
    sizeElements();
  });
  
  //Notification.requestPermission();

});

$(window).resize(function() {
  sizeElements();
});

if (QueryString.refresh=='true') {
  setTimeout(function() {
    location.reload();
  }, 36000000);
}
},{}]},{},[1]);
