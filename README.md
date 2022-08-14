# CloudFlare Pages UrlShorten
Deploy this repo to your CloudFlare Pages,
Create a [Worker KV](https://dash.cloudflare.com/?to=/:account/workers/kv/namespaces),
Bind this Worker KV in your Pages project in `Settings > Functions > KV namespaces bindings` with `Variable name` called `UrlShorten`,
Done

## Add a path
Add it to KV like:

| Key | Value |
| --- | --- |
| path | real url |
| /orangii | https://orangii.cn |
| /more | https://example.org |