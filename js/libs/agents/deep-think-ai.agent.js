var DeepThinkAI = CostBenefitAI.extend({
	targetValues: {
		'king': 100,
		'queen': 50,
		'rook': 20,
		'bishop': 10,
		'knight': 10,
		'pawn': 2
	},
	maxDepth: 3,
	constructor: function(color) {
		DeepThinkAI.super.constructor.call(this, color);
		this.agentName = "DeepThinkAI";
		this.callDepth = 0;
		this.positionsEvaluated = 0;
		this.movesMade = 0;
	},
	scoreBoard: function(board) {
		var white = 0;
		var black = 0;
		var ret_val = 0;
		
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
		
		ret_val = this.color == 'white' ? white - black : black - white;
		
		//if (ret_val != 0) {
		//	console.log('SCORE: ' + ret_val);
		//	console.log(board);
		//	console.log('-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=');
		//}
		
		return ret_val;
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
			
			for (var l = 0; l < piece_moves.length; l++) {
				var m = piece_moves[l];
				
				var a_move = {
					sx: piece.x,
					sy: piece.y,
					ex: m[0],
					ey: m[1]
				};
				
				this.positionsEvaluated++;
				if (this.positionsEvaluated > this.lastNotice + 1000) {
					console.log('(' + this.callDepth + ') ' + this.positionsEvaluated + '...');
					this.lastNotice = this.positionsEvaluated;
				}
				
				var new_board = this.game.testMove(board, piece.x, piece.y, m[0], m[1]);
				
				if (this.callDepth < this.maxDepth) {
					var new_state = {
						move: a_move,
						state: this.buildEvalTree(new_board)
					};
					
					moveTree.future.push(new_state);
				}
				
			} // for all moves
		} // for all piecesmoves
		
		
		if (this.callDepth < this.maxDepth) {
			// Get the average
			var sum = 0;
			for (var i = 0; i < moveTree.future.length; i++) {
				var mt = moveTree.future[i].state;
				sum += mt.score;
			}
			moveTree.score = sum / moveTree.future.length;
		}
		
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
		this.positionsEvaluated = 0;
		this.lastNotice = 0;
		
		this.movesMade++;
		
		if (this.movesMade < 10) {
			DeepThinkAI.super.getMove.call(this, game);
		} else {
			var tree = this.buildEvalTree(board);
			console.log(this.color + ' Positions Evaluated: ' + this.positionsEvaluated);
			var hs = 0;
			var hs_move = null;
			
			for (var i = 0; i < tree.future.length; i++) {
				var mv = tree.future[i];
				if (mv.state.score > hs) {
					hs = mv.state.score;
					hs_move = mv.move;
				}
			}
			
			if (hs_move == null) {
				hs_move = this.atRandom(tree.future).move;
			}
			game.handleMove(hs_move);
		}
		
		
	}
});