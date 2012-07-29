<?php

class Move {
	var $sx;
	var $sy;
	var $ex;
	var $ey;
	
	static function CreatePosition($x, $y) {
		$p = new stdClass();
		$p->x = $x;
		$p->y = $y;
		return $p;
	} // static CreatePosition()
	
	function __construct($x1, $y1, $x2, $y2) {
		$this->sx = $x1;
		$this->sy = $y1;
		$this->ex = $x2;
		$this->ey = $y2;
	} // __construct()
	
	static function orthMoves($sx, $sy, $board) {
		$piece = $board[$sx][$sy];
		if ($piece == null) { return array(); }
		$m1 = Move::clearedSequence($piece, Move::moveSequence($sx, $sy, -1, 0), $board);
		$m2 = Move::clearedSequence($piece, Move::moveSequence($sx, $sy, 1, 0), $board);
		$m3 = Move::clearedSequence($piece, Move::moveSequence($sx, $sy, 0, -1), $board);
		$m4 = Move::clearedSequence($piece, Move::moveSequence($sx, $sy, 0, 1), $board);
		return array_merge($m1, $m2, $m3, $m4);
	} // orthMoves()
	
	static function diagMoves($sx, $sy, $board) {
		$piece = $board[$sx][$sy];
		if ($piece == null) { return array(); }
		$m1 = Move::clearedSequence($piece, Move::moveSequence($sx, $sy, -1, -1), $board);
		$m2 = Move::clearedSequence($piece, Move::moveSequence($sx, $sy, -1, 1), $board);
		$m3 = Move::clearedSequence($piece, Move::moveSequence($sx, $sy, 1, -1), $board);
		$m4 = Move::clearedSequence($piece, Move::moveSequence($sx, $sy, 1, 1), $board);
		return array_merge($m1, $m2, $m3, $m4); 
	} // diagMoves()
	
	static function univMoves($sx, $sy, $board) {
		$piece = $board[$sx][$sy];
		if ($piece == null) { return array(); }
		$m1 = Move::diagMoves($sx, $sy, $board);
		$m2 = Move::orthMoves($sx, $sy, $board);
		return array_merge($m1, $m2);
	} // univMoves()
	
	static function moveSequence($sx, $sy, $dx, $dy) {
		$moves = array();
		$init_x = $sx;
		$init_y = $sy;
		
		for ($i = 1; $i < 8; $i++) {
			$sx += $dx;
			$sy += $dy;
			if ($sx >= 0 && $sx <= 7 && $sy >= 0 && $sy <= 7) {
				array_push($moves, new Move($init_x, $init_y, $sx, $sy));
			}
		}
		return $moves;
	} // moveSequence()
	
	static function clearedSequence($piece, $moves, $board) {
		$ok = array();
		for ($i = 0; $i < count($moves); $i++) {
			$m = $moves[$i];
			$occ = $board[$m->ex][$m->ey];
			if ($occ == null) {
				array_push($ok, $m); 
			} else {
				if ($occ->color != $piece->color) {
					array_push($ok, $m);
				}
				return $ok;
			}
		}
		
		return $ok;
	} // clearedSequence()
	
	function distance() {
		return sqrt(pow(abs($this->sx - $this->ex), 2) + pow(abs($this->sy - $this->ey), 2));
	} // distance()
	
	function toString($array_index = false) {
		$files = array('A','B','C','D','E','F','G','H');
		
		if ($array_index) {
			return $this->sx . ', ' . $this->sy . ' -> ' . $this->ex . ', ' . $this->ey;
		} else {
			return $files[$this->sx] . (8 - $this->sy) . ' -> ' . $files[$this->ex] . (8 - $this->ey);
		}
	} // toString()
	
} // Move


class Piece {
	const Pawn = 1;
	const Rook = 2;
	const Knight = 3;
	const Bishop = 4;
	const Queen = 5;
	const King = 6;
	
	const White = 100;
	const Black = 101;
	
	const Any = 9999;
	
	
	var $color;
	var $type;
	var $x;
	var $y;
	var $unmoved = true;
	var $init_x;
	var $init_y;
	
	function __construct($color, $type, $x, $y) {
		$SRep = array(
			Piece::Pawn => 'p',
			Piece::Rook => 'R',
			Piece::Knight => 'N',
			Piece::Bishop => 'B',
			Piece::Queen => 'Q',
			Piece::King => 'K'
		);
		
		$LRep = array(
			Piece::Pawn => 'pawn',
			Piece::Rook => 'rook',
			Piece::Knight => 'knight',
			Piece::Bishop => 'bishop',
			Piece::Queen => 'queen',
			Piece::King => 'king'
		);
		
		$this->color = strtolower($color) == 'white' || $color == Piece::White ? Piece::White : Piece::Black;
		$this->type = $type;
		$this->rep = $SRep[$type];
		$this->lrep = $LRep[$type];
		$this->x = $x;
		$this->y = $y;
		$this->init_x = $x;
		$this->init_y = $y;
		$this->unmoved = true;
	} // __construct()
	
	function move($x, $y) {
		$this->x = $x;
		$this->y = $y;
		$this->unmoved = false;
	} // move()
	
	function moves($board) {
		$mvs = new stdClass();
		$mvs->move = array();
		$mvs->capture = array();
		
		return $mvs;
	} // moves()
	
	function position($array_index = false) {
		$files = array('A','B','C','D','E','F','G','H');
		
		if ($array_index) {
			return $this->x . ', ' . $this->y;
		} else {
			return $files[$this->x] . (8 - $this->y);
		}
	} // position()
	
	function pos($pos) {
		$files = array('A','B','C','D','E','F','G','H');
		return $files[$pos->x] . (8 - $pos->y);
	} // pos()
	
	function toString($fmt = 'short') {
		if ($fmt == 'long') {
		  return ($this->color == Piece::White ? 'white' : 'black') . ' ' . $this->lrep . ' @ ' . $this->position();
		} else {
			return ($this->color == Piece::White ? 'W' : 'B') . $this->rep;
		}
	}
} // Piece

class Pawn extends Piece {
	var $enPassantAttackable = false;
	
	function __construct($color, $x, $y, $epa = false) {
		parent::__construct($color, Piece::Pawn, $x, $y);
		$this->enPassantAttackable = $epa;
	} // __construct()
	
	function move($x, $y) {
		if (abs($y - $this->y) == 2) {
			$this->enPassantAttackable = true;
		} else {
			$this->enPassantAttackable = false;
		}
		
		parent::move($x, $y);
	} // move()
	
	function moves($board) {
		
		$valid = new stdClass();
		$valid->move = array();
		$valid->capture = array();
		
		if ($this->color == Piece::White) {
			array_push($valid->move, new Move($this->x, $this->y, $this->x, $this->y - 1));
			if ($this->unmoved) { array_push($valid->move, new Move($this->x, $this->y, $this->x, $this->y - 2)); }
		} else {
			array_push($valid->move, new Move($this->x, $this->y, $this->x, $this->y + 1));
			if ($this->unmoved) { array_push($valid->move, new Move($this->x, $this->y, $this->x, $this->y + 2)); }
		}

		return $valid;
	} // moves()
	
	function openToEnPassant($state) {
		$s = $state == true ? true : false;
		$this->enPassantAttackable = $s;
	}
} // Pawn

class Rook extends Piece {
	function __construct($color, $x, $y) {
		parent::__construct($color, Piece::Rook, $x, $y);
	} // __construct()
	
	function moves($board) {
		$valid = new stdClass();
		
		$valid->move = Move::orthMoves($this->x, $this->y, $board);
		$valid->capture = Move::orthMoves($this->x, $this->y, $board);
		
		return $valid;
	} // moves()
} // Rook

class Bishop extends Piece {
	function __construct($color, $x, $y) {
		parent::__construct($color, Piece::Bishop, $x, $y);
	} // __construct()
	
	function moves($board) {
		$valid = new stdClass();
		
		$valid->move = Move::diagMoves($this->x, $this->y, $board);
		$valid->capture = Move::diagMoves($this->x, $this->y, $board);
		
		return $valid;
	} // moves()
} // Bishop

class Knight extends Piece {
	function __construct($color, $x, $y) {
		parent::__construct($color, Piece::Knight, $x, $y);
	} // __construct()
	
	function moves($board) {
		$valid = new stdClass();
		$valid->move = array();
		$valid->capture = array();
		
		array_push($valid->move, new Move($this->x, $this->y, $this->x+1,$this->y+2));
		array_push($valid->move, new Move($this->x, $this->y, $this->x+1,$this->y-2));
		array_push($valid->move, new Move($this->x, $this->y, $this->x-1,$this->y+2));
		array_push($valid->move, new Move($this->x, $this->y, $this->x-1,$this->y-2));
		array_push($valid->move, new Move($this->x, $this->y, $this->x+2,$this->y+1));
		array_push($valid->move, new Move($this->x, $this->y, $this->x+2,$this->y-1));
		array_push($valid->move, new Move($this->x, $this->y, $this->x-2,$this->y+1));
		array_push($valid->move, new Move($this->x, $this->y, $this->x-2,$this->y-1));
		
		array_push($valid->capture, new Move($this->x, $this->y, $this->x+1,$this->y+2));
		array_push($valid->capture, new Move($this->x, $this->y, $this->x+1,$this->y-2));
		array_push($valid->capture, new Move($this->x, $this->y, $this->x-1,$this->y+2));
		array_push($valid->capture, new Move($this->x, $this->y, $this->x-1,$this->y-2));
		array_push($valid->capture, new Move($this->x, $this->y, $this->x+2,$this->y+1));
		array_push($valid->capture, new Move($this->x, $this->y, $this->x+2,$this->y-1));
		array_push($valid->capture, new Move($this->x, $this->y, $this->x-2,$this->y+1));
		array_push($valid->capture, new Move($this->x, $this->y, $this->x-2,$this->y-1));
		
		return $valid;
	} // moves()
} // Knight

class Queen extends Piece {
	function __construct($color, $x, $y) {
		parent::__construct($color, Piece::Queen, $x, $y);
	} // __construct()
	
	function moves($board) {
		$valid = new stdClass();
		
		$valid->move = Move::univMoves($this->x, $this->y, $board);
		$valid->capture = Move::univMoves($this->x, $this->y, $board);
		
		return $valid;
	} // moves()
} // Queen

class King extends Piece {
	function __construct($color, $x, $y) {
		parent::__construct($color, Piece::King, $x, $y);
	} // __construct()
	
	function moves($board) {
		$valid = new stdClass();
		$valid->move = array();
		$valid->capture = array();
		
		array_push($valid->move, new Move($this->x, $this->y, $this->x+1,$this->y));
		array_push($valid->move, new Move($this->x, $this->y, $this->x+1,$this->y));
		array_push($valid->move, new Move($this->x, $this->y, $this->x,$this->y+1));
		array_push($valid->move, new Move($this->x, $this->y, $this->x,$this->y-1));
		array_push($valid->move, new Move($this->x, $this->y, $this->x+1,$this->y+1));
		array_push($valid->move, new Move($this->x, $this->y, $this->x+1,$this->y-1));
		array_push($valid->move, new Move($this->x, $this->y, $this->x-1,$this->y+1));
		array_push($valid->move, new Move($this->x, $this->y, $this->x-1,$this->y-1));
		
		array_push($valid->capture, new Move($this->x, $this->y, $this->x+1,$this->y));
		array_push($valid->capture, new Move($this->x, $this->y, $this->x+1,$this->y));
		array_push($valid->capture, new Move($this->x, $this->y, $this->x,$this->y+1));
		array_push($valid->capture, new Move($this->x, $this->y, $this->x,$this->y-1));
		array_push($valid->capture, new Move($this->x, $this->y, $this->x+1,$this->y+1));
		array_push($valid->capture, new Move($this->x, $this->y, $this->x+1,$this->y-1));
		array_push($valid->capture, new Move($this->x, $this->y, $this->x-1,$this->y+1));
		array_push($valid->capture, new Move($this->x, $this->y, $this->x-1,$this->y-1));
		
		return $valid;
	} // moves()
} // King

?>