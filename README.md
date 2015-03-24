# deep-marked

Client for [kroked](https://github.com/nomocas/kroked) : Markdown with macros.

## Clients

Clients will load markdown documents (kroked flavoured), compile them and keep them in cache (deep media cache) for further usage.

Two implementations are there for the moment : jquery/ajax or nodejs/fs.
Under nodejs, there is some file watching that update cache if file change.

Browser (jq-ajax) example : 
```javascript 
require("deep-marked/lib/jq-ajax"); // load deep.marked : contains language definition
deep.marked.jqajax("myProtocol");
//...
deep.nodes("myProtocol::/my/markdown/file.mkd").run(null, { context:{ vars:true }}).log();
// will output the result
```

Nodejs (fs) example : 
```javascript 
require("deep-marked/lib/nodejs"); // load deep.marked : contains language definition
deep.marked.nodejs("myProtocol");
//...
deep.nodes("myProtocol::/my/markdown/file.mkd").run(null, { context:{ vars:true }}).log();
// will output the result
```

## Licence

LGPL 3.0
