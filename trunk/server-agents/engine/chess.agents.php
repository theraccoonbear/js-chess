<?php

$agent_path = dirname(__FILE__) . '/agents/';

$dfh = opendir($agent_path);

while (false !== ($agent_file = readdir($dfh))) {
	if (preg_match('/\.agent\.php$/', $agent_file)) {
		include_once($agent_path . $agent_file);
		//print "$agent_file\n";
	}
}

?>