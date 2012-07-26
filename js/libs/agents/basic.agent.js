var BasicAgent = Class.extend({
	atRandom: function(ar) {
		var idx = Math.floor(Math.random() * ar.length);
		return ar[idx];
	},
	shortest: function(ar) {
	  var sm = null;
		var sm_dist = 100;
		for (var i = 0; i < ar.length; i++) {
			var m = ar[i];
			var dist = 10;
			var dx = Math.abs(m.sx - m.ex);
			var dy = Math.abs(m.sy - m.ey);
			
			if (dx == 0) {
				dist = dy;
			} else if (dy == 0) {
				dist = dx;
			} else {
				dist = Math.sqrt(Math.pow(dx, 2) + Math.sqrt(dy, 2));
			}
				
			if (dist < sm_dist) {
				sm_dist = dist;
				sm = m;
			}
		}
		
		return sm;
	},
	furthestFromBefore: function(ar, x, y) {
		var sm = null;
		var sm_dist = 0;
		for (var i = 0; i < ar.length; i++) {
			var m = ar[i];
			var dist = 10;
			var dx = Math.abs(m.sx - x);
			var dy = Math.abs(m.sy - y);
			
			if (dx == 0) {
				dist = dy;
			} else if (dy == 0) {
				dist = dx;
			} else {
				dist = Math.sqrt(Math.pow(dx, 2) + Math.sqrt(dy, 2));
			}
				
			if (dist > sm_dist) {
				sm_dist = dist;
				sm = m;
			}
		}
		
		return sm;
		
	},
	closestToAfter: function(ar, x, y) {
		var sm = null;
		var sm_dist = 100;
		for (var i = 0; i < ar.length; i++) {
			var m = ar[i];
			var dist = 10;
			var dx = Math.abs(m.ex - x);
			var dy = Math.abs(m.ey - y);
			
			if (dx == 0) {
				dist = dy;
			} else if (dy == 0) {
				dist = dx;
			} else {
				dist = Math.sqrt(Math.pow(dx, 2) + Math.sqrt(dy, 2));
			}
				
			if (dist < sm_dist) {
				sm_dist = dist;
				sm = m;
			}
		}
		
		return sm;
	},
	dbg: function(msg) {
		if (console) { console.log(msg); }
	},
	inCheck: function(yes) {
		this.check = typeof yes === false ? false : true;
	},
	constructor: function(color) {
	  this.color = color.toLowerCase() == 'white' ? 'white' : 'black';
		this.agentName = "BasicAgent";
	},
	getMyPieces: function(game) {
		game = (typeof game === undefined) ? this.game : game;
		
		return this.getPieces(game, this.color);
	},
	getOpponentPieces: function(game) {
		game = (typeof game === undefined) ? this.game : game;
		
		return this.getPieces(game, this.color == 'white' ? 'black' : 'white');
	},
	getPieces: function(game, color) {
		game = (typeof game === undefined) ? this.game : game;
		
		var ctxt = this;
		var pieces = [];
		
		game.iob(game.board, function(p, x, y) {
			if (p != null && p.color == color) {
				pieces.push(p);
			}
		});
		return pieces;
	},
	getMoves: function(game, color) {
		game = (typeof game === undefined) ? this.game : game;
		
		var pieces = this.getPieces(game, color);
		var moves = [];
		for (var i = 0; i < pieces.length; i++) {
			var p = pieces[i];
			var pm = game.movesFor(p.x, p.y);
			var m_obj = {
				piece: p,
				moves: pm
			}
			moves.push(m_obj);
		}
		return moves;
	},
	getMyMoves: function(game) {
		game = (typeof game === undefined) ? this.game : game;
		
		return this.getMoves(game, this.color);
	},
	getOpponentMoves: function(game) {
		game = (typeof game === undefined) ? this.game : game;
		
		return this.getMoves(game, this.color == 'white' ? 'black' : 'white');
	},
	getMove: function(game) {
		this.game = game;
		game.handleMove('resign');
	},
	capturesByAttacker: function(game) {
		var ctxt = this;
		var CBA = {
			'queen': [],
			'king': [],
			'rook': [],
			'bishop': [],
			'knight': [],
			'pawn': []
		};
		 
		var moves = this.getMyMoves();
		for (var i = 0; i < moves.length; i++) {
			var m_obj = moves[i];
			var p = m_obj.piece;
			for (var l = 0; l < m_obj.moves.capture.length; l++) {
				var m = m_obj.moves.capture[l];
				var t = game.board[m[0]][m[1]];
				var c_rank = {
					piece: p,
					target: t
				};
				CBA[p.type].push(c_rank);
			}
		}
		
		return CBA;
	}
});