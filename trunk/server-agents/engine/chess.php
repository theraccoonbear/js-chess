<?php

include_once('chess.pieces.php');


class Chess {
	var $board = array(
		array(null,null,null,null,null,null,null,null),
		array(null,null,null,null,null,null,null,null),
		array(null,null,null,null,null,null,null,null),
		array(null,null,null,null,null,null,null,null),
		array(null,null,null,null,null,null,null,null),
		array(null,null,null,null,null,null,null,null),
		array(null,null,null,null,null,null,null,null),
		array(null,null,null,null,null,null,null,null)
	);
	
	var $opts = array(
										
	);
	
	var $player1 = null;
	var $player2 = null;
	
	function __construct($player1, $player2, $options = array()) {
		$this->opts = $options + $this->opts;
		$this->player1 = $player1;
		$this->player2 = $player2;
		$this->init();
	} // __construct()
	
	function init() {
		$this->setupBoard();
	} // init()
	
	function createPiece($c, $t, $x, $y) {
		$newPiece = null;
		
		switch ($t) {
			case Piece::Pawn:
				$newPiece = new Pawn($c, $x, $y);
				break;
			case Piece::Rook:
				$newPiece = new Rook($c, $x, $y);
				break;
			case Piece::Knight:
				$newPiece = new Knight($c, $x, $y);
				break;
			case Piece::Bishop:
				$newPiece = new Bishop($c, $x, $y);
				break;
			case Piece::Queen:
				$newPiece = new Queen($c, $x, $y);
				break;
			case Piece::King:
				$newPiece = new King($c, $x, $y);
				break;
		  default:
				$newPiece = new Pawn($c, $x, $y);
				break;
		} // switch(t)
		return $newPiece;
	} // createPiece()
	
	function addPiece($c, $t, $x, $y) {
		$newPiece = $this->createPiece($c, $t, $x, $y);
		
		$this->board[$x][$y] = $newPiece;
	} // addPiece()
	
	function setupBoard() {
		$this->board = array(
			array(null,null,null,null,null,null,null,null),
			array(null,null,null,null,null,null,null,null),
			array(null,null,null,null,null,null,null,null),
			array(null,null,null,null,null,null,null,null),
			array(null,null,null,null,null,null,null,null),
			array(null,null,null,null,null,null,null,null),
			array(null,null,null,null,null,null,null,null),
			array(null,null,null,null,null,null,null,null)
		);

		for ($x = 0; $x <= 7; $x++) {
			$this->addPiece(Piece::White, Piece::Pawn, $x, 6);
			$this->addPiece(Piece::Black, Piece::Pawn, $x, 1);
		}
		$this->addPiece(Piece::White, Piece::Rook, 0, 7);
    $this->addPiece(Piece::White, Piece::Rook, 7, 7);
    $this->addPiece(Piece::White, Piece::Knight, 1, 7);
    $this->addPiece(Piece::White, Piece::Knight, 6, 7);
    $this->addPiece(Piece::White, Piece::Bishop, 2, 7);
    $this->addPiece(Piece::White, Piece::Bishop, 5, 7);
    $this->addPiece(Piece::White, Piece::Queen, 3, 7);
    $this->addPiece(Piece::White, Piece::King, 4, 7);
    $this->addPiece(Piece::Black, Piece::Rook, 0, 0);
    $this->addPiece(Piece::Black, Piece::Rook, 7, 0);
    $this->addPiece(Piece::Black, Piece::Knight, 1, 0);
    $this->addPiece(Piece::Black, Piece::Knight, 6, 0);
    $this->addPiece(Piece::Black, Piece::Bishop, 2, 0);
    $this->addPiece(Piece::Black, Piece::Bishop, 5, 0);
		$this->addPiece(Piece::Black, Piece::King, 4, 0);
    $this->addPiece(Piece::Black, Piece::Queen, 3, 0);
	} // setupBoard()
	
	function toString() {
		$horiz = "+----+----+----+----+----+----+----+----+";
		
		for ($y = 0; $y <= 7; $y++) {
			print "$horiz\n|";
			for ($x = 0; $x <= 7; $x++) {
			  $p = $this->board[$x][$y];
				if ($p == null) {
					print  '    |';
				} else {
					print ' ' . $p->toString() . ' |';
				}
			}
			print "\n";
		}
		print "$horiz\n";
	} // toString()
	
	function iob($board, $action, $params) {
		for ($x = 0; $x <= 7; $x++) {
			for ($y = 0; $y <= 7; $y++) {
				$action($board[$x][$y], $x, $y, $params);
			}
		}
	} // iob()
	
	function testMove($board, $x1, $y1, $x2, $y2) {
		$new_board = $this->boardCopy($board);
		
		$p1 = $new_board[$x1][$y1];
		$p1->x = $x2;
		$p1->y = $y2;
		$new_board[$x2][$y2] = $p1;
		$new_board[$x1][$y1] = null;
		
		return $new_board;
	} // testMove()
	
	function boardCopy($board) {
		$new_board = array();
		for ($x = 0; $x <= 7; $x++) {
			$new_board[$x] = array(null,null,null,null,null,null,null,null);
			for ($y = 0; $y <= 7; $y++) {
				$p = $board[$x][$y];
				if ($p != null) {
					$np = $this->createPiece($p->color, $p->type, $p->x, $p->y);
					$new_board[$x][$y] = $np;
				}
			}
		}
		return $new_board;
	} // boardCopy()
	
	function checkThreats($board) {
		$threatBoard = array(
			array(false,false,false,false,false,false,false,false),
			array(false,false,false,false,false,false,false,false),
			array(false,false,false,false,false,false,false,false),
			array(false,false,false,false,false,false,false,false),
			array(false,false,false,false,false,false,false,false),
			array(false,false,false,false,false,false,false,false),
			array(false,false,false,false,false,false,false,false),
			array(false,false,false,false,false,false,false,false)
		);
		
		for ($x = 0; $x <= 7; $x++) {
			for ($y = 0; $y <= 7; $y++) {
				$piece = $board[$x][$y];
				if ($piece != null) {
					$moves = $this->movesFor($x, $y, false, $board);
					for ($i = 0; $i < count($moves->capture); $i++) {
						$m = $moves->capture[$i];
						$t_piece = $board[$m->ex][$m->ey];
						if ($t_piece != null && $t_piece->color != $piece->color) {
							$threatBoard[$m->ex][$m->ey] = true;
						}
					}
				}
			}
		}
		
		return $threatBoard;
		
	} // checkThreats()
	
	function movesFor($x, $y, $checkForCheck = true, $altBoard = false) {
		$nret_val = new stdClass();
		$nret_val->move = array();
		$nret_val->capture = array();

		
		$btu = $altBoard === false ? $this->board : $altBoard;
		
		$cfc = $checkForCheck !== false ? true : false;
		
		$piece = $btu[$x][$y];
		if ($piece != null) {
			$ret_val = $piece->moves($btu);
			
			for ($i = 0; $i < count($ret_val->move); $i++) {
				$m = $ret_val->move[$i];
				if ($m->ex >= 0 && $m->ex <= 7 && $m->ey >= 0 && $m->ey <= 7) {
					if ($btu[$m->ex][$m->ey] == null) {
						array_push($nret_val->move, $m);
					}
				}
			}
			
			for ($i = 0; $i < count($ret_val->capture); $i++) {
				$m = $ret_val->capture[$i];
				if ($m->ex >= 0 && $m->ex <= 7 && $m->ey >= 0 && $m->ey <= 7) {
					$tar_piece = $btu[$m->ex][$m->ey];
					
					if ($tar_piece != null && $tar_piece->color != $piece->color) {
						array_push($nret_val->capture, $m);
					} else if ($piece->type == Piece::Pawn) { // en passant check
						$ym = $piece->color == Piece::White ? 1 : -1;
						$epp = $btu[$m->ex][$m->ey + $ym];
						if ($epp != null && $epp->type == Piece::Pawn && $epp->color != $piece->color && $epp->enPassantAttackable === true) {
						  array_push($nret_val->capture, $m);	
						}
					}
				}
			}
			
			if ($cfc) {
				$king_pos = new stdClass();
				$king_pos->x =  null;
				$king_pos->y =  null;
				$king_found = false;
			
				for ($ix = 0; $ix < 7; $ix++) {
					for ($iy = 0; $iy < 7; $iy++) {
						$p = $btu[$ix][$iy];
						if ($p != null && $p->color == $piece->color && $p->type == Piece::King) {
							$king_found = true;
							$king_pos->x = $ix;
							$king_pos->y = $iy;
						}
					}
				}
				
				if ($king_found) {
					$cur_threats = $this->checkThreats($btu);
					$king_in_check = $cur_threats[$king_pos->x][$king_pos->y];
					
					$tret_val = new stdClass();
					$tret_val->capture =  array();
					$tret_val->move = array();
					
					
					for ($i = 0; $i < count($nret_val->capture); $i++) {
						$m = $nret_val->capture[$i];
						$cx = $king_pos->x;
						$cy = $king_pos->y;
						if ($piece->type == Piece::King) {
							$cx = $m->ex;
							$cy = $m->ey;
						}
						
						$threats = $this->checkThreats($this->testMove($btu, $x, $y, $m->ex, $m->ey));
						if ($threats[$cx][$cy] != true) {
							array_push($tret_val->capture, $m);
						}
					}
					
					for ($i = 0; $i < count($nret_val->move); $i++) {
						$m = $nret_val->move[$i];
						$cx = $king_pos->x;
						$cy = $king_pos->y;
						if ($piece->type == Piece::King) {
							$cx = $m->ex;
							$cy = $m->ey;
						}
						$threats = $this->checkThreats($this->testMove($btu, $x, $y, $m->ex, $m->ey));
						if ($threats[$cx][$cy] != true) {
							array_push($tret_val->move, $m);
						}
					}
					
					
					$nret_val = $tret_val;
				
				} else {
					// No King!?
				}
			}
		}
		return $nret_val;
	} // movesFor()
} // Chess

?>