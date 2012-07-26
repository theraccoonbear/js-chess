var CostBenefitAI = BasicAgent.extend({
	targetValues: {
		'king': 100,
		'queen': 50,
		'rook': 20,
		'bishop': 10,
		'knight': 10,
		'pawn': 2
	},
	constructor: function(color) {
		CostBenefitAI.super.constructor.call(this, color);
		this.agentName = "CostBenefitAI";
		this.callDepth = 0;
	},
	adjacentToKing: function(game, x, y) {
		var to_check = [
			[x - 1, y - 1],
			[x, y - 1],
			[x + 1, y - 1],
			[x - 1, y],
			[x + 1, y],
			[x - 1, y + 1],
			[x, y + 1],
			[x + 1, y + 1]
		];
		
		for (var i = 0; i < to_check.length; i++) {
			var m = to_check[i];
			if (m[0] >= 0 && m[0] <= 7 && m[1] >= 0 && m[1] <= 7) {
				var p = game.board[m[0]][m[1]] 
				if (p != null) {
				  if (p.type == 'king' && p.color != this.color) {
						return true;
					}
				}
			}
		}
		return false;
	},
	evalMove: function(game, x1, y1, x2, y2) {
		var board = game.board;
		
		var atk_p = board[x1][y1];
		var cap_p = board[x2][y2];
		var score = -10000;
		
		
		if (atk_p != null) {
			if (cap_p != null) {
				score = this.targetValues[cap_p.type];
			} else {
				score = 0;
			}
			
			if (atk_p.type == 'king') {
				score -= 40;
			}
				
			var new_board = game.testMove(board, x1, y1, x2, y2);
			var threats = game.checkThreats(new_board);
			if (threats[x2][y2]) {
				score -= this.targetValues[atk_p.type];
			}
			//if (this.adjacentToKing, game, x2, y2) {
			//	score -= 50;
			//}
		}
		
		return score;
	},
  endGameStrategy: function() {
		var game = this.game;
		var board = game.board;
		var all_moves = this.getMyMoves(game);
		
		var king = this.op_pcs[0];
		
		var check_moves = [];
		var safe_check_moves = [];
		var std_moves = [];
		var danger_moves = [];
		
		for (var i = 0; i < all_moves.length; i++) {
			var m_obj = all_moves[i];
			var piece = m_obj.piece;
			var moves = m_obj.moves.move;
			var captures = m_obj.moves.capture;
			var all = moves.concat(captures);
			
			for (var l = 0; l < all.length; l++) {
				var m = all[l];
				
				var new_board = game.testMove(board, piece.x, piece.y, m[0], m[1]);
				var threats = game.checkThreatsNew(new_board);
				
				var a_move = {
					sx: piece.x,
					sy: piece.y,
					ex: m[0],
					ey: m[1]
				};
				
				var tkx = {
					x: king.x,
					y: king.y
				};
				
				
				
				var mv_desc = piece.toString() + ' -> ' + m[0] + ', ' + m[1] + ' ' + (threats[king.x][king.y] ? '' : 'not') + ' threatening the king';
				//this.dbg(mv_desc);
				if (threats[king.x][king.y] !== false) {
					if (threats[m[0]][m[1]] !== false) {
						check_moves.push(a_move);
					} else {
						safe_check_moves.push(a_move);
					}
				} else {
					if (threats[m[0]][m[1]] !== false) {
						danger_moves.push(a_move);
					} else {
						std_moves.push(a_move);
					}
				}
			} // for all moves
		} // for all piecesmoves
		
		
		var the_move;
		
		if (safe_check_moves.length > 0) {
			the_move = this.furthestFromBefore(safe_check_moves, king.x, king.y);
		} else if (std_moves.length > 0) {
			the_move = this.furthestFromBefore(std_moves, king.x, king.y);
		} else if (check_moves.length) {
			the_move = this.furthestFromBefore(check_moves, king.x, king.y);
		} else {
			the_move = this.furthestFromBefore(danger_moves, king.x, king.y);
		}
		
		game.handleMove(the_move);
		
	},
	getMove: function(game) {
		this.game = game;
		var start = new Date();
		var elap = new Date() - start
		var board = game.board;
		var my_pieces = [];
		var ctxt = this;
		this.op_pcs = this.getOpponentPieces(game);
		
		if (this.op_pcs.length == 1) { // endgame
			this.endGameStrategy();	
		} else { // midgame
			
			
			var all_moves = this.getMyMoves(game);
			
			var best_move = {
				sx: null,
				sy: null,
				ex: null,
				ey: null
			};
			var best_move_score = -99999;
			var high_score = -99999;
			
			var asm = {
				high_score: []	
			};
			
			var mv_cnt = 0;
			var mv_scores = [];
			
			for (var i = 0; i < all_moves.length; i++) {
				var m_obj = all_moves[i];
				var piece = m_obj.piece;
				var moves = m_obj.moves.move;
				var captures = m_obj.moves.capture;
				var all = moves.concat(captures);
				
				for (var l = 0; l < all.length; l++) {
					var m = all[l];
					var m_score = this.evalMove(game, piece.x, piece.y, m[0], m[1]);
					mv_cnt++;
					
					var a_move = {
						sx: piece.x,
						sy: piece.y,
						ex: m[0],
						ey: m[1]
					};
					
					if (typeof asm[m_score] === 'undefined') {
						asm[m_score] = [];
						mv_scores.push(m_score);
					}
					asm[m_score].push(a_move);
					if (m_score > high_score) {
						high_score = m_score;
					}
				} // for all moves
			} // for all piecesmoves
			
			if (high_score == -99999) {
				best_move = 'resign';
			} else {
				best_move = this.atRandom(asm[high_score]);
			}
			
			//this.dbg('(' + this.color.toUpperCase() + ") After considering " + mv_cnt + " moves with scores of: " + mv_scores.sort().join(', ') + " I've decided on " + best_move.sx + ', ' + best_move.sy + ' -> ' + best_move.ex + ', ' + best_move.ey);
			
			
			
			game.handleMove(best_move);
		} // midgame
	}
});