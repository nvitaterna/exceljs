/**
 * Copyright (c) 2014 Guyon Roche
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:</p>
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */
"use strict";

var fs = require("fs");
var Promise = require("bluebird");
var _ = require("underscore");
var Archiver = require("archiver");
var unzip = require("unzip");
var Sax = require("sax");
var MemoryStream = require("memorystream");

var utils = require("../utils");
var colCache = require("../colCache");
var Enums = require("../enums");
var Dimensions = require("../dimensions");

var XLSX = module.exports = function(workbook) {
    this.workbook = workbook;
}

XLSX.RelType = {
    OfficeDocument: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument",
    Worksheet: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet",
    CalcChain: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/calcChain",
    SharedStrings: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings",
    Styles: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles",
    Theme: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme",
    Hyperlink: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink"
};


XLSX.prototype = {
//=============================================================================
// Shared Strings
    //
    //createInputStream: function() {
    //    var self = this;
    //    var parser = Sax.createStream(true, {});
    //    var inT = false;
    //    var t = "";
    //    var count = 0;
    //    parser.on('opentag', function(node) {
    //        if (node.name == "t") {
    //            inT = true;
    //            t = "";
    //        }
    //    });
    //    parser.on('closetag', function (name) {
    //        if (inT && (name == "t")) {
    //            var entry = self.getEntryAt(count++);
    //            entry._value = t;
    //            self.hash[t] = entry;
    //            inT = false;
    //        }
    //    });
    //    parser.on('text', function (text) {
    //        if (inT) {
    //            t += text;
    //        }
    //    });
    //    
    //    return parser;
    //},
    //
    //read: function(stream) {
    //    var deferred = Promise.defer();
    //    var parser = this.createInputStream();
    //    parser.on('end', function (name) {
    //        deferred.resolve();
    //    });
    //    parser.on('error', function (err) {
    //        deferred.reject(err);
    //    });
    //    stream.pipe(parser);
    //    return deferred.promise;
    //},
    //
    //toBuffer: function() {
    //    var self = this;
    //    return utils.fetchTemplate("./xlsx/sharedStrings.xml")
    //        .then(function(template){
    //            var model = {
    //                count: self.totalRefs,
    //                uniqueCount: self.index.length,
    //                texts: self.index.map(function(item) { return item.value; })
    //            };
    //            return template(model);
    //        });
    //},
    //write: function(stream) {
    //    return this.toBuffer()
    //        .then(function(data) {
    //            var deferred = Promise.defer();
    //            stream.write(data, function(err){
    //                deferred.resolve(stream);
    //            });
    //            return deferred.promise;
    //        });
    //},

//=======================================================================
// Relationships
    //idTorId: function(id) {
    //    return "rId" + (id + 1);
    //},
    //rIdToId: function(rId) {
    //    return parseInt(rId.replace("rId","")) - 1;
    //},
    //
    //createInputStream: function() {
    //    var self = this;
    //    this.index = [];
    //    var parser = Sax.createStream(true, {});
    //    parser.on('opentag', function(node) {
    //        if (node.name == "Relationship") {
    //            var id = Relationship.rIdToId(node.attributes.Id);
    //    		switch (node.attributes.Type) {
    //                case OfficeDocumentRelationship.Type:
    //                    self.index[id] = new OfficeDocumentRelationship(self, id, node.attributes.Target);
    //                    break;
    //                case WorksheetRelationship.Type:
    //                    var index = parseInt(node.attributes.Target.replace("worksheets/sheet", "").replace(".xml", ""));
    //                    self.index[id] = new WorksheetRelationship(self, id, index);
    //                    break;
    //                case CalcChainRelationship.Type:
    //                    self.index[id] = new CalcChainRelationship(self, id);
    //                    break;
    //                case SharedStringsRelationship.Type:
    //                    self.index[id] = new SharedStringsRelationship(self, id);
    //                    break;
    //                case StylesRelationship.Type:
    //                    self.index[id] = new StylesRelationship(self, id);
    //                    break;
    //                case ThemeRelationship.Type:
    //                    var index = parseInt(node.attributes.Target.replace("theme/theme", "").replace(".xml", ""));
    //                    self.index[id] = new ThemeRelationship(self, id, index);
    //                   break;
    //                case HyperlinkRelationship.Type:
    //                    self.index[id] = new HyperlinkRelationship(self, id, node.attributes.Target);
    //                    break;
    //                default:
    //                    // ignore this?
    //                    break;
    //            }
    //        }
    //    });
    //    return parser;
    //},
    //read: function(stream) {
    //    var deferred = Promise.defer();
    //    
    //    var parser = this.createInputStream();
    //    parser.on('end', function(name) {
    //        deferred.resolve();
    //    });
    //    parser.on('error', function (err) {
    //        deferred.reject(err);
    //    });
    //    stream.pipe(parser);
    //    
    //    return deferred.promise;
    //},
    //
    //
    //toBuffer: function() {
    //    var self = this;
    //    return utils.fetchTemplate("./xlsx/.rels")
    //        .then(function(template){
    //            var model = {
    //                relationships: self.index
    //            };
    //            return template(model);
    //        });
    //},
    //write: function(stream) {
    //    return this.toBuffer()
    //        .then(function(data) {
    //            stream.write(data);
    //            return stream;
    //        });
    //},

 //==================================================================================
 // Worksheet
 
    // ===================
    // Read
    //_read: function(stream) {
    //    // <cols><col min="1" max="1" width="25" style="?" />
    //    // <sheetData><row><c r="A1" s="1" t="s"><f>A2</f><v>value</v></c>
    //    // <mergeCells><mergeCell ref="A1:B2" />
    //    // <hyperlinks><hyperlink ref="A1" r:id="rId1" />
    //    var deferred = Promise.defer();
    //    
    //    var self = this;
    //    var parser = Sax.createStream(true, {});
    //    
    //    var cols = [];
    //    
    //    var hyperlinks = [];
    //    
    //    var current;
    //    var c; // cell stuff
    //    parser.on('opentag', function(node) {
    //        switch (node.name) {
    //            case "col":
    //                cols.push({
    //                    // s: node.attributes.s
    //                    min: parseInt(node.attributes.min),
    //                    max: parseInt(node.attributes.max),
    //                    width: parseFloat(node.attributes.width)
    //                });
    //                break;
    //            case "c":
    //                c = {
    //                    ref: node.attributes.r,
    //                    s: parseInt(node.attributes.s),
    //                    t: node.attributes.t
    //                };
    //                break;
    //            case "f":
    //                current = c.f = { text: "" };
    //                break;
    //            case "v":
    //                current = c.v = { text: "" };
    //                break;
    //            case "mergeCell":
    //                self.mergeCells(node.attributes.ref);
    //                break;
    //            case "hyperlink":
    //                hyperlinks.push({
    //                    ref: node.attributes.ref,
    //                    rId: node.attributes["r:id"]
    //                });
    //                break;                
    //        }
    //    });
    //    parser.on('text', function (text) {
    //        if (current) {
    //            current.text += text;
    //        }
    //    });
    //    parser.on('closetag', function(name) {
    //        switch (name) {
    //            case "c":
    //                var cell = self.getCell(c.ref);
    //                // Note: merged cells (if they've been merged already will not have v or f nodes)
    //                if (c.f) {
    //                    c.v = c.v || {};
    //                    if (c.t == "str") {
    //                        cell.value = { formula: c.f.text, result: c.v.text };
    //                    } else if (c.s == 1) {
    //                        cell.value = { formula: c.f.text, result: utils.excelToDate(parseFloat(c.v.text)) };
    //                    } else {
    //                        cell.value = { formula: c.f.text, result: parseFloat(c.v.text) };
    //                    }
    //                } else if (c.v) {
    //                    if (c.t == "s") {
    //                        var index = parseInt(c.v.text);
    //                        var entry = self.sharedStrings.getEntryAt(index);
    //                        cell.value = entry;
    //                    } else if (c.s == 1) {
    //                        cell.value = utils.excelToDate(parseFloat(c.v.text));
    //                    } else {
    //                        cell.value = parseFloat(c.v.text);
    //                    }
    //                }
    //                break;
    //            case "cols":
    //                // define the columns (widths at least)
    //                if (cols.length) {
    //                    var index = 1;
    //                    var columns = self._columns = [];
    //                    _.each(cols, function(column) {
    //                        while (index++ < column.min) {
    //                            columns.push(new Column());
    //                        }
    //                        for (index = column.min; index <= column.max; index++) {
    //                            columns.push(new Column({
    //                                width: column.width
    //                            }));
    //                        }
    //                    });
    //                }
    //                break;
    //            case "worksheet":
    //                // upgrade all hyperlink cells
    //                _.each(hyperlinks, function(hyperlink) {
    //                    // Note: special case - don't addRef here since refCount will already be 1
    //                    var relationship = self.relationships.getByRId(hyperlink.rId);
    //                    
    //                    var cell = self.getCell(hyperlink.ref);
    //                    cell._upgradeToHyperlink(relationship);
    //                });
    //                
    //                // all good!
    //                deferred.resolve();
    //                break;
    //        }
    //    });
    //    parser.on('error', function (err) {
    //        deferred.reject(err);
    //    });
    //    stream.pipe(parser);
    //    
    //    return deferred.promise;
    //},
    //read: function(stream, relStream) {
    //    var self = this;
    //    if (relStream) {
    //        return this.relationships.read(relStream)
    //            .then(function() {
    //                return self._read(stream);
    //            });
    //    } else {
    //        return self._read(stream);
    //    }
    //},
    //
    //// =================
    //// Write
    //toBuffer: function() {
    //    var self = this;
    //    return utils.fetchTemplate("./xlsx/sheet.xml")
    //        .then(function(template){
    //            var model = {};
    //            self.buildCols(model);
    //            self.buildRows(model);
    //            self.buildMergeCells(model);
    //            self.buildHyperlinks(model);
    //            return template(model);
    //        });
    //},
    //write: function(stream) {
    //    return this.toBuffer()
    //        .then(function(data) {
    //            stream.write(data);
    //            return stream;
    //        });
    //}
    //
    
// ===============================================================================
// Workbook
    // =========================================================================
    // Read

    readFile: function(filename) {
        var self = this;
        var stream = fs.createReadStream(filename);
        return this.read(stream)
            .then(function(workbook) {
                stream.close();
                return workbook;
            });
    },
    parseRels: function(stream) {
        var deferred = Promise.defer();
        
        var relationships = {};
        
        var parser = Sax.createStream(true, {});
        parser.on('opentag', function(node) {
            var rId = node.attributes.Id;
            if (node.name == "Relationship") {
                switch (node.attributes.Type) {
                    case XLSX.RelType.OfficeDocument:
                        relationships[rId] = {
                            type: Enums.RelationshipType.OfficeDocument,
                            rId: rId,
                            target: node.attributes.Target
                        };
                        break;
                    case XLSX.RelType.Worksheet:
                        relationships[rId] = {
                            type: Enums.RelationshipType.Worksheet,
                            rId: rId,
                            target: node.attributes.Target,
                            index: parseInt(node.attributes.Target.replace("worksheets/sheet", "").replace(".xml", ""))
                        };
                        break;
                    case XLSX.RelType.CalcChain:
                        relationships[rId] = {
                            type: Enums.RelationshipType.CalcChain,
                            rId: rId,
                            target: node.attributes.Target
                        };
                        break;
                    case XLSX.RelType.SharedStrings:
                        relationships[rId] = {
                            type: Enums.RelationshipType.SharedStrings,
                            rId: rId,
                            target: node.attributes.Target
                        };
                        break;
                    case XLSX.RelType.Styles:
                        relationships[rId] = {
                            type: Enums.RelationshipType.Styles,
                            rId: rId,
                            target: node.attributes.Target
                        };
                        break;
                    case XLSX.RelType.Theme:
                        relationships[rId] = {
                            type: Enums.RelationshipType.Theme,
                            rId: rId,
                            target: node.attributes.Target,
                            index: parseInt(node.attributes.Target.replace("theme/theme", "").replace(".xml", ""))
                        };
                       break;
                    case XLSX.RelType.Hyperlink:
                        relationships[rId] = {
                            type: Enums.RelationshipType.Styles,
                            rId: rId,
                            target: node.attributes.Target,
                            targetMode: node.attributes.TargetMode
                        };
                        break;
                    default:
                        // ignore this?
                        break;
                }
            }
        });
        parser.on("end", function() {
            deferred.resolve(relationships);
        });
        parser.on("error", function(error) {
            deferred.reject(error);
        });
        
        stream.pipe(parser);
        
        return deferred.promise;
    },
    parseWorkbook: function(stream) {
        var deferred = Promise.defer();
        var self = this;
        var parser = Sax.createStream(true, {});
        var sheetDefs = {};
        parser.on('opentag', function(node) {
            if (node.name == "sheet") {
                // add sheet to sheetDefs indexed by rId
                // <sheet name="<%=worksheet.name%>" sheetId="<%=worksheet.id%>" r:id="<%=worksheet.rId%>"/>
                var name = node.attributes.name;
                var id = parseInt(node.attributes.sheetId);
                var rId = node.attributes["r:id"];
                sheetDefs[rId] = {
                    name: name,
                    id: id,
                    rId: rId
                };
            }
        });
        parser.on('end', function() {
            deferred.resolve(sheetDefs);
        });
        parser.on('error', function (error) {
            deferred.reject(error);
        });
        stream.pipe(parser);
        
        return deferred.promise;
    },
    parseSharedStrings: function(stream) {
        var deferred = Promise.defer();
        var parser = Sax.createStream(true, {});
        var t = null;
        var sharedStrings = [];
        parser.on('opentag', function(node) {
            if (node.name == "t") {
                t = "";
            }
        });
        parser.on('closetag', function (name) {
            if ((t != null) && (name == "t")) {
                sharedStrings.push(t);
                t = null;
            }
        });
        parser.on('text', function (text) {
            if (t != null) {
                t += text;
            }
        });
        parser.on('end', function() {
            deferred.resolve(sharedStrings);
        });
        parser.on('error', function (error) {
            deferred.reject(error);
        });
        stream.pipe(parser);
        
        return deferred.promise;
    },
    parseWorksheet: function(stream) {
        // <cols><col min="1" max="1" width="25" style="?" />
        // <sheetData><row><c r="A1" s="1" t="s"><f>A2</f><v>value</v></c>
        // <mergeCells><mergeCell ref="A1:B2" />
        // <hyperlinks><hyperlink ref="A1" r:id="rId1" />
        var deferred = Promise.defer();
        
        var parser = Sax.createStream(true, {});
        
        var model = {
            cols: [],
            rows: [],
            hyperlinks: [],
            merges: []
        }
        
        var current;
        var c; // cell stuff
        parser.on('opentag', function(node) {
            switch (node.name) {
                case "col":
                    model.cols.push({
                        // s: node.attributes.s
                        min: parseInt(node.attributes.min),
                        max: parseInt(node.attributes.max),
                        width: parseFloat(node.attributes.width)
                    });
                    break;
                case "c":
                    c = {
                        ref: node.attributes.r,
                        s: parseInt(node.attributes.s),
                        t: node.attributes.t
                    };
                    break;
                case "f":
                    current = c.f = { text: "" };
                    break;
                case "v":
                    current = c.v = { text: "" };
                    break;
                case "mergeCell":
                    model.merges.push(node.attributes.ref);
                    break;
                case "hyperlink":
                    model.hyperlinks.push({
                        ref: node.attributes.ref,
                        rId: node.attributes["r:id"]
                    });
                    break;                
            }
        });
        parser.on('text', function (text) {
            if (current) {
                current.text += text;
            }
        });
        
        var getRow = function(n) {
            var row = model.rows[n];
            if (!row) {
                row = model.rows[n] = {
                    number: n,
                    cells: [],
                    min: 0,
                    max: 0
                };
            }
            return row;
        }
        parser.on('closetag', function(name) {
            switch (name) {
                case "c":
                    var address = colCache.decodeAddress(c.ref);
                    var cell = {
                        address: c.ref
                    };
                    // Note: merged cells (if they've been merged already will not have v or f nodes)
                    if (c.f) {
                        cell.type = Enums.ValueType.Formula;
                        cell.formula = c.f.text;
                        if (c.v) {
                            if (c.t == "str") {
                                cell.result = c.v.text;
                            } else if (c.s == 1) {
                                cell.result = utils.excelToDate(parseFloat(c.v.text));
                            } else {
                                cell.result = parseFloat(c.v.text);
                            }
                        }
                    } else if (c.v) {
                        if (c.t == "s") {
                            cell.type = Enums.ValueType.String;
                            cell.value = parseInt(c.v.text);
                        } else if (c.s == 1) {
                            cell.type = Enums.ValueType.Date;
                            cell.value = utils.excelToDate(parseFloat(c.v.text));
                        } else {
                            cell.type = Enums.ValueType.Number;
                            cell.value = parseFloat(c.v.text);
                        }
                    } else {
                        cell.type = Enums.ValueType.Merge;
                    }
                    
                    var row = getRow(address.row);
                    row.cells[address.col] = cell;
                    row.min = Math.min(row.min, address.col) || address.col;
                    row.max = Math.max(row.max, address.col);
                    break;
            }
        });
        parser.on('end', function() {
            // if cols empty then can remove it from model
            if (!model.cols.length) {
                delete model.cols;
            }
            
            deferred.resolve(model);
        });
        parser.on('error', function (error) {
            deferred.reject(error);
        });
        stream.pipe(parser);
        
        return deferred.promise;
    },
    prepareModel: function(model) {        
        // reconcile sheet ids, rIds and names
        _.each(model.sheetDefs, function(sheetDef) {
            var rel = model.workbookRels[sheetDef.rId];
            var worksheet = model.worksheetHash["xl/" + rel.target];
            worksheet.name = sheetDef.name;
            worksheet.id = sheetDef.id;
        });
        
        // reconcile worksheets
        _.each(model.worksheets, function(worksheet, sheetNo) {
            // reconcile merge list with merge cells
            _.each(worksheet.merges, function(merge) {
                var dimensions = colCache.decode(merge);
                for (var i = dimensions.top; i <= dimensions.bottom; i++) {
                    var row = worksheet.rows[i];
                    for (var j = dimensions.left; j <= dimensions.right; j++) {
                        var cell = row.cells[j];
                        if (!cell) {
                            // nulls are not included in document - so if master cell has no value - add a null one here
                            row.cells[j] = {
                                type: Enums.ValueType.Null,
                                address: colCache.encodeAddress(i,j)
                            };
                        } else if (cell.type == Enums.ValueType.Merge) {
                            cell.master = dimensions.tl;
                        }
                    }
                }
            });
            
            // if worksheet rels, merge them in
            var relationships = model.worksheetRels[worksheet.sheetNo];
            if (relationships) {
                var hyperlinks = {};
                _.each(relationships, function(relationship) {
                    hyperlinks[relationship.rId] = relationship.target;
                });
                
                _.each(worksheet.hyperlinks, function(hyperlink) {
                    var address = colCache.decodeAddress(hyperlink.ref);
                    var row = worksheet.rows[address.row];
                    var cell = row.cells[address.col];
                    cell.type = Enums.ValueType.Hyperlink;
                    cell.text = cell.value;
                    cell.hyperlink = hyperlinks[hyperlink.rId];
                });
                // no need for them any more
                delete worksheet.hyperlinks;
            }
            
            // compact the rows and calculate dimensions
            var dimensions = new Dimensions();
            worksheet.rows = worksheet.rows.filter(function(row) { return row; });
            _.each(worksheet.rows, function(row) {
                dimensions.expand(row.number, row.min, row.number, row.max);
                row.cells = row.cells.filter(function(cell) { return cell; });
            });
            worksheet.dimensions = dimensions.model;
            delete worksheet.sheetNo;
            
            // reconcile shared strings
            _.each(worksheet.rows, function(row) {
                _.each(row.cells, function(cell) {
                    switch(cell.type) {
                        case Enums.ValueType.String:
                            cell.value = model.sharedStrings[cell.value];
                            break;
                        case Enums.ValueType.Hyperlink:
                            cell.text = model.sharedStrings[cell.value];
                            delete cell.value;
                            break;
                    }
                });
            });
        });
        
        // delete unnecessary parts
        delete model.worksheetHash;
        delete model.worksheetRels;
        delete model.globalRels;
        delete model.sharedStrings;
        delete model.workbookRels;
        delete model.sheetDefs;
    },
    createInputStream: function() {
        var self = this;
        var model = {
            worksheets: [],
            worksheetHash: {},
            worksheetRels: []
        };
        
        // we have to be prepared to read the zip entries in whatever order they arrive
        var promises = [];
        var stream = unzip.Parse();
        stream.on('entry',function (entry) {
            var promise = null;
            switch(entry.path) {
                case "_rels/.rels":
                    promise = self.parseRels(entry)
                        .then(function(relationships) {
                            model.globalRels = relationships;
                        });
                    break;
                case "xl/workbook.xml":
                    promise = self.parseWorkbook(entry)
                        .then(function(workbook) {
                            model.sheetDefs = workbook;
                        });
                    break;
                case "xl/_rels/workbook.xml.rels":
                    promise = self.parseRels(entry)
                        .then(function(relationships) {
                            model.workbookRels = relationships;
                        });
                    break;
                case "xl/sharedStrings.xml":
                    promise = self.parseSharedStrings(entry, model)
                        .then(function(sharedStrings) {
                            model.sharedStrings = sharedStrings;
                        });
                    break;
                default:
                    if (entry.path.match(/xl\/worksheets\/sheet\d\.xml/)) {
                        var match = entry.path.match(/xl\/worksheets\/sheet(\d)\.xml/)
                        var sheetNo = match[1];
                        promise = self.parseWorksheet(entry)
                            .then(function(worksheet) {
                                worksheet.sheetNo = sheetNo;
                                model.worksheetHash[entry.path] = worksheet;
                                model.worksheets.push(worksheet);
                            });
                    } else if (entry.path.match(/xl\/worksheets\/_rels\/sheet\d\.xml.rels/)) {
                        var match = entry.path.match(/xl\/worksheets\/_rels\/sheet(\d)\.xml.rels/)
                        var sheetNo = match[1];
                        promise = self.parseRels(entry)
                            .then(function(relationships) {
                                model.worksheetRels[sheetNo] = relationships;
                            });
                    } else {
                        entry.autodrain();
                    }
                    break;
            }
            
            if (promise) {
                promises.push(promise);
                promise = null;
            }
        });
        stream.on('close', function () {
            Promise.all(promises)
                .then(function() {
                    self.prepareModel(model);
                    
                    // apply model
                    self.workbook.model = model;
                })
                .then(function() {
                    stream.emit("done");
                })
                .catch(function(error) {
                    stream.emit("error", error);
                });
        });
        return stream;
    },
    
    read: function(stream) {
        var deferred = Promise.defer();
        var self = this;
        var zipStream = this.createInputStream();
        zipStream.on("done", function() {
            deferred.resolve(self.workbook);
        }).on("error", function(error) {
            deferred.reject(error);
        })
        stream.pipe(zipStream);
        return deferred.promise;
    },
    
    // =========================================================================
    // Write
    
    addContentTypes: function(zip, model) {
        var self = this;
        return utils.fetchTemplate("./xlsx/[Content_Types].xml")
            .then(function(template){
                return template(model);
            })
            .then(function(data) {
                zip.append(data, { name: "[Content_Types].xml" });
                return zip;
            });
    },
    
    //<Relationship Id="rId1"
    //        Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument"
    //        Target="xl/workbook.xml"/>
    addOfficeRels: function(zip, model) {
        model._rels = {
            relationships: [
                { rId: "rId1", type: XLSX.RelType.OfficeDocument, target: "xl/workbook.xml" }
            ]
        };
        return utils.fetchTemplate("./xlsx/.rels")
            .then(function(template) {
                return template(model._rels);
            })
            .then(function(data) {
                zip.append(data, { name: "/_rels/.rels" });
            });
    },
    
    addWorkbookRels: function(zip, model) {
        var self = this;
        var count = 1;
        model.workbookRels = {
            relationships: [
                { rId: "rId" + (count++), type: XLSX.RelType.Styles, target: "styles.xml" }
            ]
        };
        if (model.sharedStrings.count) {
            model.workbookRels.relationships.push(
                { rId: "rId" + (count++), type: XLSX.RelType.SharedStrings, target: "sharedStrings.xml" }
            );
        }
        _.each(model.worksheets, function(worksheet) {
            worksheet.rId = "rId" + (count++);
            model.workbookRels.relationships.push(
                { rId: worksheet.rId, type: XLSX.RelType.Worksheet, target: "worksheets/sheet" + worksheet.id + ".xml" }
            );
        })
        return utils.fetchTemplate("./xlsx/.rels")
            .then(function(template) {
                return template(model.workbookRels);
            })
            .then(function(data) {
                zip.append(data, { name: "/xl/_rels/workbook.xml.rels" });
            });
    },
    addSharedStrings: function(zip, model) {
        if (!model.sharedStrings || !model.sharedStrings.count) {
            return Promise.resolve();
        } else {
            return utils.fetchTemplate("./xlsx/sharedStrings.xml")
                .then(function(template) {
                    return template(model.sharedStrings);
                })
                .then(function(data) {
                    zip.append(data, { name: "/xl/sharedStrings.xml" });
                });
        }
    },
    addStyles: function(zip, model) {
        // for now, styles is a static file
        utils.readModuleFile("./xlsx/styles.xml")
            .then(function(data) {
                zip.append(data, { name: "/xl/styles.xml" });
            });
    },
    addWorkbook: function(zip, model) {
        return utils.fetchTemplate("./xlsx/workbook.xml")
            .then(function(template){
                return template(model);
            })
            .then(function(data) {
                zip.append(data, { name: "/xl/workbook.xml" });
                return zip;
            });
    },
    getValueType: function(v) {
        if ((v === null) || (v === undefined)) {
            return Enums.ValueType.Null;
        } else if ((v instanceof String) || (typeof v == "string")) {
            return Enums.ValueType.String;
        } else if (typeof v == "number") {
            return Enums.ValueType.Number;
        } else if (v instanceof Date) {
            return Enums.ValueType.Date;
        } else if (v.text && v.hyperlink) {
            return Enums.ValueType.Hyperlink;
        } else if (v.formula) {
            return Enums.ValueType.Formula;
        } else {
            throw new Error("I could not understand type of value")
        }
    },
    addWorksheets: function(zip, model) {
        var self = this;
        var promises = [];
        _.each(model.worksheets, function(worksheet) {
            // TODO: process worksheet model and prepare for template
            if (!worksheet.cols) {
                worksheet.cols = false;
            }
            
            worksheet.hyperlinks = worksheet.relationships = [];
            var hyperlinkCount = 1;
            _.each(worksheet.rows, function(row) {
                _.each(row.cells, function(cell) {
                    switch(cell.type) {
                        case Enums.ValueType.Number:
                            cell.xml =  '<c r="' + cell.address + '"><v>' + cell.value + '</v></c>';
                            break;
                        case Enums.ValueType.String:
                            cell.xml =  '<c r="' + cell.address + '" t="s">' +
                                            '<v>' + model.sharedStrings.add(cell.value) + '</v>' +
                                        '</c>';
                            break;
                        case Enums.ValueType.Date:
                            cell.xml =  '<c r="' + cell.address + '" s="1">' +
                                            '<v>' + utils.dateToExcel(cell.value) + '</v>' +
                                        '</c>';
                            break;
                        case Enums.ValueType.Hyperlink:
                            cell.xml =  '<c r="' + cell.address + '" t="s">' +
                                            '<v>' + model.sharedStrings.add(cell.text) + '</v>' +
                                        '</c>';
                            worksheet.hyperlinks.push({
                                address: cell.address,
                                rId: "rId" + (hyperlinkCount++),
                                type: XLSX.RelType.Hyperlink,
                                target: cell.hyperlink,
                                targetMode: "External"
                            });
                            break;
                        case Enums.ValueType.Formula:
                            switch(self.getValueType(cell.result)) {
                                case Enums.ValueType.Null: // ?
                                    cell.xml =  '<c r="' + cell.address + '">' +
                                                    '<f>' + cell.formula + '</f>' +
                                                '</c>';
                                    break;
                                case Enums.ValueType.String:
                                    // oddly, formula results don't use shared strings
                                    cell.xml =  '<c r="' + cell.address + '" t="str">' +
                                                    '<f>' + cell.formula + '</f>' +
                                                    '<v>' + cell.result + '</v>' +
                                                '</c>';
                                    break;
                                case Enums.ValueType.Number:
                                    cell.xml =  '<c r="' + cell.address + '">' +
                                                    '<f>' + cell.formula + '</f>' +
                                                    '<v>' + cell.result + '</v>' +
                                                '</c>';
                                    break;
                                case Enums.ValueType.Date:
                                    cell.xml =  '<c r="' + cell.address + '" s="1">' +
                                                '<f>' + cell.formula + '</f>' +
                                                '<v>' + utils.dateToExcel(cell.result) + '</v>' +
                                            '</c>';
                                    break;
                                case Enums.ValueType.Hyperlink: // ??
                                case Enums.ValueType.Formula:
                                default:
                                    throw new Error("I could not understand type of value");
                            }
                            break;
                        case Enums.ValueType.Merge:
                            cell.xml =  '<c r="' + cell.address + '" />';
                            break;
                    }
                });
            });
            
            promises.push(utils.fetchTemplate("./xlsx/sheet.xml")
                .then(function(template){
                    return template(worksheet);
                })
                .then(function(data) {
                    zip.append(data, { name: "/xl/worksheets/sheet" + worksheet.id + ".xml" });
                    return zip;
                }));
            
            if (worksheet.hyperlinks) {
                promises.push(utils.fetchTemplate("./xlsx/.rels")
                    .then(function(template) {
                        return template(worksheet);
                    })
                    .then(function(data) {
                        zip.append(data, { name: "/xl/worksheets/_rels/sheet" + worksheet.id + ".xml.rels" });
                    }));
            }
        });
        
        return Promise.all(promises);
    },
    _finalize: function(zip) {
        var self = this;
        var deferred = Promise.defer();
        
        zip.on('finish', function(){
            deferred.resolve(self);
        });
        zip.on('error', function(error){
            deferred.reject(error);
        });
        
        zip.finalize();
        
        return deferred.promise;
    },
    write: function(stream) {
        var self = this;
        var model = self.workbook.model;
        var zip = Archiver("zip");
        zip.on("error", function(err) {
            throw err;
        });
        zip.pipe(stream);
        
        // add a semi-intelligent object to manage the shared strings
        model.sharedStrings = {
            get count() { return this.values.length; },
            totalRefs: 0,
            values: [],
            hash: {},
            add: function(value) {
                var index = this.hash[value];
                if (index == undefined) {
                    index = this.hash[value] = this.values.length;
                    this.values.push(value);
                }
                this.totalRefs++;
                return index;
            }
        };
        
        var promises = [
            self.addContentTypes(zip, model),
            self.addOfficeRels(zip, model),
            self.addStyles(zip, model)
        ];
        return Promise.all(promises)
            .then(function() {
                return self.addWorksheets(zip, model);
            })
            .then(function() {
                // shared strings can only be added after all the worksheets
                return self.addSharedStrings(zip, model);
            })
            .then(function() {
                // shared strings can only be added after all the worksheets
                return self.addWorkbookRels(zip, model);
            })
            .then(function() {
                return self.addWorkbook(zip, model);
            })
            .then(function(){
                return self._finalize(zip);
            });
    },
    writeFile: function(filename) {
        var deferred = Promise.defer();
        
        var stream = fs.createWriteStream(filename);
        
        stream.on("finish", function() {
            deferred.resolve();
        });
        stream.on("error", function(error) {
            deferred.reject(error);
        });
        
        this.write(stream)
            .then(function() {
                stream.end();
            })
            .catch(function(error) {
                deferred.reject(error);
            });
        
        return deferred.promise;
    }
}