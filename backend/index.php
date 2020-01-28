<?php
header('Content-Type: application/json; charset=utf-8');
header("access-control-allow-origin: *");

require './config.php';
require './src/JsonDB.class.php';

date_default_timezone_set('Europe/Madrid');

$db = new JsonDB("./db/");

/*
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
*/

if (isset($_GET["listado"]) ) {
		
	// Devolver lo guardado		
	$municipiosGuardados = $db->selectAll("municipios");
	if (count($municipiosGuardados) > 0) {
		http_response_code(200);
		echo json_encode($municipiosGuardados[0]);
		die();
	}

	//Pedir los datos de municipios
	$urlOpendata = "https://opendata.aemet.es/opendata/api/maestro/municipios/?api_key=" . $apiKey;

	$result = file_get_contents($urlOpendata);
	$codificado = utf8_encode($result);	
	$jsonDatos = json_decode($codificado, true);

	$nombres = array();
	foreach ($jsonDatos as &$valor) {
		array_push($nombres,array('nombre'=>$valor['nombre'], 'id'=> $valor['id']));
	}

	if (count($nombres) === 0){
		$rtn = array("error" => "No se pueden obtener los datos de los municipios");
	    http_response_code(200);
	    print json_encode($rtn);
		die();
	}

	// Guardar resultado 
	$db->insert("municipios", $nombres, true);
    
    http_response_code(200);
    print json_encode($nombres);
	die();
}

if (!isset($_GET["id"]) || empty($_GET["id"])) {
	$rtn = array("error" => "Falta identificador de la ciudad o localidad");
    http_response_code(500);
    print json_encode($rtn);
	die();
}

$idCiudad = urlencode($_GET["id"]);

// Comprobar si la ciudad esta cacheada en menos de 3 horas
$now = new DateTime();
$fechaHoraActual = $now->getTimestamp();

$datosGuardados = $db->select("ciudad", "id", $idCiudad);
if (count($datosGuardados) > 0) {
		
	$fechaHoraLimite = $datosGuardados[0]["hora"] + 7200; //Two hours, 60 seg * 60 min * 2 hour
	if ($fechaHoraLimite > $fechaHoraActual) {
		// Devolver lo guardado		
		http_response_code(200);
		echo json_encode($datosGuardados[0]);
		die();
	}
}



//Pedir los datos por horas
$urlOpendata = "https://opendata.aemet.es/opendata/api/prediccion/especifica/municipio/horaria/" . $idCiudad .  "/?api_key=" . $apiKey;

$result = file_get_contents($urlOpendata);
if (!$result) {
	$rtn = array("error" => "No se pueden obtener los datos :(");
    http_response_code(200);
    print json_encode($rtn);
	die();
}

$codificado = utf8_encode($result);
$jsonDatos = json_decode($codificado, true);

if($jsonDatos['estado'] !== 200) {
	$rtn = array("error" => "No se pueden obtener los datos");
    http_response_code(200);
    print json_encode($rtn);
	die();
}

$result = file_get_contents($jsonDatos['datos']);
$codificado = utf8_encode($result);
$jsonDatos = json_decode($codificado, true);


$nombre = '';
if (array_key_exists("nombre",$jsonDatos[0])) {
	$nombre = $jsonDatos[0]['nombre'];
}

$dia = array();
if (array_key_exists("prediccion",$jsonDatos[0]) && array_key_exists("dia",$jsonDatos[0]['prediccion'])) {
	$dia = $jsonDatos[0]['prediccion']['dia'];
}

//Pedir los datos por días
$urlOpendata = "https://opendata.aemet.es/opendata/api/prediccion/especifica/municipio/diaria/" . $idCiudad .  "/?api_key=" . $apiKey;

$result = file_get_contents($urlOpendata);
$codificado = utf8_encode($result);
$jsonDatos = json_decode($codificado, true);

if($jsonDatos['estado'] !== 200) {
	$rtn = array("error" => "No se pueden obtener los datos");
    http_response_code(200);
    print json_encode($rtn);
	die();
}

$result = file_get_contents($jsonDatos['datos']);
$codificado = utf8_encode($result);
$jsonDatos = json_decode($codificado, true);

$semana = array();
if (array_key_exists("prediccion",$jsonDatos[0]) && array_key_exists("dia",$jsonDatos[0]['prediccion'])) {
	$semana = $jsonDatos[0]['prediccion']['dia'];
}

// Guardar fecha y hora cuando se realiza la llamada
$lista = array('id'=>$idCiudad, 'nombre'=> $nombre, 'hora'=>$fechaHoraActual, 'dia' => $dia, 'semana' => $semana);

// Guardar resultado procesado de la llamada
$db->insert("ciudad", $lista, true);

http_response_code(200);
echo json_encode($lista);

?>