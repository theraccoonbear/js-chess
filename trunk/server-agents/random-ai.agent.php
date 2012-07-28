<?php

$response = new stdClass();
$response->status = 0;
$response->message = 'ok';
$response->move = new stdClass();
$response->move->sx = 0;
$response->move->sy = 0;
$response->move->ex = 0;
$response->move->ey = 0;

$init_board = $_REQUEST['board'];

if (!is_array($init_board)) {
	$response->status = 1;
	$response->message = 'Board not present or not passed as an array';
} else {
	
}

print json_encode($response);

?>