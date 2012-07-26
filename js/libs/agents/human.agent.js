var HumanAgent = BasicAgent.extend({
	$board_squares: $('.nonExistentXXX'),
	sel_piece: null,
	getMove: function(game) {
		this.waitingGame = game;
	},
	constructor: function(color) {
		HumanAgent.super.constructor.call(this, color);
		this.agentName = "Human";
	},
	UI: {
		hoverMoveHandler: function(e, plyr) {
			if (plyr.sel_piece != null || plyr.waitingGame == false) { return; }
			var $sq = $(this);
			var x = $sq.data('x');
			var y = $sq.data('y');
			var game = plyr.waitingGame;
			var piece = game.board[x][y];
			
			
			plyr.$board_squares.removeClass('validMove').removeClass('validCapture');
			
			if (piece != null) {
				if (piece.color != plyr.color) {
					return;
				}
				
				var move_options = game.movesFor(x, y);
				var moves = move_options.move;
				var captures = move_options.capture;
				
				for (var i = 0; i < moves.length; i++) {
					var m = moves[i];
					$('.chessBoard .y' + m[1] + ' .x' + m[0]).addClass('validMove');
				}
				
				for (var i = 0; i < captures.length; i++) {
					var m = captures[i];
					$('.chessBoard .y' + m[1] + ' .x' + m[0]).addClass('validCapture');
				}
			}
		}, // hoverMoveHandler()
		clickHandler: function(e, plyr) {
			if (plyr.waitingGame == false) { return; }
			var ctxt = this;
			var $sq = $(ctxt);
			var x = $sq.data('x');
			var y = $sq.data('y');
			var game = plyr.waitingGame;
			var piece = game.board[x][y];
			
			
			if (plyr.sel_piece == null) { // no piece selected
				if (piece == null || piece.color != plyr.color) {
					return;
				}
				plyr.$board_squares.removeClass('selected');
				$sq.addClass('selected');
				plyr.sel_piece = piece;
			} else if (piece != null && plyr.sel_piece.x == piece.x && plyr.sel_piece.y == piece.y) {
				plyr.$board_squares.removeClass('selected validCapture validMove');
				plyr.sel_piece = null;
			} else { // piece selected
				var all_moves = game.movesFor(plyr.sel_piece.x, plyr.sel_piece.y);
				var moves = all_moves.move;
				var captures = all_moves.capture;
				
				var valid = false;
				for (var i = 0; i < moves.length; i++) {
					var m = moves[i];
					valid = valid || (m[0] == x && m[1] == y);
				}
				
				for (var i = 0; i < captures.length; i++) {
					var m = captures[i];
					valid = valid || (m[0] == x && m[1] == y);
				}
				
				var the_move = {
					sx: plyr.sel_piece.x,
					sy: plyr.sel_piece.y,
					ex: x,
					ey: y
				};
				
				if (valid) { // valid move for piece
					if (piece == null){ // destination not occupied
						//game.move(this.sel_piece.x, this.sel_piece.y, x, y);
						
						plyr.sel_piece = null;
						plyr.$board_squares.removeClass('selected validCapture validMove');
						plyr.UI.hoverMoveHandler.call(ctxt, e, plyr);
						plyr.waitingGame = false;
						game.handleMove(the_move);
					} else { // destination occupied
						if (piece.color != plyr.sel_piece.color) { // opponent
							//game.move(this.sel_piece.x, this.sel_piece.y, x, y);// capture
							plyr.sel_piece = null;
							plyr.$board_squares.removeClass('selected validCapture validMove');
							plyr.UI.hoverMoveHandler.call(ctxt, e, plyr);
							plyr.waitingGame = false;
							game.handleMove(the_move);
						} else { // self
							// invalid
						} // opponent?
					} // occupied?
				} // valid?
			} // piece selected?
		}
	},
	registerUI: function() {
		var ctxt = this;
		setTimeout(function() {
			ctxt.$board_squares =  $('.chessBoard td.boardSquare');
			ctxt.$board_squares.hover(function(e) {
				ctxt.UI.hoverMoveHandler.call(this, e, ctxt);
			}).click(function(e) {
				ctxt.UI.clickHandler.call(this, e, ctxt);
			});
			if (ctxt.$board_squares.length == 0) {
				ctxt.registerUI();
			}
		}, 10);
	},
	constructor: function(color) {
		var ctxt = this;
		HumanAgent.super.constructor.call(this, color);
		this.myTurn = false;
		this.$board_squares = [];
		this.waitingGame = false;
	} // constructor()
}); // HumanAgent