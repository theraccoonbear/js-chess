var BackendAgent = BasicAgent.extend({
	constructor: function(color, url) {
		BackendAgent.super.constructor.call(this, color);
		this.url = url;
		this.agentName = "BackendAgent";
	},
	serializeBoard: function(board) {
		var sb = [];
		for (var x = 0; x <= 7; x++) {
			sb[x] = [];
			for (var y = 0; y <= 7; y++) {
				var p = board[x][y];
				var np = '';
				if (p != null) {
					np = p.BERep;
				}
				sb[x].push(np)
			}
		}
		
		return sb;
	},
	getMove: function(game) {
		this.game = game;
		var ctxt = this;
		
		$.post(this.url, {board: this.serializeBoard(game.board)}, function(data, status, xhr) {
			console.log(data);
		});
	}
});