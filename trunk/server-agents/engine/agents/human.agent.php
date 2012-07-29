<?php

include_once('basic.agent.php');

class HumanAgent extends BasicAgent {
  
	function __construct($color, $name = 'Human Agent') {
		parent::__construct($color, $name);
	} // __construct()
	
	function getMove($game) {
		//$move_str = '';
		//$move_str = readline("Move? ");
		
		$move = new stdClass();
		$move->sx = readline('SX? ');
		$move->sy = readline('SY? ');
		$move->ex = readline('EX? ');
		$move->ey = readline('EY? ');
		
		//$game->handleMove($move);
		return $move;
	} // getMove()
} // HumanAgent

?>