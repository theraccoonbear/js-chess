var Moves = {
	orthMoves: function(sx, sy, board) {
		var piece = board[sx][sy];
		if (piece == null) { return []; }
		var m1 = this.clearedSequence(piece, this.moveSequence(sx, sy, -1, 0), board);
		var m2 = this.clearedSequence(piece, this.moveSequence(sx, sy, 1, 0), board);
		var m3 = this.clearedSequence(piece, this.moveSequence(sx, sy, 0, -1), board);
		var m4 = this.clearedSequence(piece, this.moveSequence(sx, sy, 0, 1), board);
		return m1.concat(m2, m3, m4);
	},
	diagMoves: function(sx, sy, board) {
		var piece = board[sx][sy];
		if (piece == null) { return []; }
		var m1 = this.clearedSequence(piece, this.moveSequence(sx, sy, -1, -1), board);
		var m2 = this.clearedSequence(piece, this.moveSequence(sx, sy, -1, 1), board);
		var m3 = this.clearedSequence(piece, this.moveSequence(sx, sy, 1, -1), board);
		var m4 = this.clearedSequence(piece, this.moveSequence(sx, sy, 1, 1), board);
		return m1.concat(m2, m3, m4);
	},
	univMoves: function(sx, sy, board) {
		var piece = board[sx][sy];
		if (piece == null) { return []; }
		var m1 = this.diagMoves(sx, sy, board);
		var m2 = this.orthMoves(sx, sy, board);
		return m1.concat(m2);
	},
	moveSequence: function(sx, sy, dx, dy) {
		var moves = [];
		for (var i = 1; i < 8; i++) {
			sx += dx;
			sy += dy;
			if (sx >= 0 && sx <= 7 && sy >= 0 && sy <= 7) {
				moves.push([sx,sy]);
			}
		}
		return moves;
	},
	clearedSequence: function(piece, moves, board) {
		var ok = [];
		for (var i = 0; i < moves.length; i++) {
			var m = moves[i];
			var occ = board[m[0]][m[1]];
			if (occ == null) {
				ok.push(m);
			} else {
				if (occ.color != piece.color) {
					ok.push(m);
				}
				return ok;
			}
		}
		
		return ok;
	}
}; // Moves
	
var Logger = {
	$log: null,
	log: function(msg) {
		if (this.$log == null) { this.$log = $('#log'); }
		if (console) { console.log(msg); }
		this.$log.append(msg + '<br/>');
	}
}; // Logger()

var Chess = Class.extend({
	players: [null, null],
	WHITE: 0,
	BLACK: 1,
	check: null,
	active: null,
	threatBoard: [
		[false,false,false,false,false,false,false,false],
		[false,false,false,false,false,false,false,false],
		[false,false,false,false,false,false,false,false],
		[false,false,false,false,false,false,false,false],
		[false,false,false,false,false,false,false,false],
		[false,false,false,false,false,false,false,false],
		[false,false,false,false,false,false,false,false],
		[false,false,false,false,false,false,false,false]
	],
	board: [
		[null,null,null,null,null,null,null,null],
		[null,null,null,null,null,null,null,null],
		[null,null,null,null,null,null,null,null],
		[null,null,null,null,null,null,null,null],
		[null,null,null,null,null,null,null,null],
		[null,null,null,null,null,null,null,null],
		[null,null,null,null,null,null,null,null],
		[null,null,null,null,null,null,null,null]
	],
	$board: null,
	$captured: null,
	constructor: function(options) { //function(player1, player2, display) {
		this.o = {
		};
		
		$.extend(this.o, options);
		
		this.player1 = this.o.player1;
		this.player2 = this.o.player2;
		this.white_player = this.o.player1.color == 'white' ? this.o.player1 : this.o.player2;
		this.black_player = this.o.player1.color == 'black' ? this.o.player1 : this.o.player2;
		this.display = this.o.display;
		this.initThreatBoard = this.threatBoard;
		this.history = [];
		this.active = this.WHITE;
		this.movesSinceCapture = 0;
		this.setupBoard();
		this.endGame = false;
		this.display.displayBoard(this.board);
		this.moveCount = 0;
		this.paused = false;
		this.whiteDoubleStep = false;
		this.blackDoubleStep = false;
		this.enPassantTarget = null;
		this.moveRequestedAt = new Date();
		
		this.gameLog = {
			white: [],
			black: []
		}
		
		if (typeof this.player1.registerUI === 'function') {
			this.player1.registerUI();
		}
		
		if (typeof this.player2.registerUI === 'function') {
			this.player2.registerUI();
		}
	},
	createPiece: function(c, t, x, y) {
		var newPiece = null;
		
		switch (t) {
			case 'pawn':
				newPiece = new PawnPiece(c, t, x, y);
				break;
			case 'rook':
				newPiece = new RookPiece(c, t, x, y);
				break;
			case 'knight':
				newPiece = new KnightPiece(c, t, x, y);
				break;
			case 'bishop':
				newPiece = new BishopPiece(c, t, x, y);
				break;
			case 'queen':
				newPiece = new QueenPiece(c, t, x, y);
				break;
			case 'king':
				newPiece = new KingPiece(c, t, x, y);
				break;
		  default:
				newPiece = new PawnPiece(c, t, x, y);
				break;
		} // switch(t)
		return newPiece;
	},
	addPiece: function(c, t, x, y) {
		var newPiece = this.createPiece(c, t, x, y);
		
		this.board[x][y] = newPiece;
	},
	isOccupied: function(x, y) {
		return this.board[x][y] !== null;
	},
	threatened: function(color) {
		var ctxt = this;
		var which = {};
		
		ctxt.threatBoard = ctxt.initThreatBoard;
		ctxt.check = null;
		
		ctxt.white_player.inCheck(false);
		ctxt.black_player.inCheck(false);
		
		var check = function(x, y) {
			var piece = ctxt.board[x][y];
			var moves = ctxt.movesFor(x,y);
			for (var i = 0; i < moves.capture.length; i++) {
				var m = moves.capture[i];
				var tx = m[0];
				var ty = m[1];
				var t_piece = ctxt.board[tx][ty];
				if (t_piece != null && t_piece.color != piece.color) {
					if (t_piece.type == 'king') {
						ctxt.check = Chess[t_piece.color];
						if (t_piece.color == 'white') {
							ctxt.white_player.inCheck(true);
						} else {
							ctxt.black_player.inCheck(true);
						}
					}
					ctxt.threatBoard[tx][ty] = true;
				}
			}
		}; // check()
		
		for (var x = 0; x <= 7; x++) {
			for (var y = 0; y <= 7; y++) {
				if (typeof color === 'undefined') {
					check(x, y);
				} else {
					if (piece.color != color) {
						check(x, y);
					}
				}
			}
		}
		//console.log(which);
	},
	checkThreatsNew: function(board) {
		var ctxt = this;
		
		var threatBoard = [
			[false,false,false,false,false,false,false,false],
			[false,false,false,false,false,false,false,false],
			[false,false,false,false,false,false,false,false],
			[false,false,false,false,false,false,false,false],
			[false,false,false,false,false,false,false,false],
			[false,false,false,false,false,false,false,false],
			[false,false,false,false,false,false,false,false],
			[false,false,false,false,false,false,false,false]
		];
		
		var check = function(x, y) {
			var piece = board[x][y];
			if (piece != null) {
				var moves = ctxt.movesFor(x, y, false, board);
				for (var i = 0; i < moves.capture.length; i++) {
					var m = moves.capture[i];
					var tx = m[0];
					var ty = m[1];
					var t_piece = board[tx][ty];
					if (t_piece != null && t_piece.color != piece.color) {
						var threat_obj = {
							attacker: piece,
							target: t_piece
						};
						
						if (threatBoard[tx][ty] === false) {
							threatBoard[tx][ty] = [threat_obj];
						} else {
							threatBoard[tx][ty].push(threat_obj);
						}
					}
				}
			}
		}; // check()
		
		for (var x = 0; x <= 7; x++) {
			for (var y = 0; y <= 7; y++) {
				check(x, y);
			}
		}
		
		//if (dbg) { console.log('-------------------------------------------'); }
		
		return threatBoard;
	},	
	checkThreats: function(board, dbg) {
		dbg = typeof dbg === 'undefined' ? false : true;
		var ctxt = this;
		
		var threatBoard = [
			[false,false,false,false,false,false,false,false],
			[false,false,false,false,false,false,false,false],
			[false,false,false,false,false,false,false,false],
			[false,false,false,false,false,false,false,false],
			[false,false,false,false,false,false,false,false],
			[false,false,false,false,false,false,false,false],
			[false,false,false,false,false,false,false,false],
			[false,false,false,false,false,false,false,false]
		];
		
		var check = function(x, y) {
			var piece = board[x][y];
			if (piece != null) {
				var moves = ctxt.movesFor(x, y, false, board);
				for (var i = 0; i < moves.capture.length; i++) {
					var m = moves.capture[i];
					var tx = m[0];
					var ty = m[1];
					var t_piece = board[tx][ty];
					if (t_piece != null && t_piece.color != piece.color) {
						if (dbg) { console.log(piece.toString() + ' is threatening ' + t_piece.toString()); }
						threatBoard[tx][ty] = true;
					}
				}
			}
		}; // check()
		
		for (var x = 0; x <= 7; x++) {
			for (var y = 0; y <= 7; y++) {
				check(x, y);
			}
		}
		
		if (dbg) { console.log('-------------------------------------------'); }
		
		return threatBoard;
	},
	setupBoard: function() {
		this.board = [
			[null,null,null,null,null,null,null,null],
			[null,null,null,null,null,null,null,null],
			[null,null,null,null,null,null,null,null],
			[null,null,null,null,null,null,null,null],
			[null,null,null,null,null,null,null,null],
			[null,null,null,null,null,null,null,null],
			[null,null,null,null,null,null,null,null],
			[null,null,null,null,null,null,null,null]
		];
		
		this.threatBoard = [
			[false,false,false,false,false,false,false,false],
			[false,false,false,false,false,false,false,false],
			[false,false,false,false,false,false,false,false],
			[false,false,false,false,false,false,false,false],
			[false,false,false,false,false,false,false,false],
			[false,false,false,false,false,false,false,false],
			[false,false,false,false,false,false,false,false],
			[false,false,false,false,false,false,false,false]
		];
		
		for (var x = 0; x < 8; x++) {
			this.addPiece('white', 'pawn', x, 6);
			this.addPiece('black', 'pawn', x, 1);
		}
		this.addPiece('white', 'rook', 0, 7);
    this.addPiece('white', 'rook', 7, 7);
    this.addPiece('white', 'knight', 1, 7);
    this.addPiece('white', 'knight', 6, 7);
    this.addPiece('white', 'bishop', 2, 7);
    this.addPiece('white', 'bishop', 5, 7);
    this.addPiece('white', 'queen', 3, 7);
    this.addPiece('white', 'king', 4, 7);
    this.addPiece('black', 'rook', 0, 0);
    this.addPiece('black', 'rook', 7, 0);
    this.addPiece('black', 'knight', 1, 0);
    this.addPiece('black', 'knight', 6, 0);
    this.addPiece('black', 'bishop', 2, 0);
    this.addPiece('black', 'bishop', 5, 0);
		this.addPiece('black', 'king', 4, 0);
    this.addPiece('black', 'queen', 3, 0);
    
	},
	iob: function(board, action) {
		for (var x = 0; x < 8; x++) {
			for (var y = 0; y < 8; y++) {
				action(board[x][y], x, y);
			}
		}
	},
	movesFor: function(x, y, checkForCheck, altBoard) {
		var nret_val = {
			move: [],
			capture: []
		};
		
		var btu = typeof altBoard === 'undefined' ? this.board : altBoard;
		
		var cfc = checkForCheck !== false ? true : false;
		
		var piece = btu[x][y];
		if (piece != null) {
			ret_val = piece.moves(btu);
			
			for (var i = 0; i < ret_val.move.length; i++) {
				var m = ret_val.move[i];
				if (m[0] >= 0 && m[0] <= 7 && m[1] >= 0 && m[1] <= 7) {
					if (btu[m[0]][m[1]] == null) {
						nret_val.move.push(m);
					}
				}
			}
			
			for (var i = 0; i < ret_val.capture.length; i++) {
				var m = ret_val.capture[i];
				if (m[0] >= 0 && m[0] <= 7 && m[1] >= 0 && m[1] <= 7) {
					var tar_piece = btu[m[0]][m[1]];
					
					if (tar_piece != null && tar_piece.color != piece.color) {
						nret_val.capture.push(m);
					} else if (piece.type == 'pawn') { // en passant check
						var ym = piece.color == 'white' ? 1 : -1;
						var epp = btu[m[0]][m[1] + ym];
						if (epp != null && epp.type == 'pawn' && epp.color != piece.color && epp.enPassantAttackable === true) {
						  nret_val.capture.push(m);	
						}
					}
				}
			}
			
			
			
			
			if (cfc) {
				var king_pos = {x: null, y: null};
				var king_found = false;
			
				this.iob(btu, function(p, x, y) {
					if (p != null && p.color == piece.color && p.type == 'king') {
						king_found = true;
						king_pos.x = x;
						king_pos.y = y;
					}
				});
				
				if (king_found) {
					var cur_threats = this.checkThreats(btu);
					var king_in_check = cur_threats[king_pos.x][king_pos.y];
					
					var tret_val = {
						capture: [],
						move: []
					};
					
					
					for (var i = 0; i < nret_val.capture.length; i++) {
						var m = nret_val.capture[i];
						var cx = king_pos.x;
						var cy = king_pos.y;
						if (piece.type == 'king') {
							cx = m[0];
							cy = m[1];
						}
						
						var threats = this.checkThreats(this.testMove(btu, x, y, m[0], m[1]));
						if (threats[cx][cy] != true) {
							tret_val.capture.push(m);
						}
					}
					
					for (var i = 0; i < nret_val.move.length; i++) {
						var m = nret_val.move[i];
						var cx = king_pos.x;
						var cy = king_pos.y;
						if (piece.type == 'king') {
							cx = m[0];
							cy = m[1];
						}
						var threats = this.checkThreats(this.testMove(btu, x, y, m[0], m[1]));
						if (threats[cx][cy] != true) {
							tret_val.move.push(m);
						}
					}
					
					
					nret_val = tret_val;
				
				} else {
					// No King!?
				}
			}
		}
		return nret_val
	},
	createScenario: function(board) {
		this.board = [
		  [null,null,null,null,null,null,null,null],
			[null,null,null,null,null,null,null,null],
			[null,null,null,null,null,null,null,null],
			[null,null,null,null,null,null,null,null],
			[null,null,null,null,null,null,null,null],
			[null,null,null,null,null,null,null,null],
			[null,null,null,null,null,null,null,null],
			[null,null,null,null,null,null,null,null]
		];
		
		var ctxt = this;
		
		this.iob(board, function(p,x,y) {
			if (p != null) {
				p = p.toLowerCase();
				var color = p.substring(0, 1) == 'w' ? 'white' : 'black';
				var type_rep = p.substring(1);
				var type = 'pawn';
				switch (type_rep) {
					case 'q':
						type = 'queen';
						break;
				  case 'k':
						type = 'king';
						break;
					case 'r':
						type = 'rook';
						break;
					case 'b':
						type = 'bishop';
						break;
					case 'n':
						type = 'knight';
						break;
					default:
						type = 'pawn';
						break;
				}
				
				ctxt.addPiece(color, type, y, x);
			}
		});
		this.display.displayBoard(this.board);
	},
	toString: function(b) {
		
		var btd = typeof b != 'undefined' ? b : this.board;
		
		var s = '';
		for (var x = 0; x < 8; x++) {
			for (var y = 0; y < 8; y++) {
				var p = btd[y][x];
				s += p == null ? '.' : p.rep; //piece.rep[p.type];
			}
			s += '\n';
		}
		return s;
	},
	testMove: function(board, x1, y1, x2, y2) {
		var new_board = this.boardCopy(board);
		
		var p1 = new_board[x1][y1];
		p1.x = x2;
		p1.y = y2;
		new_board[x2][y2] = p1;
		new_board[x1][y1] = null;
		
		return new_board;
	},
	boardCopy: function(board) {
		var new_board = [];
		for (var x = 0; x < 8; x++) {
			new_board[x] = [null,null,null,null,null,null,null,null];
			for (var y = 0; y < 8; y++) {
				var p = board[x][y];
				if (p != null) {
					var np = this.createPiece(p.color, p.type, p.x, p.y);
					new_board[x][y] = np;
				}
			}
		}
		return new_board;
	},
	setEnPassantTarget: function(pawn) {
	  pawn.openToEnPassant(true);
		this.enPassantTarget = pawn;
	},
	clearEnPassantTarget: function() {
		if (this.enPassantTarget != null && this.enPassantTarget !== false) {
			this.enPassantTarget.openToEnPassant(false);
		}
		this.enPassantTarget = null;
	},
	move: function(x1, y1, x2, y2) {
		var p_obj = this.board[x1][y1];
		var d_obj = this.board[x2][y2];
		
		
		
		if (p_obj == null) {
			return false;
		}
		
		var elapsed = new Date() - this.moveRequestedAt;
		
		var turn = p_obj.color;
		
		if (turn == 'white') {
			this.whiteDoubleStep = false;
		} else {
			this.blackDoubleStep = true;
		}
		
		var notation = p_obj.rep + p_obj.position();
		if (d_obj == null) {
			
			if (p_obj.type == 'pawn' &&  x1 != x2) {
				
				var cpx = x2;
				var cpy = (p_obj.color == 'white') ? y2 + 1 : y2 - 1;
				d_obj = this.board[cpx][cpy]
				if (d_obj.type == 'pawn' && d_obj.enPassantAttackable) {
					notation += 'x' + d_obj.position() + '(ep)';
					this.display.capturePiece(cpx, cpy, this.board);
					this.board[cpx][cpy] = null;
				}
			} else {
				notation += '-' + p_obj.position({x: x2, y: y2});
				this.movesSinceCapture++;
			}
		} else {
			notation += 'x' + d_obj.position();
			this.movesSinceCapture = 0;
		}
		
		this.history.push(this.boardCopy(this.board));
		
		this.display.move(x1, y1, x2, y2, this)
		
		this.board[x1][y1] = null;
		p_obj.x = x2;
		p_obj.y = y2;
		p_obj.unmoved = false;
		this.board[x2][y2] = p_obj;
		this.moves++;
		
		this.clearEnPassantTarget();
		
		if (p_obj.type == 'pawn') {
			if ((p_obj.color == 'black' && p_obj.y == 7) || (p_obj.color == 'white' && p_obj.y == 0)) {
				this.addPiece(p_obj.color, 'queen', p_obj.x, p_obj.y);
			} else if ((p_obj.color == 'black' && y2 == 3) || (p_obj.color == 'white' && y2 == 4)) {
				this.setEnPassantTarget(p_obj);
			}
		} else if (p_obj.type == 'king' && Math.abs(x1 - x2) == 2) {
			var y = p_obj.color == 'white' ? 7 : 0;
			
			var rsx, rex;
			
			if (x1 > x2) { // queen side
				rsx = 0;
				rex = 3;
				notation = 'O-O-O';
			} else {
				rsx = 7;
				rex = 5;
				notation = 'O-O';
			}
			
			
			this.display.move(rsx, y, rex, y, this, {callback: false, castling: true});
			
			var rook = this.board[rsx][y];
			rook.x = rex;
			rook.y = y;
			this.board[rsx][y] = null;
			this.board[rex][y] = rook;
			// Add castling
		}
		
		this.logMove(x1, y1, x2, y2, notation, elapsed, turn);
		
		this.moveCount = d_obj != null ? 0 : this.moveCount + 1;
		
		if (this.movesSinceCapture > 100) {
			this.gameOver('draw');
		}
		
		this.threatened();
		
		
		
		if (d_obj != null && d_obj.type == 'king') { 
			var winner = d_obj.color == 'white' ? 'black' : 'white';
			this.gameOver(winner);
		}
		
		return d_obj;
	},
	logMove: function(x1, y1, x2, y2, not, e, turn) {
		var entry = {
			sx: x1,
			sy: y1,
			ex: x2,
			ey: y2,
			elapsed: e,
			notation: not
		};
		
		if (turn == 'white') {
			this.gameLog.white.push(entry);
		} else {
			this.gameLog.black.push(entry);
		}
		
		if (this.gameLog.white.length == this.gameLog.black.length) {
			var idx = this.gameLog.white.length - 1;
			if (console) {
				var wm = this.gameLog.white[idx];
				var bm = this.gameLog.black[idx];
				
				console.log((idx + 1) + '. ' + wm.notation + ' (' +  wm.elapsed + 'ms)  ' + bm.notation + ' (' + bm.elapsed + 'ms)');
			}
		}
	},
	displayDone: function() {
		this.nextMove();
	},
	gameOver: function(winner) {
		this.endGame = true;
		if (typeof this.endGameCallback === 'function') {
			this.endGameCallback(this, winner);
		}
	},
	start: function(cb) {
		this.endGameCallback = cb;
		this.paused = false;
		var ctxt = this;
		setTimeout(function() {
			ctxt.nextMove();
		}, 1); //1000);
	},
	pauseGame: function() {
		this.paused = true;
	},
	playGame: function() {
		this.paused = false;
		//this.nextMove();
	},
	nextMove: function() {
		if (this.paused || this.endGame) {
			return;
		}
		
		this.moveRequestedAt = new Date();
		
		if (this.active == this.WHITE) {
			this.white_player.getMove(this, this.handleMove);
		} else {
			this.black_player.getMove(this, this.handleMove);
		}
		this.active = this.active == this.WHITE ? this.BLACK : this.WHITE;
	},
	handleMove: function(move) {
		var ctxt = this;
		
		if (move == 'resign') {
			this.gameOver(this.active == this.WHITE ? 'black' : 'white');
		} else if (move.sx == null || move.sy == null || move.ex == null || move.ey == null) {
			this.gameOver(this.active == this.WHITE ? 'black' : 'white');
		} else {
			this.move(move.sx, move.sy, move.ex, move.ey);
		}
	}
}); // Chess
