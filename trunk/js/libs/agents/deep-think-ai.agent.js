var DeepThinkAI = BasicAgent.extend({
	targetValues: {
		'king': 100,
		'queen': 50,
		'rook': 20,
		'bishop': 10,
		'knight': 10,
		'pawn': 2
	},
	constructor: function(color) {
		DeepThinkAI.super.constructor.call(this, color);
		this.agentName = "DeepThinkAI";
		this.callDepth = 0;
	},
	scoreBoard: function(board) {
		var white = 0;
		var black = 0;
		
		for (var x = 0; x <= 7; x++) {
			for (var y = 0; y <= 7; y++) {
				var p = board[x][y];
				if (p != null) {
					if (p.color == 'white') {
						white += this.targetValues[p.type];
					} else {
						black += this.targetValues[p.type];
					}
				} // piece exists?
			} // for (y)
		} // for (x)
		
		return this.color == 'white' ? white - black : black - white;
	},
	getAllMyMoves: function(board) {
		var moves = [];
		
		this.game.iob(board, function(p, x, y) {
			if (p != null) {
				var pm = game.movesFor(p.x, p.y, true, board);
				var m_obj = {
					piece: p,
					moves: pm
				}
				moves.push(m_obj);
			}
		});
		
		return moves;
	},
	buildEvalTree: function(board) {
		this.callDepth++;
		
		var moveTree = {
			init: board,
			score: this.scoreBoard(board),
			future: []
		};
		
		var all_piece_moves = this.getAllMyMoves(board);
		
		for (var i = 0; i < all_piece_moves.length; i++) {
			var m_obj = all_piece_moves[i];
			var piece = m_obj.piece;
			var moves = m_obj.moves.move;
			var captures = m_obj.moves.capture;
			var piece_moves = moves.concat(captures);
			
			for (var l = 0; l < all_piece_moves.length; l++) {
				var m = all_piece_moves[l];
				
				var a_move = {
					sx: piece.x,
					sy: piece.y,
					ex: m[0],
					ey: m[1]
				};
				
				var new_board = this.game.testMove(board, piece.x, piece.y, m[0], m[1]);
				
				if (this.callDepth < 2) {
					var new_state = {
						move: a_move,
						state: this.buildEvalTree(new_board)
					};
					
					moveTree.future.push(new_state);
				}
				
			} // for all moves
		} // for all piecesmoves
		
		this.callDepth--;
		
		return moveTree;
	},
	getMove: function(game) {
		this.game = game;
		var start = new Date();
		var elap = 0;
		var board = game.board;
		var my_pieces = [];
		var ctxt = this;
			
		var tree = this.buildEvalTree(board);
		
		console.log(tree);
	}
});