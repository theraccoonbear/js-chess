var HighValueTargetAI = RandomAI.extend({
	targetValues: {
		'king': 10,
		'queen': 8,
		'rook': 6,
		'bishop': 4,
		'knight': 4,
		'pawn': 2
	},
	atRandom: function(ar) {
		var idx = Math.floor(Math.random() * ar.length);
		return ar[idx];
	},
	notify: function(msg) {
		if (console && typeof console.log === 'function') {
			console.log(msg);
		}
	},
	constructor: function(color) {
		HighValueTargetAI.super.constructor.call(this, color);
		this.agentName = "HighValueTargetAI";
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
		
		game.iob(game.board, function(p, x, y) {
			if (p != null && p.color == ctxt.color) {
				var opts = game.movesFor(p.x, p.y);
				if (opts.capture.length > 0) {
					for (var i = 0; i < opts.capture.length; i++) {
						var m = opts.capture[i];
						var t = game.board[m[0]][m[1]];
						var c_rank = {
							piece: p,
							target: t
						}
						//CMs.push(c_rank);
						CBA[p.type].push(c_rank);
					}
				}
			}
		});
		
		return CBA;
	},
	getMove: function(game) {
		var start = new Date();
		var elap = new Date() - start
		var board = game.board;
		var my_pieces = [];
		var ctxt = this;
		
		
		var CBA = this.capturesByAttacker(game);
		
		var CMs = [];
		
		var tpv = 0;
		var atv = 100;
		var htv_move = {
			sx: null,
			sy: null,
			ex: null,
			ey: null
		};
		
		var ptype = ['king','queen','rook','bishop','knight','pawn'];
		
		var tcc = 0;
		for (var i = 0; i < ptype.length; i++) {
			tcc += CBA[ptype[i]].length;
		}
		
		if (tcc > 0) {
			for (var q = 0; q < ptype.length; q++) {
				CMs = CBA[ptype[q]];
				
				for (var i = 0; i < CMs.length; i++) {
					var c = CMs[i];
					var c_tpv = ctxt.targetValues[c.target.type];
					var c_atv = ctxt.targetValues[c.piece.type];
					if (c_tpv > tpv) {
						htv_move = {
							sx: c.piece.x,
							sy: c.piece.y,
							ex: c.target.x,
							ey: c.target.y
						};
						tpv = c_tpv
						atv = c_atv;
					} else if (c_tpv == tpv && c_atv < atv) {
						htv_move = {
							sx: c.piece.x,
							sy: c.piece.y,
							ex: c.target.x,
							ey: c.target.y
						};
						tpv = c_tpv
						atv = c_atv;
					}
				}
			}
			game.handleMove(htv_move);
		} else {
			HighValueTargetAI.super.getMove.call(this, game);

		}
	}
});