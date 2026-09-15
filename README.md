# CloudFlare Pages UrlShorten
Deploy this repo to your CloudFlare Pages,
Create a [Worker KV](https://dash.cloudflare.com/?to=/:account/workers/kv/namespaces),
Bind this Worker KV in your Pages project in `Settings > Functions > KV namespaces bindings` with `Variable name` called `UrlShorten`,
Done

## Deploy
### Deploy settings
| Setting | Value |
| -- | -- |
| Build command | `npm run build` |
| Build output directory | `/dist` |
| Root directory | `/` |

### Environment variables (recommended)
You could use any node version later than 16.
| Variable name | Value |
| -- | -- |
| NODE_VERSION | `16.17.1` |

### Functions (necessary)
I assume you have created a [KV namespace](https://dash.cloudflare.com/?to=/:account/workers/kv/namespaces) for this Pages project.
| Variable name | KV namespace |
| -- | -- |
| UrlShorten | _the one you created_ |

Other settings are not necessary.

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
`https://cz.cyou/gh/${origin_link}`

## Nextcloud App Store Mirror

The Pages Function at `/nextcloud-appstore/` proxies the official Nextcloud App
Store API and rewrites GitHub release downloads to the existing `/gh/` mirror.
Both the app list and the installation packages therefore use the Pages domain.

Set the App Store URL on your Nextcloud server (replace `cz.cyou` with your
Pages domain):

```bash
sudo -u www-data php occ config:system:set appstoreurl \
  --value="https://cz.cyou/nextcloud-appstore"
```

To switch back to the official endpoint:

```bash
sudo -u www-data php occ config:system:set appstoreurl \
  --value="https://apps.nextcloud.com/api/v1"
```

Only `apps.json` and `categories.json` are exposed. Metadata responses are
cached for one hour by shared caches; application signatures are left untouched
and continue to be verified by Nextcloud after download.

## Credits
Github Mirror function from [hunshcn/gh-proxy](https://github.com/hunshcn/gh-proxy)