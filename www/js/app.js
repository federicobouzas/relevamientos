// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('relevamientos', ['ionic', 'firebase', 'ngCordova', 'ngMap'])

        .config(function ($stateProvider, $urlRouterProvider) {
            $stateProvider
                    .state('rutas', {
                        url: '/',
                        templateUrl: 'rutas.html'
                    })
                    .state('ruta', {
                        url: '/ruta/{ruta_id}',
                        templateUrl: 'ruta.html'
                    })
                    .state('relevamiento', {
                        url: '/ruta/{ruta_id}/relevamiento/{relevamiento_id}',
                        templateUrl: 'relevamiento.html'
                    });
            $urlRouterProvider.otherwise('/');
        })

        .run(function ($ionicPlatform, $rootScope, $ionicLoading) {
            $ionicPlatform.ready(function () {
                $ionicLoading.show({template: 'Iniciando...'});
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
                $ionicLoading.hide();
            });
            var config = {
                apiKey: "AIzaSyDBQJJM8vDMcKLde8FRQAmZtIq2vhwO2R0",
                authDomain: "relevamientos-b26d9.firebaseapp.com",
                databaseURL: "https://relevamientos-b26d9.firebaseio.com",
                projectId: "relevamientos-b26d9",
                storageBucket: "relevamientos-b26d9.appspot.com",
                messagingSenderId: "235749037741"
            };
            $rootScope.firebase = firebase.initializeApp(config);
        })

        .controller('RutasController', function ($rootScope, $scope, $firebaseArray) {
            var rutasRef = $rootScope.firebase.database().ref().child("rutas")
                    .orderByChild('encargado')
                    .equalTo("federicobouzas@gmail.com");
            $scope.rutas = $firebaseArray(rutasRef);
        })

        .controller('RutaController', function ($rootScope, $scope, $firebaseArray, $stateParams) {
            var relevamientosRef = $rootScope.firebase.database().ref().child("rutas/" + $stateParams.ruta_id + "/relevamientos");
            $scope.relevamientos = $firebaseArray(relevamientosRef);
            $scope.ruta_id = $stateParams.ruta_id;
        })

        .controller('RelevamientoController', function ($rootScope, $scope, $firebaseObject, $stateParams,
                $ionicLoading, $cordovaCamera, $ionicActionSheet, $ionicHistory) {
            $ionicLoading.show({template: 'Cargando...'});
            var relevamientoRef = $rootScope.firebase.database().ref().child("/rutas/" + $stateParams.ruta_id + "/relevamientos/" + $stateParams.relevamiento_id);
            var storageRef = $rootScope.firebase.storage().ref().child($stateParams.ruta_id);
            $scope.fotos = [];
            $scope.relevamiento = $firebaseObject(relevamientoRef);
            $scope.relevamiento.$loaded().then(function () {
                var remaining = typeof $scope.relevamiento.fotos != "undefined" ? Object.keys($scope.relevamiento.fotos).length : 0;
                if (remaining === 0) {
                    $ionicLoading.hide();
                }
                for (var i in $scope.relevamiento.fotos) {
                    var imageRef = storageRef.child(i + ".jpeg");
                    imageRef.getDownloadURL().then(function (url) {
                        toDataURL(url, function (dataUrl) {
                            $scope.fotos.push(dataUrl);
                            $scope.$apply();
                            if (--remaining === 0) {
                                $ionicLoading.hide();
                            }
                        });
                    });
                }
                $scope.relevamiento.fotos = {};
            });
            $scope.tomarFoto = function () {
                if (typeof Camera != "undefined") {
                    var options = {
                        quality: 50,
                        destinationType: Camera.DestinationType.DATA_URL,
                        sourceType: Camera.PictureSourceType.CAMERA,
                        encodingType: Camera.EncodingType.JPEG,
                        saveToPhotoAlbum: false,
                        correctOrientation: true
                    };
                    $cordovaCamera.getPicture(options).then(function (imageData) {
                        $scope.fotos.push("data:image/jpeg;base64," + imageData);
                    });
                }
            };
            $scope.borrarFoto = function (key) {
                $ionicActionSheet.show({
                    destructiveText: 'Borrar',
                    titleText: 'Borrar Foto',
                    cancelText: 'Cancelar',
                    destructiveButtonClicked: function () {
                        $scope.fotos.splice(key, 1);
                        return true;
                    },
                    buttonClicked: function (index) {
                        return true;
                    }
                });
            };
            $scope.guardar = function () {
                var remaining = $scope.fotos.length;
                for (var i in $scope.fotos) {
                    var nombre = Math.round(Math.random() * 10000000000000000);
                    storageRef.child(nombre + ".jpeg").putString($scope.fotos[i], "data_url").then(function (snapshot) {
                        $scope.relevamiento.fotos[snapshot.a.name.substr(0, snapshot.a.name.length - 5)] = snapshot.a.downloadURLs[0];
                        if (--remaining === 0) {
                            $scope.relevamiento.realizado = true;
                            $scope.relevamiento.$save();
                        }
                    });
                }
                $ionicHistory.goBack();
            };
        });

function toDataURL(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        var reader = new FileReader();
        reader.onloadend = function () {
            callback(reader.result);
        };
        reader.readAsDataURL(xhr.response);
    };
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.send();
}
