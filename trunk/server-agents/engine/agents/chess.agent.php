<?php

class ChessAgent {
	var $color;
	var $name = '';
	
	function __construct($color, $name = 'Chess Agent') {
		$this->color = $color;
		$this->name = $name;
	} // __construct
	
	function getMove($game) {
		//$game->handleMove('resign');
		return 'resign';
	} // getMove()
	
}

?>