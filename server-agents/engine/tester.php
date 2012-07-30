<?php

include_once('chess.php');
include_once('chess.agents.php');

$scenario = array(
    array(null,null,null,null,null,null,null,null),
    array(null,'wk',null,null,null,null,null,null),
    array(null,null,null,null,null,null,null,null),
    array(null,null,null,null,null,null,null,null),
    array(null,null,null,null,null,null,null,null),
    array(null,null,null,null,null,null,null,null),
    array(null,null,null,null,null,null,null,null),
    array(null,null,null,null,null,null,null,'bk')
);

$player_1 = new RandomAI(Piece::White, "Random White (#1)");
$player_2 = new RandomAI(Piece::Black, "Random Black (#2)");

$game = new Chess($player_1, $player_2);

$game->createScenario($scenario);

print $game->toString();

$r = $game->start();
print $r == Piece::White ? "White Wins\n" : "Black Wins\n";

//$game->move(0,1,0,2);

//print $game->toString();$brd_cache .= "  $horiz\n";



//print_r($game->movesFor(1, 0));

?>