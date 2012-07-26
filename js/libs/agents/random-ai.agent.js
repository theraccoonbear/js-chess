var RandomAI = BasicAgent.extend({
	notify: function(msg) {
		if (console && typeof console.log === 'function') {
			console.log(msg);
		}
	},
	constructor: function(color) {
		RandomAI.super.constructor.call(this, color);
		this.agentName = "RandomAI";
	},
	getMove: function(game) {
		this.game = game;
		var start = new Date();
		var elap = new Date() - start
		var board = game.board;
		var my_pieces = [];
		var ctxt = this;
		
	  for (var x = 0; x < 8; x++) {
			for (var y = 0; y < 8; y++) {
				var piece = board[x][y];
				if (piece != null && piece.color == this.color) {
					my_pieces.push(piece);
				}
			}
		}

		var the_move = {
			sx: null,
			sy: null,
			ex: null,
			ey: null
		};
		var ready = false;
		var safety_cnt = 0;

		var to_play = this.atRandom(my_pieces);
		var now = new Date();
		while (!ready && now - start < 1000) { // ready or 1 second without a decision
			safety_cnt++;
			the_move.sx = to_play.x;
			the_move.sy = to_play.y;
			
			var moves = game.movesFor(to_play.x, to_play.y);
			if (moves.capture.length > 0) {
			  var m = this.atRandom(moves.capture);
				the_move.ex = m[0];
				the_move.ey = m[1];
				ready = true;
			} else if (moves.move.length > 0) {
				var m = this.atRandom(moves.move);
				the_move.ex = m[0];
				the_move.ey = m[1];
				ready = true;
			} else {
				to_play = this.atRandom(my_pieces);
			}
			now = new Date();
		}
		
		game.handleMove(the_move);
	}
});