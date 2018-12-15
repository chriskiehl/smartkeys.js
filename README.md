# smartkeys.js

IDE style [Smart Keys](https://www.jetbrains.com/help/idea/settings-smart-keys.html) in the Browser!

<p align="center">
    <img src="https://user-images.githubusercontent.com/1408720/50046778-de1e5880-005d-11e9-9e64-6c161ab32156.gif">
</p>


## What's it do? 

A tiny experimental library for adding "Insert Pair' and "Surround Selection" SmartKey behaviors to any ContentEditable DOM node or Textarea. 


## Quick Start

The fastest way to get started is to create a handler using the deafults shipped with `smartKeys`. 

```
const smartkeysHandler = smartKeys.fromConfig(smartKeys.defaults);
```

Next, attach the handler to the `keydown` event of either a `contenteditable` DOM node, or a `textarea`.

```
const someEditableDOMElement = document.getElementById('some-id')
someEditableDOMElementaddEventListener('keydown', smartkeysHandler.handleKeydown);
```

or in React flavors:

```
render() {
  return (
    <div contenteditable={true} onKeydown={smartkeyshandler.handleKeydown}
  )
}
```

And that's it!

## Configuring Smartkeys behavior.

You may not want all the character mappings used in the Smartkeys defaults. To enable just a subset of the keys, you can specify `wrap` and `pair` arguments to the smartkeys constructor. 

```
const handler = smartkeys.fromConfing({wrap: ['{', '"'], pair: ['(']})
```

**Defining custom key behaviors**

If you want complete control, you can specify your own mappings. Smartkeys 0.1.0 has two main flavors: `wrappables`, and `pairables`. The former define what happens when there is an active text selection during a keydown event, the latter handles the "collapsed" / no selection case. These are both just simple maps containing `open` and `close` values for a given character key. 

```javascript
wrappable: {'(': {open: '(', close: ')'}},
pairable: {'`': {open: '`', close: '`'}}
```

For example, if you wanted to enable bold and italic style markdown controls, you could supply custom `*` and `_` character maps in the `wrappable` section. 

```
const markdownControls = {
    wrappable: {
        '*': {open: '*', close: '*'}  // wraps selection in *bold*
        '_': {open: '__', close: '__'}  // wraps selection in markdown style __italics__
    }
}    

const handler = smartkeys.fromConfing(markdownControls)
```

Now typing the `*` character with a section of text selected would automatically wrap it \*\*like this\*\*. 


### Browser Support: 

Loosely and informally tested on Firefox, Chrome, and Edge. Theoretically it works on any browser that supports the HTML Edit APIs (with the exception below). 


**`textarea` usage in FireFox**

There is an active [bug in Firefox](https://bugzilla.mozilla.org/show_bug.cgi?id=1220696) which prevents the HTML Editing APIs from working correctly. `contenteditables` work fine, the issue is constrained to `textareas`. Smartkeys includes a fallback mode for Firefox (`{firefoxFallbackMode': true}`) which will enable functionality using alternative APIs. However, the caveat there is that undo _does not work_ due to _other_ Firefox issues.


### State of the Project 

Smartkeys is a quick dump from work on an unrelated editor project. It took me quite awhile to navigate using the incredibly strange and stateful Selection and [Range](https://developer.mozilla.org/en-US/docs/Web/API/Range) javascript APIs, so thought breaking out this little piece on its own may be of some value to others from an example / how-to point of view.

It satisfies a few narrow use cases, is written for the happy path, and makes for a fun toy. Probs shouldn't be used in production without a thorough vetting for quirks and a bit of battle hardening!  

Baring unexpected interest in this niche littel fella, it'll remain in its current state. 
