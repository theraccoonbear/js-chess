var RandomBackendAI = BackendAgent.extend({
	constructor: function(color) {
		RandomBackendAI.super.constructor.call(this, color, '/js-chess-dev/server-agents/random-ai.agent.php');
	}
});