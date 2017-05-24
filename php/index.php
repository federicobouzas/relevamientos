<?php

require_once "vendor/ktamas77/firebase-php/src/firebaseLib.php";

const DEFAULT_URL = 'https://relevamientos-b26d9.firebaseio.com/';
const DEFAULT_TOKEN = 'BfpsCWTs2qFJr7E9wIimNd53ArqKnPuTuX3D7dHj';
const DEFAULT_PATH = '/';

$firebase = new \Firebase\FirebaseLib(DEFAULT_URL, DEFAULT_TOKEN);

$rutas = $firebase->get(DEFAULT_PATH . '/rutas');
var_dump($rutas);