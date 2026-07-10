all:: produce_webpages

produce_webpages::
	bin/produce_webpages

publish:: all
	psync changes
