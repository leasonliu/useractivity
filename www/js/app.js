// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('app', ['ionic'])

// var urlPrefix = 'http://192.168.1.162:8080';
var urlPrefix = 'https://useractivity.herokuapp.com';

app.controller('LoginController', function ($scope, $http) {
  $scope.userId = localStorage.getItem('userId');
  if ($scope.userId != null) {
    window.location = "mainpage.html";
  }
  $scope.username = ''
  $scope.password = ''
  $scope.tryLogin = function () {
    if ($scope.username == '') {
      $scope.showu = true;
      return;
    } else {
      $scope.showu = false;
    }
    if ($scope.password == '') {
      $scope.showp = true;
      return;
    } else {
      $scope.showp = false;
    }
    $http({
      method: 'POST',
      url: urlPrefix + '/login',
      data: { username: $scope.username, password: $scope.password },
      headers: {
        'Content-Type': 'application/json;charset=utf-8;'
      }
    }).success(function (response) {
      console.log('success!');
      if (response.status == '200') {
        console.log('200!');
        $scope.incorrect = false;
        localStorage.setItem('userId', response.data)
        window.location = "mainpage.html";
      } else if (response.status == '404') {
        $scope.incorrect = true;
      }
    }).error(function () {
      console.log('error!');
    })
  }
})

app.controller('MainPageController', function ($scope, $http, $ionicPopup) {
  $scope.userId = localStorage.getItem('userId');
  if ($scope.userId == null) {
    window.location = "index.html";
  }

  $scope.addActivity = function ($scope) {
    var cb_football = $scope.football;
    var cb_tennis = $scope.tennis;
    var cb_swim = $scope.swim;
    var other = $scope.other;
    var time_Football = $scope.time_Football;
    var time_Tennis = $scope.time_Tennis;
    var time_Swim = $scope.time_Swim;
    var time_Other = $scope.time_Other;
    var activities = "\"data\":{";
    if (cb_football) {
      activities += '"Football":' + time_Football;
    }
    if (cb_tennis) {
      if (cb_football) {
        activities += ',';
      }
      activities += '"Tennis":' + time_Tennis;
    }
    if (cb_swim) {
      if (cb_football || cb_tennis) {
        activities += ',';
      }
      activities += '"Swimming":' + time_Swim;
    }
    if (other != null && other != "" && other != undefined) {
      if (cb_football || cb_tennis || cb_swim) {
        activities += ',';
      }
      activities += '"' + other + '":' + time_Other + '}';
    } else {
      activities += '}';
    }
    var data = "{\"userId\":" + localStorage.getItem('userId') + ", " + activities + "}";
    $http({
      method: 'POST',
      url: urlPrefix + '/addActivity',
      data: data,
      headers: {
        'Content-Type': 'application/json;charset=utf-8;'
      }
    }).success(function (response) {
      console.log('success!');
      if (response.status == '200') {
        console.log('200!');
        $scope.showAlert = function () {
          var alertPopup = $ionicPopup.alert({
            title: 'Successfully Added!',
            template: 'Good Job!'
          });
          alertPopup.then(function (res) {
            console.log('OK');
          });
        };
        $scope.showAlert();
      } else if (response.status == '500') {
        console.log('500!');
        $scope.showAlert2 = function () {
          var alertPopup = $ionicPopup.alert({
            title: 'Fail to Add',
            template: 'Internal Server Error 500'
          });
          alertPopup.then(function (res) {
            console.log('OK');
          });
        };
        $scope.showAlert2();
      }
    }).error(function () {
      console.log('error!');
      $scope.showAlert3 = function () {
        var alertPopup = $ionicPopup.alert({
          title: 'Fail to Connect to Server',
          template: ''
        });
        alertPopup.then(function (res) {
          console.log('OK');
        });
      };
      $scope.showAlert3();
    })
  };

  $scope.logout = function () {
    localStorage.removeItem('userId');
    window.location = "index.html";
  };
  $scope.summary = function () {
    window.location = "summary.html";
  };
})

app.controller('SummaryController', function ($scope, $http, $ionicPopup) {
  $scope.userId = localStorage.getItem('userId');
  if ($scope.userId == null) {
    window.location = "index.html";
  }

  $http({
    method: 'GET',
    url: urlPrefix + '/summary/' + $scope.userId,
    headers: {
      'Content-Type': 'application/json;charset=utf-8;'
    }
  }).success(function (response) {
    console.log('success!');
    if (response.status == '200') {
      console.log('200!');
      jsonString = angular.fromJson(response.data);
      $scope.buildPieChart(jsonString);
    } else if (response.status == '404') {
      $scope.showAlert4 = function () {
        var alertPopup = $ionicPopup.alert({
          title: 'No Activity',
          template: 'Add Some Activities!'
        });
        alertPopup.then(function (res) {
          console.log('OK');
          window.location = "mainpage.html";
        });
      };
      $scope.showAlert4();
    }
  }).error(function () {
    console.log('error!');
    $scope.showAlert5 = function () {
      var alertPopup = $ionicPopup.alert({
        title: 'Fail to Connect to Server',
        template: ''
      });
      alertPopup.then(function (res) {
        console.log('OK');
        window.location = "mainpage.html";
      });
    };
    $scope.showAlert5();
  })

  $scope.back = function () {
    window.location = "mainpage.html";
  };

  $scope.buildPieChart = function (jsonData) {
    google.charts.load('current', { 'packages': ['corechart'] });
    google.charts.setOnLoadCallback(drawChart);
    function drawChart() {
      var dataArray = [];
      var headerArray = ['Activity', 'Hours In the Last Week'];
      dataArray.push(headerArray);
      for (var key in jsonData) {
        var innerArray = [];
        innerArray.push(key);
        innerArray.push(jsonData[key]);
        dataArray.push(innerArray);
      }
      console.log(dataArray)
      var data = google.visualization.arrayToDataTable(dataArray);
      var options = {
        title: 'My Recent Activities',
        legend: { 'position': 'top', 'maxLines': 5 },
        tooltip: { 'trigger': 'selection' },
        chartArea: { top: 100, width: '90%', height: '90%' }
      };
      var chart = new google.visualization.PieChart(document.getElementById('mychart'));
      chart.draw(data, options);
    }
  }
});

app.run(function ($ionicPlatform) {
  $ionicPlatform.ready(function () {
    if (window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})