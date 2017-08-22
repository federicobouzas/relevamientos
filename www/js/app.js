// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('relevamientos', ['ionic', 'firebase', 'ngCordova', 'ngMap'])

        .config(function ($stateProvider, $urlRouterProvider) {
            $stateProvider
                    .state('rutas', {
                        url: '/rutas',
                        templateUrl: 'templates/rutas.html'
                    })
                    .state('ruta', {
                        url: '/ruta/{ruta_id}',
                        templateUrl: 'templates/ruta.html'
                    })
                    .state('mapa-ruta', {
                        url: '/mapa-ruta/{ruta_id}',
                        templateUrl: 'templates/mapa-ruta.html'
                    })
                    .state('relevamiento', {
                        url: '/ruta/{ruta_id}/relevamiento/{relevamiento_id}',
                        templateUrl: 'templates/relevamiento.html'
                    })
                    .state('login', {
                        url: '/login',
                        templateUrl: 'templates/login.html'
                    });
            $urlRouterProvider.otherwise('/login');
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
            var configDev = {
                apiKey: "AIzaSyDQjFlguFrchn2lHVaxgEBj3alYXJZ9gjI",
                authDomain: "relevamientos-desarrollo.firebaseapp.com",
                databaseURL: "https://relevamientos-desarrollo.firebaseio.com",
                projectId: "relevamientos-desarrollo",
                storageBucket: "relevamientos-desarrollo.appspot.com",
                messagingSenderId: "977903626794"
            };
            $rootScope.firebase = firebase.initializeApp(config);
        })

        .controller('LoginController', function ($rootScope, $scope, $ionicHistory, $state, $ionicPopup, $ionicLoading) {
            $rootScope.user = {};
            var ultimoMailLogueado = localStorage.getItem("email");
            if (ultimoMailLogueado) {
                $scope.user.email = ultimoMailLogueado;
            }
            $scope.login = function () {
                $ionicLoading.show({template: 'Cargando relevador...'});
                $scope.user.email = $scope.user.email.toLowerCase();
                $rootScope.firebase.auth().signInWithEmailAndPassword($scope.user.email, $scope.user.clave).catch(function (error) {
                    $ionicPopup.alert({
                        title: 'Error', template: error.message, buttons: [{text: 'OK', type: 'button-balanced'}]
                    });
                    $ionicLoading.hide();
                }).then(function (user) {
                    if (user) {
                        localStorage.setItem("email", $scope.user.email);
                        $ionicLoading.hide();
                        $ionicHistory.nextViewOptions({
                            disableBack: true,
                            historyRoot: true
                        });
                        $state.go("rutas");
                    }
                });
            };
        })

        .controller('RutasController', function ($rootScope, $scope, $ionicHistory, $ionicLoading, $firebaseArray) {
            $ionicLoading.show({template: 'Cargando rutas...'});
            var rutasRef = $rootScope.firebase.database().ref().child("rutas")
                    .orderByChild('encargado')
                    .equalTo($rootScope.user.email);
            $scope.rutas = $firebaseArray(rutasRef);
            $scope.rutas.$loaded().then(function () {
                $ionicLoading.hide();
            });
        })

        .controller('RutaController', function ($rootScope, $scope, $ionicLoading, $firebaseArray, $stateParams) {
            $ionicLoading.show({template: 'Cargando ruta...'});
            $scope.ruta_id = $stateParams.ruta_id;
            var relevamientosRef = $rootScope.firebase.database().ref().child("rutas/" + $stateParams.ruta_id + "/relevamientos");
            $scope.relevamientos = $firebaseArray(relevamientosRef);
            $scope.relevamientos.$loaded().then(function () {
                $ionicLoading.hide();
            });
        })

        .controller('MapaRutaController', function ($rootScope, $scope, $ionicLoading, $firebaseObject, $firebaseArray, $stateParams) {
            $ionicLoading.show({template: 'Cargando mapa...'});
            var remaining = 2;
            document.querySelector('#map').style.height = window.innerHeight + "px";
            $scope.ruta_id = $stateParams.ruta_id;
            var rutaRef = $rootScope.firebase.database().ref().child("rutas/" + $stateParams.ruta_id);
            $scope.ruta = $firebaseObject(rutaRef);
            $scope.ruta.$loaded().then(function () {
                var coords = $scope.ruta.centro.split(",");
                $scope.lat = coords[0];
                $scope.lng = coords[1];
                if (--remaining == 0) {
                    $ionicLoading.hide();
                }
            });
            $scope.relevamientos = $firebaseArray(rutaRef.child("relevamientos"));
            $scope.relevamientos.$loaded().then(function () {
                if (--remaining == 0) {
                    $ionicLoading.hide();
                }
            });
        })

        .controller('RelevamientoController', function ($rootScope, $scope, $firebaseObject, $stateParams, $state,
                $ionicLoading, $cordovaCamera, $ionicActionSheet, $ionicHistory, $cordovaImagePicker, $ionicPopup) {
            $ionicLoading.show({template: 'Cargando relevamiento ...'});
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
                        saveToPhotoAlbum: true,
                        correctOrientation: true
                    };
                    $cordovaCamera.getPicture(options).then(function (imageData) {
                        $scope.fotos.push("data:image/jpeg;base64," + imageData);
                    });
                }
            };
            $scope.seleccionarFoto = function () {
                if (typeof Camera != "undefined") {
                    var options = {
                        destinationType: Camera.DestinationType.DATA_URL,
                        sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
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
            var chequearRutaFinalizada = function () {
                var rutaRef = $rootScope.firebase.database().ref().child("/rutas/" + $stateParams.ruta_id);
                var ruta = $firebaseObject(rutaRef);
                ruta.$loaded().then(function () {
                    var rutaRealizada = true;
                    for (var i in ruta.relevamientos) {
                        if (!ruta.relevamientos[i].realizado) {
                            rutaRealizada = false;
                            break;
                        }
                    }
                    if (rutaRealizada) {
                        ruta.realizada = true;
                        ruta.$save();
                        $state.go("rutas");
                    }
                });
            };
            var guardarFireBase = function () {
                $scope.relevamiento.$save()
                        .then(function (ref) {
                            $scope.relevamiento.realizado = true;
                            $scope.relevamiento.fecha_relevado = parseInt((new Date().getTime()) / 1000);
                            $scope.relevamiento.$save().then(function (ref2) {
                                chequearRutaFinalizada();
                            })})
                        .catch(function (error) {
                            $ionicPopup.alert({
                                title: 'Error', template: error.message, buttons: [{text: 'OK', type: 'button-balanced'}]
                            });
                        });
            };
            $scope.guardar = function () {
                var remaining = $scope.fotos.length;
                if (remaining) {
                    for (var i in $scope.fotos) {
                        var nombre = Math.round(Math.random() * 10000000000000000);
                        storageRef.child(nombre + ".jpeg").putString($scope.fotos[i], "data_url")
                                .then(function (snapshot) {
                                    $scope.relevamiento.fotos[snapshot.a.name.substr(0, snapshot.a.name.length - 5)] = snapshot.a.downloadURLs[0];
                                    if (--remaining === 0) {
                                        guardarFireBase();
                                    }
                                })
                                .catch(function (error) {
                                    $ionicPopup.alert({
                                        title: 'Error', template: error.message, buttons: [{text: 'OK', type: 'button-balanced'}]
                                    });
                                });
                    }
                } else {
                    guardarFireBase();
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