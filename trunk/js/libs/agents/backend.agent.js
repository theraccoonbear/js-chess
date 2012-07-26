var BackendAgent = BasicAgent.extend({
	constructor: function(color, url) {
		BackendAgent.super.constructor.call(this, color);
		this.url = url;
		this.agentName = "BackendAgent";
	},
	getMove: function(game) {
		this.game = game;
		var board = game.board;
		var ctxt = this;
		//game.handleMove('resign');
		
		$.getJSON(this.url, board, function(data, status, xhr) {
			console.log(data);
		});
	}
});