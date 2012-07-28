<?php

include_once('chess.php');

$game = new Chess('1', '2');

print $game->toString();

print_r($game->movesFor(1, 0));

?>