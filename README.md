# CloudFlare Pages UrlShorten
Deploy this repo to your CloudFlare Pages,
Create a [Worker KV](https://dash.cloudflare.com/?to=/:account/workers/kv/namespaces),
Bind this Worker KV in your Pages project in `Settings > Functions > KV namespaces bindings` with `Variable name` called `UrlShorten`,
Done

## Deploy
// TODO

## Add a path
Add it to KV like:

| Key | Value |
| --- | --- |
| **path** | **real url** |
| [`/blog`](https://cz.cyou/blog) | https://blog.orangii.cn |
| `/more` | https://example.org |

## Gravatar Mirror
Check this out:

![Gravatar](https://cz.cyou/avatar/02e96d02a7364a53f44168f4beb7067c)
https://cz.cyou/avatar/02e96d02a7364a53f44168f4beb7067c

## Github Static File Mirror
Test with this README.md

- Origin: [https://raw.githubusercontent.com/Jiaocz/CloudFlare-Pages-UrlShorten/feat/functions-dir/README.md](https://raw.githubusercontent.com/Jiaocz/CloudFlare-Pages-UrlShorten/feat/functions-dir/README.md)
- Mirror: [https://cz.cyou/**gh/https://raw.githubusercontent.com/Jiaocz/CloudFlare-Pages-UrlShorten/feat/functions-dir/README.md**](https://cz.cyou/gh/https://raw.githubusercontent.com/Jiaocz/CloudFlare-Pages-UrlShorten/feat/functions-dir/README.md)

Just add origin link to cz.cyou (or your deployed instance).
`https://cz.cyou${origin_link}`