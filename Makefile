
BS5_VERSION = 1.0.0

all:: produce_webpages css

produce_webpages::
	bin/produce_webpages

css::
	sass raw/dist/bootstrap5/$(BS5_VERSION)/form-changes.scss public_html/dist/boostrap5/$(BS5_VERSION)/form-changes.css

publish:: all
	psync changes
