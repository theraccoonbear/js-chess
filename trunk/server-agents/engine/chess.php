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
	var $active = 1;
	var $history = array();
	var $enPassantTarget = null;
	var $gameLog = array();
	var $moveRequestedAt = 0;
	var $moveCount = 0;
	var $movesSinceCapture = 0;
	var $gameActive = false;
	var $result = null;
	var $cache = array();
	var $whiteThreatens = array();
	var $blackThreatens = array();
	
	function __construct($player1, $player2, $options = array()) {
		$this->opts = $options + $this->opts;
		$this->player1 = $player1;
		$this->player2 = $player2;
		$this->init();
	} // __construct()
	
	function logMove($x1, $y1, $x2, $y2, $notation, $elapsed, $turn) {
		$l_obj = new stdClass();
		$l_obj->move = new Move($x1, $y1, $x2, $y2);
		$l_obj->notation = $notation;
		$l_obj->elapsed = $elapsed;
		$l_obj->turn = $turn;
		
		array_push($this->gameLog, $l_obj);
	} // logMove();
	
	function init() {
		$this->enPassantTarget = null;
		$this->moveRequestedAt = 0;
		$this->history = array();
		$this->gameLog = array();
		$this->moveCount = 0;
		$this->movesSinceCapture = 0;
		$this->active = 1;
		$this->gameActive = false;
		$this->cache = array();
		
		$this->setupBoard();
		
		$this->whiteThreatens = $this->fullThreatBoard($this->board, Piece::White);
		$this->blackThreatens = $this->fullThreatBoard($this->board, Piece::Black);
	} // init()
	
	function start() {
		$this->gameActive = true;
		while ($this->gameActive) {
			$this->nextMove();
			//print "\n-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\n\n";
			//print $this->toString();
		}
		
		print "\n-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\n\n";
		print $this->toString();
		
		return $this->result;
	} // start();
	
	function gameOver($res) {
		$this->result = $res;
		$this->gameActive = false;
	} // gameOver();
	
	function nextMove() {
		$move = null;
		
		$this->moveRequestedAt = microtime();
		if ($this->active == 1) {
			$move = $this->player1->getMove($this);
		} else {
			$move = $this->player2->getMove($this);
		}
		
		if ($move == 'resign') {
			$this->gameOver($this->active == 1 ? Piece::Black : Piece::White);
			return;
		}
		
		$this->move($move);
		
		$mv_idx = count($this->gameLog) - 1;
		if ($mv_idx >= 0) {
			$last_log = $this->gameLog[$mv_idx];
			print ($this->active == 1 ? 'White ' : 'Black ') .$last_log->notation . "\n";
		}
		
		$this->active = $this->active == 1 ? 2 : 1;
	} // nextMove();
	
	function createPiece($c, $t, $x, $y, $options = array()) {
		$newPiece = null;
		
		switch ($t) {
			case Piece::Pawn:
				$epa = isset($options['epa']) && $options['epa'] === true ? true : false;
				$newPiece = new Pawn($c, $x, $y, $epa);
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
	
	function createScenario($board) {
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
			for ($y = 0; $y <= 7; $y++) {
				$p = $board[$x][$y];
				if ($p != null) {
					$p = strtolower($p);
					$color = substr($p, 0, 1) == 'w' ? Piece::White : Piece::Black;
					$type_rep = substr($p, 1, 1);
					$type = Piece::Pawn;
					switch ($type_rep) {
						case 'q':
							$type = Piece::Queen;
							break;
						case 'k':
							$type = Piece::King;
							break;
						case 'r':
							$type = Piece::Rook;
							break;
						case 'b':
							$type = Piece::Bishop;
							break;
						case 'n':
							$type = Piece::Knight;
							break;
						default:
							$type = Piece::Pawn;
							break;
					}
					
					$this->addPiece($color, $type, $y, $x);
				}
			}
		}
	} // createScenario()
	
	function cacheValue($name, $value) {
		$this->cache[$name] = $value;
	} // cacheValue()
	
	function getCachedValue($name) {
		if (isset($this->cache[$name])) {
			return $this->cache[$name];
		} else {
			return false;
		}
	} // getCachedValue()
	
	function expireCache($name) {
		unset($this->cache[$name]);
	} // unset()
	
	function toString($btu = false) {
		$btu = $btu === false ? $this->board : $btu;
		
		$brd_cache = false; //$this->getCachedValue('board-string');
		if ($brd_cache === false) {
			$horiz = "---+----+----+----+----+----+----+----+----+";
			$brd_cache = '';
			$brd_cache .= "   |  A |  B |  C |  D |  E |  F |  G |  H |";
			$brd_cache .= '  ';
			$brd_cache .= "   |  A |  B |  C |  D |  E |  F |  G |  H |\n";
			$threats = $this->checkThreats($btu);
			
			
			
			for ($y = 0; $y <= 7; $y++) {
				$rvs = array('','');
				
				$brd_cache .= "$horiz";
				$brd_cache .= "  $horiz\n";
				
				$rvs[0] .= ' '  . (8 - $y) . " |";
				
				$rvs[1] .= ' ' . (8 - $y) . " |";
				
				for ($x = 0; $x <= 7; $x++) {
					$p = $btu[$x][$y];
					if ($p == null) {
						$rvs[0] .= '    |';
					} else {
						$rvs[0].= ' ' . $p->toString() . ' |';
					}
					
					$th = $threats[$x][$y];
					if ($th == false) {
						$rvs[1] .= '    |';
					} else {
						$rvs[1] .= '  X |';
					}
					
				}
				
				$brd_cache .= join('  ', $rvs);
				
				$brd_cache .= "\n";
			}
			
			
			$brd_cache .= "$horiz  $horiz";
			$brd_cache .= "\n";
			$this->cacheValue('board-string', $brd_cache);
		}
			
		print $brd_cache;
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
		//$p1->x = $x2;
		//$p1->y = $y2;
		//$p1->unmoved = false;
		$p1->move($x2, $y2);
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
					
					//$epa = $p->type == Piece::Pawn ? $p->enPassantAttackable : false;
					
					$np = $p->clonePiece(); //$this->createPiece($p->color, $p->type, $p->x, $p->y);
					
					//if ($p->type == Piece::Pawn) {
					//	$np->openToEnPassant($p->enPassantAttackable);
					//}
					//$np->unmoved = $p->unmoved;
					
					$new_board[$x][$y] = $np;
				}
			}
		}
		return $new_board;
	} // boardCopy()
	
	function fullThreatBoard($board = false, $who_threatens = Piece::White) {
		$board = $board === false ? $this->board : $board;
		$who_threatens = $who_threatens === Piece::White ? Piece::White : Piece::Black;
		
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
				if ($piece != null && $piece->color == $who_threatens) {
					$moves = $this->movesFor($x, $y, false, $board);
					for ($i = 0; $i < count($moves->capture); $i++) {
						$m = $moves->capture[$i];
						$threatBoard[$m->ex][$m->ey] = true;
					}
				}
			}
		}
		
		return $threatBoard;
	} // fullThreatBoard()
	
	function checkThreats($board = false) {
		
		$board = $board === false ? $this->board : $board;
		
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
				if ($m->validBounds()) {
					if ($btu[$m->ex][$m->ey] == null) {
						array_push($nret_val->move, $m);
					}
				}
			}
			
			for ($i = 0; $i < count($ret_val->capture); $i++) {
				$m = $ret_val->capture[$i];
				if ($m->validBounds()) {
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
				
				$king = $this->find($piece->color, Piece::King);
				
				if (count($king) > 0) {
					$king = $king[0];
					$king_found = true;
					$king_pos->x = $king->x;
					$king_pos->y = $king->y;
				}
				
				if ($king_found) {
					$cur_threats = $this->checkThreats($btu);
					$king_in_check = $cur_threats[$king_pos->x][$king_pos->y];
					
					$tret_val = new stdClass();
					$tret_val->capture =  array();
					$tret_val->move = array();
					
					
					for ($i = 0; $i < count($nret_val->capture); $i++) {
						$m = $nret_val->capture[$i];
						$cx = $king->x;
						$cy = $king->y;
						if ($piece->type == Piece::King) {
							$cx = $m->ex;
							$cy = $m->ey;
						}
						$new_board = $this->testMove($btu, $x, $y, $m->ex, $m->ey);
						$threats = $this->checkThreats($new_board);
						if ($threats[$cx][$cy] != true) {
							array_push($tret_val->capture, $m);
						}
					}
					
					for ($i = 0; $i < count($nret_val->move); $i++) {
						$m = $nret_val->move[$i];
						
						$cx = $king->x;
						$cy = $king->y;
						if ($piece->type == Piece::King) {
							$cx = $m->ex;
							$cy = $m->ey;
						}
						
						$new_board = $this->testMove($btu, $x, $y, $m->ex, $m->ey);
						
						$threats = $this->checkThreats($new_board);
						//if ($m->ex == 2 && ($m->ey == 1 || $m->ey == 2)) {
						//	print $this->toString($new_board);
						//	print_r($this->fullThreatBoard($new_board, $piece->color == Piece::White ? Piece::Black : Piece::White));
						//	exit(0);
						//	//print $m->toString() . "\n";
						//	//print_r($this->fullThreatBoard($new_board, $piece->color == Piece::White ? Piece::Black : Piece::White));
						//	//print $piece->toString('long') . ' ::: ' . $m->toString() . " ::: dest = $cx, $cy\n";
						//	//print ($threats[$cx][$cy] == true ? 'TRUE' : 'FALSE') . "\n";
						//}
						if ($threats[$cx][$cy] != true) {
							//print_r($m);
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
	
	function clearEnPassantTarget() {
		if ($this->enPassantTarget != null) {
			$this->enPassantTarget->openToEnPassant(false);
		}
		$this->enPassantTarget = null;
	} // clearEnPassantTarget()
	
	function setEnPassantTarget($piece) {
		$piece->openToEnPassant(true);
		$this->enPassantTarget = $piece;
	} // setEnPassantTarget()
	
	function boardChanged() {
		$this->expireCache('board-cache');
		$this->expireCache('threat-cache');
		$this->whiteThreatens = $this->fullThreatBoard($this->board, Piece::White);
		$this->blackThreatens = $this->fullThreatBoard($this->board, Piece::Black);
	} // boardChanged();
	
	private function move($m_obj) {
		$x1 = $m_obj->sx;
		$y1 = $m_obj->sy;
		$x2 = $m_obj->ex;
		$y2 = $m_obj->ey;
		
		//print_r($m_obj);
		
		$p_obj = $this->board[$x1][$y1];
		$d_obj = $this->board[$x2][$y2];
		
		
		
		if ($p_obj == null) {
			return false;
		}
		
		$elapsed = microtime() - $this->moveRequestedAt;
		
		$turn = $p_obj->color;
		
		$notation = '' . $p_obj->rep . $p_obj->position();
		
		if ($d_obj == null) {
			
			if ($p_obj->type == Piece::Pawn &&  $x1 != $x2) {
				
				$cpx = $x2;
				$cpy = ($p_obj->color == Piece::White) ? $y2 + 1 : $y2 - 1;
				$d_obj = $this->board[$cpx][$cpy];
				if ($d_obj->type == Piece::Pawn && $d_obj->enPassantAttackable) {
					$notation .= 'x' . $d_obj->position() + '(ep)';
					$this->movesSinceCapture++;
					$this->board[$cpx][$cpy] = null;
				}
			} else {
				$t_pos = Move::createPosition($x2, $y2);
				$notation .= '-' . $p_obj->pos($t_pos);
				$this->movesSinceCapture++;
			}
		} else {
			$notation .= 'x' . $d_obj->position();
			$this->movesSinceCapture = 0;
		}
		
		array_push($this->history, $this->boardCopy($this->board));
		
		$this->board[$x1][$y1] = null;
		$p_obj->x = $x2;
		$p_obj->y = $y2;
		$p_obj->unmoved = false;
		$this->board[$x2][$y2] = $p_obj;
		$this->moves++;
		
		$this->clearEnPassantTarget();
		
		if ($p_obj->type == Piece::Pawn) {
			if (($p_obj->color == Piece::Black && $p_obj->y == 7) || ($p_obj->color == Piece::White && $p_obj->y == 0)) {
				$this->addPiece($p_obj->color, Piece::Queen, $p_obj->x, $p_obj->y);
			} else if (($p_obj->color == Piece::Black && $y2 == 3) || ($p_obj->color == Piece::White && $y2 == 4)) {
				$this->setEnPassantTarget($p_obj);
			}
		} else if ($p_obj->type == Piece::King && abs($x1 - $x2) == 2) {
			$y = $p_obj->color == Piece::White ? 7 : 0;
			
			$rsx = null;
			$rex = null;
			
			if ($x1 > $x2) { // queen side
				$rsx = 0;
				$rex = 3;
				$notation = 'O-O-O';
			} else {
				$rsx = 7;
				$rex = 5;
				$notation = 'O-O';
			}
			
			$rook = $this->board[rsx][y];
			$rook->x = $rex;
			$rook->y = $y;
			$this->board[$rsx][$y] = null;
			$this->board[$rex][$y] = $rook;
		}
		
		$this->logMove($x1, $y1, $x2, $y2, $notation, $elapsed, $turn);
		
		$this->moveCount = $d_obj != null ? 0 : $this->moveCount + 1;
		
		$this->boardChanged();
		
		$threat_board = $this->checkThreats();
		
		if ($this->movesSinceCapture > 100) {
			$this->gameOver('draw');
		} else if ($d_obj != null && $d_obj->type == Piece::King) { 
			$winner = $d_obj->color == Piece::White ? Piece::Black : Piece::White;
			$this->gameOver($winner);
		} else {
			$w_king = $this->find(Piece::White, Piece::King);
			$b_king = $this->find(Piece::Black, Piece::King);
			
			$w_king = $w_king[0];
			$b_king = $b_king[0];
			
			$w_king_moves = $this->movesFor($w_king->x, $w_king->y);
			$b_king_moves = $this->movesFor($b_king->x, $b_king->y);
			
			if ($threat_board[$w_king->x][$w_king->y] == true && count($w_king_moves->move) < 1 && count($w_king_moves->capture) < 1) {
				print "Checkmate White!\n";
				$this->gameOver(Piece::Black);
			} else if ($threat_board[$b_king->x][$b_king->y] == true && count($b_king_moves->move) < 1 && count($b_king_moves->capture) < 1) {
				print "Checkmate Black!\n";
				$this->gameOver(Piece::White);
			}
			
		}
		
		return $d_obj;
	} // move()
	
	function find($color = Piece::Any, $type = Piece::Any, $altBoard = false) {
		$btu = $altBoard === false ? $this->board : $altBoard;
		
		$matches = array();
		
		for ($x = 0; $x <= 7; $x++) {
			for ($y = 0; $y <= 7; $y++) {
				$p = $btu[$x][$y];
				if ($p != null) {
					$include = true;
					
					
					if ($color != Piece::Any) {
						$include = $include && $p->color == $color;
					}
					
					if ($type != Piece::Any) {
						$include = $include && $p->type == $type;
					}
					
					if ($include) {
						array_push($matches, $p);
					}
				}
			}
		}
		
		return $matches;		
	} // find()
	
	function findFirst($color = Piece::Any, $type = Piece::Any, $altBoard = false) {
		$ret_val = $this->find($color, $type, $altBoard);
		if (count($ret_val) > 0) {
			return $ret_val[0];
		} else {
			return null;
		}
	} // findFirst()
} // Chess

?>