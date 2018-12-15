# smartkeys.js

IDE style Smart Keys in the Browser!

Just the basics to help technical users feel at home while filling out text.


Demo

<p align="center">
    <img src="https://imgur.com/TTozrpR">
</p>


### note on `textarea` usage in FireFox

There is an active [bug in Firefox](https://bugzilla.mozilla.org/show_bug.cgi?id=1220696) which prevents the HTML Editing APIs from working correctly. `contenteditables` work fine, the issue is constrained to `textareas`. There is a fallback mode which enables the smartkey features, but with the caveat that undo _does not work_ due to the Firefox issue.


### If using with React

smartkeys should be attached to the `onKeydown` handler.


```
const enhanceSmarts = smartkeys.fromConfig(smartkeys.defaults)

...

render() {
  return (
    <div contenteditable={true} onKeydown={enhanceSmarts} />
  )
}

```


### Installation

```npm install smartkeys.js```


### Quick Start






