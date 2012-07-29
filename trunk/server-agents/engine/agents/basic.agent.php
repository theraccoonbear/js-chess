<?php

class BasicAgent {
	var $color;
	var $name = '';
	var $game = null;
	
	function __construct($color, $name = 'Chess Agent') {
		$this->color = $color;
		$this->name = $name;
	} // __construct
	
	function getMove($game) {
		//$game->handleMove('resign');
		return 'resign';
	} // getMove()
	
	function atRandom($ar) {
		$idx = floor(rand(0, count($ar) - 1));
		return $ar[$idx];
	} // atRandom()
	
}

?>