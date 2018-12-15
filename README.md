# smartkeys.js

IDE style Smart Keys in the Browser!

Just the basics to help technical users feel at home while filling out text.


**Demo**

<p align="center">
    <img src="https://imgur.com/TTozrpR">
</p>


### Note on `textarea` usage in FireFox

There is an active [bug in Firefox](https://bugzilla.mozilla.org/show_bug.cgi?id=1220696) which prevents the HTML Editing APIs from working correctly. `contenteditables` work fine, the issue is constrained to `textareas`. There is a fallback mode which enables the smartkey features, but with the caveat that undo _does not work_ due to the Firefox issue.


## Quick Start

Create a handler by supplying the `smartKeys` constructor with a configuration map specifying the behavior you want enabled.

```
const smartkeysHandler = smartKeys.fromConfig(smartKeys.defaults);
```

Next, attach that handler to the `keydown` event of either a `contenteditable` DOM node, or a `textarea`.

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

## Configuring Smartkeys behavior.

Smartkeys 0.1.0 has two main flavors: `wrappables`, and `pairables`.



Smartkeys uses a configuration map to know which inputs to wrap / pair. It comes with a set of 'sane' defaults, but you can enable just those behaviors you want or supply a totally custom map yourself.




