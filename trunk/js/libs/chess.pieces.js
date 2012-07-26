var Piece = Class.extend({
  _rep: {
		'pawn': '',
		'rook': 'R',
		'knight': 'N',
		'bishop': 'B',
		'queen': 'Q',
		'king': 'K'
	},
	constructor: function(c, t, xp, yp) {
		this.color = c;
		this.type = t.toLowerCase();
		this.x = xp;
		this.y = yp;
		this.init_x = xp;
		this.init_y = yp;
		this.unmoved = true;
		this.rep = this._rep[this.type];
	},
	moveIsValid: function(x, y, moves) {
		for (var i = 0; i < moves.length; i++) {
			var m = moves[i];
			if (m[0] == x && m[1] == y) {
				return true;
			}
		}
		return false;
	},
	canMoveTo: function(x, y, board) {
		var all_moves = this.moves(board);
		return this.moveIsValid(all_moves.move)
	},
	canAttack: function(x, y, board) {
		var all_moves = this.moves(board);
		return this.moveIsValid(all_moves.capture)
	},
	toString: function() {
		return this.color + ' ' + this.type + ' @ ' + this.position() + ' / ' + this.x + ', ' + this.y;
	},
	position: function(pos) {
		var ptu = typeof pos == 'undefined' ? {x: this.x, y: this.y} : pos;
		var ranks = [8,7,6,5,4,3,2,1];
		var files = ['a','b','c','d','e','f','g','h'];
		
		return files[ptu.x] + ranks[ptu.y];
	}
}); //piece

var PawnPiece = Piece.extend({
	constructor: function (c, t, xp, yp) {
		PawnPiece.super.constructor.call(this, c, t, xp, yp);
		this.enPassantAttackable = false;
	},
	moves: function(board) {
		var valid = {
			move: [],
			capture: []
		};
		var p = this;
		var p_id = p.rep;

		if (p.color == 'white') {
			valid.move.push([p.x, p.y-1]);
			if (p.unmoved && board[p.x][p.y-1] == null) { valid.move.push([p.x, p.y-2]); }
			valid.capture.push([p.x-1, p.y-1]);
			valid.capture.push([p.x+1, p.y-1]);
		} else {
			valid.move.push([p.x, p.y+1]);
			if (p.unmoved && board[p.x][p.y+1] == null) { valid.move.push([p.x, p.y+2]); }
			valid.capture.push([p.x-1, p.y+1]);
			valid.capture.push([p.x+1, p.y+1]);
		}
		
		return valid;
	},
	openToEnPassant: function(state) {
		var s = state == true ? true : false;
		this.enPassantAttackable = s;
	}
}); // PawnPiece

var RookPiece = Piece.extend({
	constructor: function (c, t, xp, yp) {
		RookPiece.super.constructor.call(this, c, t, xp, yp);
	},
	moves: function(board) {
		var p = this;
		
		var valid = {
			move: Moves.orthMoves(p.x, p.y, board),
			capture: Moves.orthMoves(p.x, p.y, board),
		}
		
		return valid;
	} // moves()
}); // RookPiece

var KnightPiece = Piece.extend({
	constructor: function (c, t, xp, yp) {
		KnightPiece.super.constructor.call(this, c, t, xp, yp);
	},
	moves: function(board) {
		var valid = {
			move: [],
			capture: []
		};
		var p = this;
		var p_id = p.rep;

		valid.move.push([p.x+1,p.y+2]);
		valid.move.push([p.x+1,p.y-2]);
		valid.move.push([p.x-1,p.y+2]);
		valid.move.push([p.x-1,p.y-2]);
		valid.move.push([p.x+2,p.y+1]);
		valid.move.push([p.x+2,p.y-1]);
		valid.move.push([p.x-2,p.y+1]);
		valid.move.push([p.x-2,p.y-1]);
		
		valid.capture.push([p.x+1,p.y+2]);
		valid.capture.push([p.x+1,p.y-2]);
		valid.capture.push([p.x-1,p.y+2]);
		valid.capture.push([p.x-1,p.y-2]);
		valid.capture.push([p.x+2,p.y+1]);
		valid.capture.push([p.x+2,p.y-1]);
		valid.capture.push([p.x-2,p.y+1]);
		valid.capture.push([p.x-2,p.y-1]);
		
		return valid;
	} // moves()
}); // KnightPiece

var BishopPiece = Piece.extend({
	constructor: function (c, t, xp, yp) {
		BishopPiece.super.constructor.call(this, c, t, xp, yp);
	},
	moves: function(board) {
		var p = this;
		
		var valid = {
			move: Moves.diagMoves(p.x, p.y, board),
			capture: Moves.diagMoves(p.x, p.y, board),
		}
		
		return valid;
	} // moves()
}); // BishopPiece

var KingPiece = Piece.extend({
	constructor: function (c, t, xp, yp) {
		KingPiece.super.constructor.call(this, c, t, xp, yp);
	},
	canQueenSideCastle: function(board) {
		var x = 2
		var y  = (this.color == 'white') ? 7 : 0;
		
		if (!this.unmoved) {
			return false;
		}
		
		var castle = board[0][y];
		
		var ret_val = false;
		
		if (castle != null) {
			if (castle.type == 'rook' && castle.color == this.color && castle.unmoved) {
				var knight_piece = board[1][y];
				var bishop_piece = board[2][y];
				var queen_piece = board[3][y];
				if (knight_piece == null && bishop_piece == null && queen_piece == null) {
					ret_val = [x, y];
				}
			}
		}
		
		return ret_val;
	},
	canKingSideCastle: function(board) {
		var x = 6
		var y  = (this.color == 'white') ? 7 : 0;
		
		if (!this.unmoved) {
			return false;
		}
		
		var castle = board[0][y];
		
		var ret_val = false;
		
		if (castle != null) {
			if (castle.type == 'rook' && castle.color == this.color && castle.unmoved) {
				var knight_piece = board[5][y];
				var bishop_piece = board[6][y];
				if (knight_piece == null && bishop_piece == null) {
					ret_val = [x, y];
				}
			}
		}
		
		return ret_val;
	},
	moves: function(board) {
		var valid = {
			move: [],
			capture: []
		};
		var p = this;
		var p_id = p.rep;

		valid.move.push([p.x+1,p.y]);
		valid.move.push([p.x-1,p.y]);
		valid.move.push([p.x,p.y+1]);
		valid.move.push([p.x,p.y-1]);
		valid.move.push([p.x+1,p.y+1]);
		valid.move.push([p.x+1,p.y-1]);
		valid.move.push([p.x-1,p.y+1]);
		valid.move.push([p.x-1,p.y-1]);
		
		valid.capture.push([p.x+1,p.y]);
		valid.capture.push([p.x-1,p.y]);
		valid.capture.push([p.x,p.y+1]);
		valid.capture.push([p.x,p.y-1]);
		valid.capture.push([p.x+1,p.y+1]);
		valid.capture.push([p.x+1,p.y-1]);
		valid.capture.push([p.x-1,p.y+1]);
		valid.capture.push([p.x-1,p.y-1]);
		
		var ksc = this.canKingSideCastle(board);
		if (ksc !== false) {
			valid.move.push(ksc);
		} 
		
		var qsc = this.canQueenSideCastle(board);
		if (qsc !== false) {
			valid.move.push(qsc);
		} 
		
		return valid;
	} // moves()
}); // KingPiece

var QueenPiece = Piece.extend({
	constructor: function (c, t, xp, yp) {
		QueenPiece.super.constructor.call(this, c, t, xp, yp);
	},
	moves: function(board) {
		var p = this;
		
		var valid = {
			move: Moves.univMoves(p.x, p.y, board),
			capture: Moves.univMoves(p.x, p.y, board),
		}
		
		return valid;
	} // moves()
}); // QueenPiece