/* globals $ */

// ==UserScript==
// @name         sasotu
// @version      2024-04-29
// @description  Surface any Schema.Org to user
// @author       Matt Peperell
// @match        *://*/*
// @require http://code.jquery.com/jquery-latest.js
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tampermonkey.net
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    var count = 0;

    function propertiesToHTMLString(props) {
        console.log("stringifying properties. context is " + JSON.stringify(props))
        var result = ""
        if (props.length >0) {
            console.log("we found some properties to convert")
            result = "<ul>"

            props.forEach(prop => {
                console.log("a prop: " + prop + ", type is " + typeof(prop))
                //var k = Object.keys(prop)[0]
                //var v = Object.values(prop)[0]
                if (typeof(v) === "object") {
                    result += "<li><b>(nested)" + k +"</b> "+propertiesToHTMLString(prop)
                } else {
                    //result += "<li><b>" + k +"</b> "+v
                                       result += "<li>"+JSON.stringify(prop)

                }
            })
        //if (props.length >0) {
            result += "</ul>"
        //}
        }
        console.log("stringified properties: " + result)
        return result
    }

    function generateInsert(type, content) {
        count += 1;

        var ins = '<button class="sasotu" popovertarget="sasotu-' + count + '">S:' + type + '</button>'
        ins += '<div id="sasotu-' + count + '" popover style="background: #333;color: white;">'
        ins += '<button class="close-btn" popovertarget="sasotu-' + count + '" popovertargetaction="hide"><span aria-hidden=”true”>❌</span><span class="sr-only">Close</span></button>'
        //ins += '<p>' + propertiesToHTMLString(content) + '</p>'
               ins += '<p>' + (content) + '</p>'

        ins += '</div>'
        return ins
    }

    function captureProperties(element) {
        console.log("entering captureProperties")
        console.log("--context is: " + JSON.stringify($(element).contents()))

        var props = []
        var prop
        console.log("going to get the itemprop attr of element, element contains >" + $(element).text() + "< if we get an error then see why")
        /*if (element.hasOwnProperty('itemprop') === false ) {
            console.log('this element does not have an itemprop')
            prop = null
        }
        else {*/
            prop = $(element).attr('itemprop')
        //}
        console.log("looking for children")
        var children = $(element).children()

        if (children.length === 0) {
            console.log("we had no children")
            if (prop !== undefined && prop !== '' && prop !== null ) {
                // this will not work for nested structures (need to check for itemtype/itemscope), although since in this section
                // we know there are zero children then there can be no subvalues
                console.log("found property: " + prop)
                return {[prop]: element.text()}
            }
            return
        }
        children.each(function() {
            console.log("we are looking at " + JSON.stringify(element) + " and are going to recurse into a child: " + JSON.stringify($(this)))
            var val = captureProperties($(this))
            if (val === null && val === undefined) {
                //return null
            }
            if (val !== null) {
                console.log("adding a property: " + val)
                props.push(val)
            }

        })
        if (props.length === 0) {
            return null
        }
        return props
    }

    var elements = $('*[itemtype][itemscope]');
    console.log("interesting elements: " + JSON.stringify(elements['0']))
    elements.each(function() {
        console.log("new top level element is " + JSON.stringify(this))
        var type = new URL($(this).attr('itemtype')).pathname.split('/').at(-1)
        var content = "<b>" + type + "</b>"
        var props = captureProperties(this) // propertiesToHTMLString(captureProperties(this)) // JSON.stringify(captureProperties($(this))) //
        props = propertiesToHTMLString(props)
        var el = generateInsert(type, content + '<i>' + props+'</i>')

        $(this).prepend(el);
    });
    console.log("sasotu ran!")

})();