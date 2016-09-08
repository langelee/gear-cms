Vue.directive("slot", {
    bind: function() {
        var host = this.vm;
        var root = host.$root;
        var raw = host._context._directives.filter(function(value) {
            return !(value.Component === undefined);
        })[0].el;

        for(var i = 0; i < raw.children.length; i++) {
            var node = raw.children[i].cloneNode(true);
            this.el.appendChild(node);
            root.$compile(node, host, this._scope);
        }
    }
});

var util = Vue.util;

Vue.directive("drag", {
    bind: function() {

        var self = this;

        this.data = {};

        this.dragstart = function(e) {

            e.dataTransfer.effectAllowed = "all";

            e.dataTransfer.setData("data", JSON.stringify(self.data));
            e.dataTransfer.setData("tag", self.arg);

            return false;

        };

        this.dragend = function(e) {
            return false;
        };

        this.el.setAttribute("draggable", true);

        util.on(this.el, "dragstart", this.dragstart);
        util.on(this.el, "dragend", this.dragend);

    },
    unbind: function() {

        this.el.setAttribute("draggable", false);

        util.off(this.el, "dragstart", this.dragstart);
        util.off(this.el, "dragend", this.dragend);

    },
    update: function(value, old) {
        this.data = value;
    }
});

Vue.directive("drop", {
    acceptStatement: true,
    bind: function() {

        var self = this;

        this.dragenter = function(e) {

            self.el.className = "dragActive";

            return false;

        };

        this.dragover = function(e) {

            if(e.preventDefault) {
                e.preventDefault();
            }

            self.el.className = "dragActive";

            e.dataTransfer.effectAllowed = "all";
            e.dataTransfer.dropEffect = "copy";

            return false;

        };

        this.dragleave = function(e) {

            self.el.className = "";

            return false;

        };

        this.drop = function(e) {

            if(e.preventDefault) {
                e.preventDefault();
            }

            self.el.className = "";

            var tag = e.dataTransfer.getData("tag");
            var data = e.dataTransfer.getData("data");

            self.handler(tag, JSON.parse(data));

            return false;

        };

        util.on(this.el, "dragenter", this.dragenter);
        util.on(this.el, "dragleave", this.dragleave);
        util.on(this.el, "dragover", this.dragover);
        util.on(this.el, "drop", this.drop);

    },
    unbind: function() {

        util.off(this.el, "dragenter", this.dragenter);
        util.off(this.el, "dragleave", this.dragleave);
        util.off(this.el, "dragover", this.dragover);
        util.off(this.el, "drop", this.drop);

    },
    update: function(value, old) {

        var vm = this.vm;

        this.handler = function(tag, data) {

            vm.$droptag = tag;
            vm.$dropdata = data;

            var res = value(tag, data);

            vm.$droptag = null;
            vm.$dropdata = null;

            return res;

        };

    }
});