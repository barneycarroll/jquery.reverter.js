jquery.reverter.js
==================

Keeps an element's attributes versioned to save or reset dynamic manipulations (eg data-*, style). Useful for UIs that don't have a comprehensive view-model binding (like Backbone auto-update) but want to offer some loose state control to the DOM.

## Version control for the DOM

What with the rise of ['MVC'](http://addyosmani.com/blog/digesting-javascript-mvc-pattern-abuse-or-evolution/) frameworks like [Angular](angularjs.org), a lot of dynamically modified web pages will often be (somewhat ironically) tightly coupled to an underlying model, such that no modification to the DOM is possible without a corresponding internal state being modified. But there are situations where this is undesirable — the interface might be so free-floating that no dataset could or should seek to describe it comprehensively.

Sometimes, you'll still want to do dynamic modifications to an element on the fly with no reference to an internal state, but want to be able to save those states, and revert them later on.

This is what most versioning software does — it doesn't pretend to understand how or why you're doing what you're doing, but it knows what files have changed and it can track that. This is what this does. To your web page.

## How?

*reverter* is a jQuery plugin that uses the [data()](http://api.jquery.com/data/) method to save an element's state at will, and switch between those states. It exposes two key methods:

##### `$(…).commit()`

Creates a new changeset storing all attributes and values for each element in the selection.

##### `$(…).revert()`

Reverts each versioned element in the selection to their last changeset.

Both take an optional parameter which takes the form of an object with any number of the following properties:

##### `unchain`

Boolean, defaulting to false, which returns the jQuery object as per standard jQuery API. Truthy returns the current changeset's index instead — useful for advanced statefulness.

##### `attributes`

String or RegExp, defaulting to `/.+/` (global wildcard). Only attributes matching the value will be commited or reverted. 

##### `changeset`

Integer. Specifies a given changeset to overwrite or revert to. Defaults to last for reversion and pushing a new one on commit.

## Why?

A few examples:

### Save / undo

An interface with attributes that can take various freeform style modifications from the user, for instance a DOM-drawing tool. Allow the user to save their modifications by taking snapshots of the `style` attribute and undo (undo the undo, why not!) at will.

### Loose form statefulness

A web page representing an interactive data-set that isn't tightly bound to back-end data, for instance a long form (possibly with advanced widgets via `data-*` attributes?). There's a 1:1 relationship between certain data points and their representation as elements but there's no granular REST service, and the app doesn't warrant applying a strict front-end controller. Put in just as much statefulness as necessary without writing an MVC interface, and collect the data on submit.

### Web development

You've opened up the web inspector or Firebug and started fiddling about randomly, and have gotten to a stage where things look OK. Commit the elements in question. Fiddle about some more. Commit. Fiddle. Elements X and Y are screwed up — they were better off with your original changes. Revert them back to commit 1, etc, etc. Repeat. 
