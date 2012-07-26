var BackendAgent = BasicAgent.extend({
	constructor: function(color, url) {
		BackendAgent.super.constructor.call(this, color);
		this.url = url;
		this.agentName = "BackendAgent";
	},
	getMove: function(game) {
		this.game = game;
		var ctxt = this;
		
		$.post(this.url, {board: game.board}, function(data, status, xhr) {
			console.log(data);
		});
	}
});