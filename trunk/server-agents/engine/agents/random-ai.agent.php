<?php

include_once('basic.agent.php');

class RandomAI extends BasicAgent {
    function __construct($color, $name = 'RandomAI') {
        parent::__construct($color, $name);
    } // __construct()
    
    function getMove($game) {
        $this->game = $game;
        $start = microtime();
        $elap = microtime() - $start;
        $board = $game->board;
        $my_pieces = array();
        $ctxt = $this;
		
        for ($x = 0; $x < 8; $x++) {
            for ($y = 0; $y < 8; $y++) {
                $piece = $board[$x][$y];
                if ($piece != null && $piece->color == $this->color) {
                    array_push($my_pieces, $piece);
                }
            }
        }
	
				if (count($my_pieces) < 1) {
					print "OH NO, WHERE ARE MY PIECES!\n";
					return 'resign';
				} elseif (count($my_pieces) == 1) {
					$to_play = $my_pieces[0];
					$moves = $game->movesFor($to_play->x, $to_play->y);
					if (count($moves->move) == 0 && count($moves->capture) == 0) {
						print $to_play->toString('long') . " says \"HELP I'M STUCK!\"";
						print_r($moves);
						return 'resign';
					}
				}
				
				$the_move = new Move(null, null, null, null);
								
				$ready = false;
				$safety_cnt = 0;
				
				$to_play = $this->atRandom($my_pieces);
				$now = time();
				while (!$ready && $safety_cnt < 10000) {
					if ($to_play != null) {
					$the_move->sx = $to_play->x;
					$the_move->sy = $to_play->y;
					
					$moves = $game->movesFor($to_play->x, $to_play->y);
					if (count($moves->capture) > 0) {
						$m = $this->atRandom($moves->capture);
						$the_move->ex = $m->ex;
						$the_move->ey = $m->ey;
						$ready = true;
					} else if (count($moves->move) > 0) {
						$m = $this->atRandom($moves->move);
						$the_move->ex = $m->ex;
						$the_move->ey = $m->ey;
						$ready = true;
					} else {
						$to_play = $this->atRandom($my_pieces);
					}
					
					}
					
					$now = microtime();
					$safety_cnt++;
				} // while()
				
				//game.handleMove(the_move);
				return $the_move;
    } // getMove()
} // HumanAgent

?>