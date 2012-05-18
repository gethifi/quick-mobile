/**
 * jQuery Quick Mobile
 *
 * @author      Joel Sutherland <joel@newmediacampaigns.com>
 * @copyright   2012 Joel Sutherland
 * @version     1.0
 * @package     Quick Mobile
 *
 * MIT LICENSE
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
(function($) {
    $.quickMobile = function(element, options) {
        /**
         * Defaults
         */
        var defaults = {
            log: false,
            dimClass: 'empty',
            splashId: 'splash',
            templateClass: 'script-template',
            defaultTemplateKey: '/index',
            enableCaching: true,
            scrollTop: 1,
            retrieve: function (hashVal, callback) {
                var result = 'Default Retrieve Function for ' + hashVal;
                callback(result);
            },
            render: function (hashVal, result, $wrapper, templates) {
                $wrapper.html(result);
                log('settings render');
                var tmplkey = plugin.settings.selectTemplateKey(hashVal, result, templates);
                var $tmpl = templates[tmplkey];
                log('selected template: ' + tmplkey);
                $.tmpl($tmpl, result).appendTo($wrapper);
                if ( plugin.settings.templateCallbacks[tmplkey] ) {
                    plugin.settings.templateCallbacks[tmplkey]();
                }
            },
            cache: function (hashVal, result) {
                var newitems = {};
                newitems[hashVal] = result;
                return newitems;
            },
            selectTemplateKey: function (hashVal, result, templates) {
                log('default template selection process');
                if ( templates[hashVal] ) {
                    return hashVal;
                }
                return plugin.settings.defaultTemplateKey;
            },
            templateCallbacks: {}
        };

        var plugin = this;

        // inside: plugin.settings.propertyName from inside the plugin or
        // outside: $element.data('quickMobile').settings.propertyName
        plugin.settings = {};
        plugin.history = [];
        plugin.cache = {};
        plugin.templates = {};

        var $contentHolder = $(element),  // reference to the jQuery version of DOM element the plugin is attached to
             contentHolder = element;     // reference to the actual DOM element

        // the "constructor" method that gets called when the object is created
        plugin.init = function () {
            $('html, body').animate({ scrollTop: 1 }, 'slow');
            plugin.settings = $.extend({}, defaults, options);

            log('starting');

            if ( window.location.hash.length < 3 ) {
                window.location.hash = '#!/';
            }

            $(window).bind('hashchange', function () {
                $contentHolder.trigger('quickMobile.change');
            });

            plugin.registerTemplates();
            plugin.change();
        };

        //public events
        $contentHolder.bind('quickMobile.change', function () {
            $(this).data('quickMobile').change();
        });

        // public methods
        // inside: plugin.methodName(arg1, arg2, ... argn)
        // outside: $element.data('pluginName').publicMethod(arg1, arg2, ... argn)

        plugin.change = function () {
            var hashVal = getHashValue();
            log('hash changed to ' + hashVal);
            plugin.history.push(hashVal);
            retrieve(hashVal);
        };

        plugin.reload = function () {
            var hashVal = getHashValue();
            log('reloading ' + hashVal);
            retrieve(hashVal);
        };

        plugin.registerTemplates = function () {
            log('scanning templates');
            $('.' + plugin.settings.templateClass).each(function(){
                var $tmpl = $(this);
                var path = $tmpl.data('path');
                log('Found Template: ' + path);
                plugin.templates[path] = $tmpl.template();
            });
        };

        // private methods
        // inside: methodName(arg1, arg2, ... argn)

        var retrieve = function (hashVal) {
            dim();
            if ( plugin.cache[hashVal] && plugin.settings.enableCaching ) {
                log('from cache');
                render(plugin.cache[hashVal]);
            } else {
                plugin.settings.retrieve(hashVal, function (result) {
                    render(result);
                    cache(hashVal, result);
                });
            }
        };
        var render = function (result) {
            log(result);
            var $splash = $('#' + plugin.settings.splashId);
            if ( $splash.length > 0 ) {
                log('hiding splash');
                $splash.fadeOut(function () {
                    $splash.remove();
                });
            }
            plugin.settings.render(getHashValue(), result, $contentHolder, plugin.templates);
            unDim();
        };
        var cache = function (hashVal, result) {
            if ( plugin.settings.enableCaching ) {
                log('caching enabled');
                var newitems = plugin.settings.cache(hashVal, result);
                $.extend(plugin.cache, newitems);
            }
        };

        // contentHolder methods

        var dim = function () {
            $contentHolder.addClass(plugin.settings.dimClass);
            $('html, body').animate({ scrollTop: plugin.settings.scrollTop }, 'slow');
        };
        var unDim = function(){
            $contentHolder.removeClass(plugin.settings.dimClass);
        };

        // private utilities

        var log = function (message) {
            if ( plugin.settings.log && typeof console !== "undefined" && typeof console.log !== "undefined" ) {
                console.log('quickMobile: ' + message);
            }
        };

        var getHash = function () {
            return window.location.hash;
        };

        var getHashValue = function () {
            if ( getHash().indexOf('#!/') === 0 ) {
                return getHash().substring(2);
            } else {
                return -1;
            }
        };

        var setHashValue = function (value) {
            window.location.hash = '#!' + value;
        };

        // call the "constructor" method
        plugin.init();
    };

    // add the plugin to the jQuery.fn object
    $.fn.quickMobile = function (options) {
        return this.each(function () {
            if ( undefined === $(this).data('quickMobile') ) {
                var plugin = new $.quickMobile(this, options);
                $(this).data('quickMobile', plugin);
            }
        });
    };
})(jQuery);