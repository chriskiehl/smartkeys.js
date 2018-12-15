/**
 * A wee bit of Basic "Smart Keys" style behavior for
 * ContentEditables and textareas.
 */


/**
 * Returns a new function that is the composition
 * of calling all functions in succession e.g. h(g(f()))
 */
const comp = (...fs) => (arg) => {
  return fs.reduce((result, f) => f(result), arg);
};


/**
 * Returns a new function which inverts the output
 * of the original function
 */
const not = (f) => (...args) => (
  !f.apply(this, args)
);


/**
 * Partially apply arguments to f starting right to left.
 */
const partialRight = (f, ...args) => (...remaining) => (
  f.apply(this, [...remaining, ...args])
);


/**
 * Partially apply arguments to f starting left to right.
 */
const partial = (f, ...args) => (...rest) => (
  f.apply(this, [...args, ...rest])
);


/**
 * Apply all fs to the input (left to right)
 */
const threadto = (input, ...fs) => (
  comp.apply(this, fs)(input)
);


/**
 * Returns a new object containing only those entries
 * whose key is in keys
 */
const selectKeys = (obj, keys) => (
  Object.keys(obj)
    .filter(key => keys.indexOf(key) > -1)
    .reduce((output, key) => {
      output[key] = obj[key]
      return output;
    }, {})
);


const makeCharMatcher = (charset) => {
  // console.log(charset)
  // const charmap = charset.reduce((acc, val) => {
  //   acc[val] = val;
  //   return acc;
  // }, {})

  return (input) => {
    console.log('charmater?', input.key, input.key in charset);
    return input.key in charset
  };
}



/**
 * check if there are any active ranges under the current selection
 */
const hasSelection = (event) => (
  window.getSelection().rangeCount > 0
);


const isCollapsed = (event) => (
  window.getSelection() && window.getSelection().getRangeAt(0).collapsed
)

const isSingleCursor = (event) => (
  // Textareas have a totally different selection API from contenteditables.
  // we have to manually check that the startPosition and endPosition
  // of the selection are the same rather than call .collapsed.
  event.target.selectionStart === event.target.selectionEnd
)



const getSelection = (event) => (
  window.getSelection()
);

const spantag = (contents, id) => (
  `<span id='${id}'>${contents}</span>`
);



/**
 * Get whatever text (if any) is currently selected in the document
 */
const getSelectedText = () => (
  window.getSelection().toString()
);


/**
 * Wrap the text with the supplied bookends.
 */
const wrapText = (text, open, close) => (
  `${open}${text}${close}`
);


/**
 * Generate a random id
 */
const randomId = () => (
  Math.random()
);


/**
 * Naively Convert the next to basic HTML by replacing
 * newlines with <br> tags
 */
const text2html = (text) => (
  text.replace(/[\r\n]+/gm, '<br>')
);


/**
 * Quick and dirty bootleg container type for composing together
 * event filters and apply effects to matches because if/else blocks?!
 * TOO understandable.
 */
const Match = (event) => ({
  isMatch: () => true,
  filter: (pred) => pred(event) ? Match(event) : NoMatch(event),
  effect: (f) => {
    f(event);
    return Match(event)
  },
  event
});


/**
 * Sibling to `Match`. Holds the event when a miss occurs so that it can
 * be chained to later computation.
 */
const NoMatch = (event) => ({
  isMatch: () => false,
  filter: (pred) => NoMatch(event),
  effect: (f) => NoMatch(event),
  event
});


/**
 * OR combinator for Match object.
 * If the first doesn't match, try the second
 */
const or = (matcher1, matcher2) => (event) => {
  const result = matcher1(event)
  if (result.isMatch()) {
    return result
  } else {
    console.log('second branch of OR')
    return matcher2(event)
  }
};


/**
 * AnyOf combinator for composing together multiple Match statements into
 * one big OR clause.
 */
const anyOf = (...matchers) => (
  matchers.reduce(or)
);


/**
 * Checks whether or not the event target is against a Textarea DOM element.
 */
const isTextarea = (event) => (
  event.target.tagName.toLowerCase() === 'textarea'
);


/**
 * Checks whether or not the event target is a contentEditable
 */
const isContenteditable = (event) => (
  event.target.isContentEditable
);


const preventDefault = (event) => (
  event.preventDefault()
);


/**
 * Select the text nodes contained in the matched ID
 * +/- 1 to offset of wrapped insertions.
 */
const reselectWrappedText = (id) => {
  const selection = window.getSelection();
  const range = selection.getRangeAt(0);
  const elm = document.getElementById(id);
  const firstChild = elm.firstChild;
  const lastChild = elm.lastChild;
  const text = lastChild.data;

  // offset by +/- 1 to account for the wrapping character
  // which were inserted.
  range.setStart(firstChild, 1);
  range.setEnd(lastChild, text.length - 1);
  selection.addRange(range)
};

/**
 * Handles incoming keydown events and applies Smart Key wrapping behavior
 * on any user enabled 'wrappable' chars.
 *
 * Works in a bit of a bootleg fashion.
 * The DOM selection API is a giant ball of deplorable, and makes it very tough
 * to keep track of your location while modifications occur (like inserting
 * characters). To get around this, we stamp a span tag with a known ID when
 * we make the `Insert` call to the Edit API. This gives a concrete anchor
 * against which we can find ourselves again.
 */
const makeContentEditableWrapHandler = (config) => (event) => {
  const {open, close} = config.wrappable[event.key];
  const startid = randomId();
  const wrappedHtml = threadto(
    getSelectedText(),
    partialRight(wrapText, open, close),
    text2html,
    partialRight(spantag, startid)
  );

  document.execCommand('insertHTML', false, wrappedHtml);
  reselectWrappedText(startid);
}


/**
 * Handles incoming keydown events and applies Smart Key pairing behavior
 * to any Pairable chars specified in the `config`.
 *
 * Includes similar amounts of jankiness to the wrapping handler. Spans are
 * used to keep track of the location in the content editable after
 * text insertion.
 */
const makeContentEditablePairHandler = (config) => (event) => {
  const {open, close} = config.pairable[event.key];
  const selection = window.getSelection();
  const range = selection.getRangeAt(0);
  const randomid = window.performance.now();
  const pair = `<span id='${randomid}'>${open}${close}</span>`;
  event.preventDefault();
  document.execCommand('insertHTML', false, pair);
  elm = document.getElementById(randomid);
  range.setStart(elm.firstChild, 1);
  range.collapse(true);
  selection.addRange(range);
};







/**
 * Handle a 'pairable' smart keys event for textareas by inserting the
 * appropriate closing character.
 *
 * Note: no efficiency is chased here. It naively concats strings to
 * make the magic happen.
 */
const makeTextareaPairHandler = (config) => (event) => {
  const textarea = event.target;
  const startPos = textarea.selectionStart;

  const {open, close} = config.pairable[event.key];

  if (config.firefoxFallbackMode) {
    // Fallback mode manually injects the pair via the DOM API
    // rather than the Edit APIs which are currently broken due
    // to a bug in Firefox.
    const original = textarea.value;
    const left = original.substr(0, startPos);
    const right = original.substr(startPos);
    textarea.value = `${left}${open}${close}${right}`;
  } else {
    document.execCommand('insertText', false, '[]')
  }
  // adjust the selection to account for the
  // offset created by the newly inserted text.
  textarea.selectionStart = startPos + 1;
  textarea.selectionEnd = startPos + 1;
};


/**
 * Handle a 'wrappable' smart keys event against a textarea.
 *
 * Note: no efficiency is chased here. It naively concats strings to
 * make the magic happen.
 */
const makeTextareaWrapHandler = (config) => (event) => {
  const textarea = event.target;
  const startPos = textarea.selectionStart;
  const endPos = textarea.selectionEnd;
  const {open, close} = config.wrappable[event.key];

  const fullText = textarea.value;
  const selectedText = fullText.substr(startPos, endPos - startPos);

  if (config.firefoxFallbackMode) {
    const left = fullText.substr(0, startPos);
    const right = fullText.substr(endPos);
    textarea.value = `${left}${open}${selectedText}${close}${right}`;
  } else {
    document.execCommand('insertText', false, `${open}${selectedText}${close}`)
  }
  textarea.selectionStart = startPos + 1;
  textarea.selectionEnd = endPos + 1;
};




const textareaHandlers = (config) => ({
  pairable: (event) => (
    Match(event)
      .filter(isTextarea)
      .filter(isSingleCursor)
      .filter(makeCharMatcher(config.pairable))
      .effect(preventDefault)
      .effect(makeTextareaPairHandler(config))
  ),
  wrappable: (event) => (
    Match(event)
      .filter(isTextarea)
      .filter(not(isSingleCursor))
      .filter(makeCharMatcher(config.wrappable))
      .effect(preventDefault)
      .effect(makeTextareaWrapHandler(config))
  )
});


const contenteditableHandlers = (config) => ({
  pairable: (event) => (
    Match(event)
      .filter(isContenteditable)
      .filter(hasSelection)
      .filter(isCollapsed)
      .filter(makeCharMatcher(config.pairable))
      .effect(preventDefault)
      .effect(makeContentEditablePairHandler(config))
  ),
  wrappable: (event) => (
    Match(event)
      .filter(isContenteditable)
      .filter(hasSelection)
      .filter(not(isCollapsed))
      .filter(makeCharMatcher(config.wrappable))
      .effect(preventDefault)
      .effect(makeContentEditableWrapHandler(config))
  )
});



const defaults = {
  firefoxFallbackMode: false,
  wrappable: {
    '"': {open: '"', close: '"'},
    '[': {open: '[', close: ']'},
    '(': {open: '(', close: ')'},
    '{': {open: '{', close: '}'},
    '~': {open: '~', close: '~'},
    '`': {open: '`', close: '`'}
  },
  pairable: {
    '"': {open: '"', close: '"'},
    '[': {open: '[', close: ']'},
    '(': {open: '(', close: ')'},
    '{': {open: '{', close: '}'},
  }
};


/**
 * Merge the user provided settings into a final config object
 */
const finalizeConf = (conf, defaults) => {
  const baseline = {
    firefoxFallbackMode: conf.firefoxFallbackMode || false,
    // if they selected any options via wrap/pair
    // merge those into the main dicts
    wrappable: selectKeys(defaults.wrappable, conf.wrap || []),
    pairable: selectKeys(defaults.pairable, conf.pair || [])
  };

  // if they provided explicit wrappable / pairable
  // keys then these trump all previous options
  if (conf.wrappable) {
    baseline.wrappable = conf.wrappable
  }
  if (conf.pairable) {
    baseline.pairable = conf.pairable
  }
  return baseline
};


const fromConfig = (conf) => {
  const settings = finalizeConf(conf, defaults);

  const ceHandler = contenteditableHandlers(settings);
  const taHandler = textareaHandlers(settings);

  const handlers = [
    ceHandler.wrappable,
    ceHandler.pairable,
    taHandler.wrappable,
    taHandler.pairable
  ].reduce(or);

  return {
    handleKeydown: handlers
  }
};


const smartKeys = {fromConfig, defaults};

exports = {
  smartKeys
};
