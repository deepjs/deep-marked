# deep-marked

markdown with macros

deep-marked defines :
* a meta-language parsed by [marked](https://github.com/chjj/marked) lexer/parser (implemented in deep-marked/lib/marked.js and using deep-views/lib/directives-parser)
* a proposition of language based on this meta-language (implemented in deep-marked/index)
* the clients/protocol (jquery ajax or nodejs fs) to load and parse documents written in that flavour of marked.

See [marked](https://github.com/chjj/marked) for config and basics usage.


## Meta-language

Remarque : "Block" and "inline" refer to concepts related to markdown. A "block" start line without any spaces (or tabulations), as heading (i.e. # this is title), and couldn't be mixed with other on the same line. For inline object, the line could start with spaces, could contains several lexem, and the line and its following (not blank) are wrapped by a paragraph (p tag).

See [marked](https://github.com/chjj/marked) for basics usage.


### Block macros

#### block macro (with parsed content)

```
{% myDirective(arg1, ...) mySecondDirective(arg, ...) myThirdDirective ...
	any content that will be parsed before injection in block (so any markdown or macros will be parsed).
%}
```

#### raw macro (content are not parsed)

```
{! myDirective(arg1, ...) mySecondDirective(arg, ...) ...
	any content that will be kept "as this" (raw) before injection in block
!}
```

#### direct macro. 

When use in front of line (i.e. should start line without spaces or tabulations), any following string until end of line will be used as content.

`@.myDirective(arg, ...)  content...`

#### substitution macro

`{{ theVar.to.be.substitute }}`

### Inline macros

#### direct macro
`@.myDirective(arg, ..., content)`

#### substitution macro
`{{ theVar.to.be.substitute }}`

### Directives format

Any directive could have parenthesis with arguments.
Parenthesis and args are optional.

e.g: `hello` or  `hello()` or  `hello(arg, ...)`  are valid.

Any argument could be string (e.g. "something..."), float, integer or direct string (delimitter is '\n' or ')' or ',')

e.g. : myDirectives("my string...", 12, 34.890, this is a direct string)


## Defining a language
	
By using the custom marked parser directly (deep-marked/lib/marked.js), you could define a language, based on this macros meta-language.

For this, you simply define 3 render methods that receive the directive(s), the eventual content and the options provided while parsing.

You should also provide a directive lexer/parser that parse them as you want. (deep-marked use the one from deep-views. It has been kept separated to avoid modifing to much marked parser.)

examples with "deep-view/lib/directives-parser":
```javascript 
var marked = require("deep-marked/lib/marked"), // load custom marked parser (no macros language defined)
	renderer = new marked.Renderer(),
	directivesParser = require("deep-views/lib/directive-parser");

renderer.block_macro = function(directives, content, options) {
	// directives is array : [{ name:"myDirective", args:[...] }, ...]
	// content is the one provided between macros boundaries (or after block direct macros)
	// options is an object that you provide when parsing

	return "<div>"+JSON.stringify(directives)+" - "+content+"<div>";
};
//________________________________________________________________________ DIRECT MACRO
renderer.inline_macro = function(directive, options) {
	// directive is a single directive : { name:"myDirective", args:[...] }
	// options is an object that you provide when parsing
	
	return "<div>"+JSON.stringify(directives)+"<div>";
};
//_________________________________________________________________________ REPLACE MACRO 
renderer.replace_macro = function(content, options) {
	// content is the one provided between macros boundaries
	// options is an object that you provide when parsing

	return "<div>"+content+"<div>";
};

var opt = {
	renderer: renderer,
	gfm: true,
	tables: true,
	breaks: false,
	pedantic: false,
	sanitize: false,
	smartLists: true,
	smartypants: false,

	//___________________ those 3 config flags are from macros implementation
	codespaces:false,		// disable markdown rules : every line starting with 4 spaces (or more) or tab(s) are code
	macros:true,			// enable macros parsing
	directivesParser:directivesParser  // provide directives parser
};

marked("# hello\n\n{{ to.replace }}", opt);

```

## deep-marked macros managements

deep-marked define the 3 defaults render methods for you.

### substitution macros
The replace_macro simply look in provided options if there is a 'context' property.
It seeks in it after property pointed by path provided between macros boundaries (i.e. {{ my.path.from.context }}) and return it.

```javascript 
require("deep-marked/index");	// load deep.marked : language is defined there
deep.marked("{{ address.zip }}", { context:{ address:{ zip:"1190" }}})
```
will return '1190'.

### Block macros generality

There is three things important to know : 
* either the directive name reflect a macros defined in deep.marked.macros, and it will be used to render the macros. (see below to defining such macros)
* either the directive name is "unknown" (there is no associated macros in deep.marked.macros), and then deep-marked produce a tag with the name of the unknown directive. (i.e.  `<myDirective>content</myDirective>`)
* directives are composed together, from right to left.

And obviously blocks could be embedded in other blocks, and block could contains any other macros rules.

Example:

With :
```javascript
deep.marked.macros.myDirective = function(args, content, options)
{
	return args[0] + " : " + content.toUpperCase();
};
```
and this :
```
{% myTag myDirective( hello world )
	My content...
%}

```
It will output : `<myTag>hello world : MY CONTENT...</myTag>`


#### Difference between parsed and raw block-macros 

Remarque : It comes from meta language itself.

```
{% myTag
__this is strong__ @.myOtherTag( my content )
%}
```
output : `<myTag><strong>this is strong</strong><myOtherTag>my content</myOtherTag></myTag>`

```
{! myTag
__this is strong__ @.myOtherTag( my content )
!}
```
output : `<myTag>__this is strong__ @.myOtherTag( my content )</myTag>`


## Compilation and reusability

Another addition to marked parser is that you could now compile markdown documents to reuse it several times.

```javascript
require("deep-marked/index");	// load deep.marked : contains language definition
var template = deep.marked.compile("		{{ name }} says : @.hello(world)");
template({ name:"John" });
// will output <p>John says : <hello>world</hello></p>
```

Remarque : the compile function comes from custom marked parser (deep-marked/lib/marked) so it could be used without deep-marked language or macros.

## Clients

Clients will load markdown documents (deep-marked flavoured), compile it and keep them in cache (deep media cache) for further usage.

Two implementations are there for the moment : jquery/ajax or nodejs/fs.
Under nodejs, there is some file watching that update cache if file change.

Browser (jq-ajax) example : 
```javascript 
require("deep-marked/lib/clients/jq-ajax"); // load deep.marked : contains language definition
deep.marked.JQAjax("myProtocol");
//...
deep("myProtocol::/my/markdown/file.mkd").run(null, { my:{ vars:true }}).log();
// will output the result
```

Nodejs (fs) example : 
```javascript 
require("deep-marked/lib/clients/nodejs"); // load deep.marked : contains language definition
deep.marked.Nodejs("myProtocol");
//...
deep("myProtocol::/my/markdown/file.mkd").run(null, { my:{ vars:true }}).log();
// will output the result
```

## Remarque

The language and the meta-language proposed there is a base for future reflexions.
It is already greatfuly usable, but as it want to be opened, lot of things are possible...
If you want to contribute, you're welcome...;)

## Licence

LGPL 3.0
