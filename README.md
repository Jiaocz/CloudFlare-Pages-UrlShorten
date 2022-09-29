# CloudFlare Pages UrlShorten
Deploy this repo to your CloudFlare Pages,
Create a [Worker KV](https://dash.cloudflare.com/?to=/:account/workers/kv/namespaces),
Bind this Worker KV in your Pages project in `Settings > Functions > KV namespaces bindings` with `Variable name` called `UrlShorten`,
Done

## Add a path
Add it to KV like:

| Key | Value |
| --- | --- |
| **path** | **real url** |
| [`/blog`](https://cz.cyou/blog) | https://blog.orangii.cn |
| `/more` | https://example.org |

## Gravatar Proxy Supported
Check this out:

![Gravatar](https://cz.cyou/avatar/02e96d02a7364a53f44168f4beb7067c)
https://cz.cyou/avatar/02e96d02a7364a53f44168f4beb7067c
