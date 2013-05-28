// This function is injected into the page, and cannot reference anything
// outside its body.
function injectedFix() {
  // map e.g. 'fontWeight' to 'font-weight'.
  function cssToDom(name) {
    return name.replace(/[A-Z]/g, function(x) {
      return '-' + x.toLowerCase();
    });
  }

  var allFixes = {
    fontFamily: 'Open Sans',
    fontWeight: 'normal',
    fontSize: '16px',
    color: 'rgb(0, 0, 0)'
  };

  // Find the selected element.
  var sel = window.getSelection();
  var node = sel.focusNode;
  while (node.nodeType != Node.ELEMENT_NODE) {
    node = node.parentNode;
  }

  var newRules = [];
  for ( ; node; node = node.parentNode) {
    var rules = window.getMatchedCSSRules(node);
    if (!rules)
      continue;

    for (var i = 0; i < rules.length; ++i) {
      var rule = rules[i];
      var fixes = [];
      for (var attr in allFixes) {
        if (rule.style[attr] && rule.style[attr] != allFixes[attr]) {
          fixes.push(cssToDom(attr) + ':' + allFixes[attr]);
        }
      }

      if (!fixes.length)
        continue;

      var newRule = rule.selectorText + '{';
      for (var j = 0; j < fixes.length; ++j) {
        newRule += fixes[j] + ';';
      }
      newRule += '}';
      newRules.push(newRule);
    }
  }

  var style = document.createElement('style');
  style.innerText = '@import url(https://fonts.googleapis.com/css?family=Open+Sans);';
  for (var i = 0; i < newRules.length; ++i) {
    style.innerText += newRules[i];
  }
  document.head.appendChild(style);
}

function fix(info, tab) {
  chrome.tabs.executeScript(tab.id, {
    code: ('(' + injectedFix.toString() + ')()')
  });
}
chrome.contextMenus.onClicked.addListener(fix);

var ID = 'stylefix-id';
chrome.runtime.onInstalled.addListener(function() {
  chrome.contextMenus.create({
    id: ID,
    title: 'Make readable'
  });
});
