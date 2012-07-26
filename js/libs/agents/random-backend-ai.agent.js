var RandomBackendAI = BackendAgent.extend({
	constructor: function(color) {
		RandomBackendAI.super.constructor.call(this, color, '/server-agents/random-ai.agent.php');
	}
});