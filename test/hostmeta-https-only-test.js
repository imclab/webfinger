// hostmeta-json-test.js
//
// Test flag to refuse falling back to http for hostmeta
//
// Copyright 2012, StatusNet Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var assert = require("assert"),
    vows = require("vows"),
    express = require("express"),
    wf = require("../lib/webfinger");

var suite = vows.describe("Flag to prevent falling back to http");

suite.addBatch({
    "When we run an HTTP app that just supports host-meta with JRD": {
        topic: function() {
            var app = express(),
                callback = this.callback;
            app.get("/.well-known/host-meta.json", function(req, res) {
                res.json({
                    links: [
                        {
                            rel: "lrdd",
                            type: "application/json",
                            template: "http://localhost/lrdd.json?uri={uri}"
                        }
                    ]
                });
            });
            app.on("error", function(err) {
                callback(err, null);
            });
            app.listen(80, function() {
                callback(null, app);
            });
        },
        "it works": function(err, app) {
            assert.ifError(err);
        },
        teardown: function(app) {
            if (app && app.close) {
                app.close();
            }
        },
        "and we get its host-meta data with the HTTPS-only flag": {
            topic: function() {
                var callback = this.callback;
                wf.hostmeta("localhost", {httpsOnly: true}, function(err, jrd) {
                    if (err) {
                        callback(null);
                    } else {
                        callback(new Error("Unexpected success!"));
                    }
                });
            },
            "it fails correctly": function(err) {
                assert.ifError(err);
            }
        }
    }
});

suite["export"](module);
