'use strict';

var mapValues = require("lodash/object/mapValues");

var {
    List,
    Map
} = require('immutable');

function fixData ( innerData, innerProp ) {
    var data = innerProp
        ? { [ innerProp ]: innerData }
        : innerData;

    return {
        'd': data
    };
}

function getNextId ( itemMap ) {
    var lastId = itemMap
        .keySeq()
        .sort()
        .last();

    return ~~lastId + 1;
}

class DB {
    constructor () {
        this.itemMap = Map();
        this.itemList = List();
    }

    get [ '/Pages/content/_api/contextinfo' ] () {
        return {
            FormDigestValue: "1234"
        };
    }

    get [ '/opt' ] () {
        return [
            {
                Variable: "hideSearchWhileEditing",
                Value: true
            }, {
                Variable: "images",
                Value: "https://jsbin-user-assets.s3.amazonaws.com/dhenson02"
            }, {
                Variable: "scrollOnNav",
                Value: false
            }, {
                Variable: "resetOpenOnNav",
                Value: false
            }
        ];
    }

    mapResults ( results ) {
        return results.reduce(function ( map, item ) {
            item.ID = item.Id = ~~item.ID;
            return map.set(item.ID, {
                d: item
            });
        }, this.itemMap.clear());
    }

    set data ( results ) {
        this.itemList = List(results);
        this.itemMap = this.mapResults(this.itemList);

        var resultsArray = List(results).toArray();
        if ( resultsArray.length > 0 ) {
            var resultsString = JSON.stringify(resultsArray);
            localStorage.setItem('kxdb', resultsString);
            localStorage.setItem('dbTimestamp', Date.now());
        }
    }

    processItems ( path ) {
        var id = ~~path.replace(/\/items\((\d+)\)/, '$1');

        if ( id > 0 ) {
            // Only one item
            return this.itemMap.get(id);
        }
        else {
            // Full list ( '/' means regular view, '' means new item added )
            return fixData(this.itemList, 'results');
        }
    }

    getData ( path ) {
        switch ( path ) {
            case '/check/true':
                return this[ path ];

            case '/Pages/content/_api/contextinfo':
                return fixData(this[ path ], 'GetContextWebInformation');

            case '/opt':
                return fixData(this[ path ], 'results');

            default:
                if ( path.slice(0, 6) === '/items' ) {
                    return this.processItems(path);
                }

        }
    }

    createItem ( itemInput ) {
        var nextId = getNextId(this.itemMap);

        var item = mapValues(itemInput, function ( val ) {
            return Array.isArray(val)
                ? { results: val }
                : val;
        });

        item.ID = nextId;
        item.Id = nextId;
        this.data = this.itemList.push(item);
        return this;
    }

    updateItem ( itemInput, id ) {
        var index = this.itemList.findIndex(function ( item ) {
            return item.ID === id;
        });

        this.data = this.itemList.update(index, function ( item ) {
            var mixedItem = mapValues(itemInput, function ( val, key ) {
                if ( key === "__metadata" ) {
                    return item.__metadata;
                }
                return Array.isArray(val)
                    ? { results: val }
                    : val;
            });

            return {
                ...item,
                ...mixedItem
            };
        });

        return this;
    }

    saveItem ( itemInput ) {
        var {
            ID
        } = itemInput;

        if ( ID > 0 ) {
            return this.updateItem(itemInput, ID);
        }
        return this.createItem(itemInput);
    }

    async loadData () {
        // Only keep for 1 day
        var kxdb = localStorage.getItem('kxdb');
        var dbTimestamp = localStorage.getItem('dbTimestamp');
        if ( kxdb && dbTimestamp + 86400000 > Date.now() ) {
            var array = JSON.parse(kxdb);
            if ( array && array.length ) {
                this.data = List(array);
                return this;
            }
            else {
                localStorage.removeItem('kxdb');
                localStorage.removeItem('dbTimestamp');
            }
        }

        var req = new Request('/db.json');

        try {
            var res = await fetch(req);
            var data = await res.json();
            this.data = List(data);
        }
        catch ( e ) {
            alert('Data failed to load - see console');
            console.error('Fetching JSON file /db.json fails - ', e);
            this.data = List();
        }

        return this;
    }
}

module.exports = new DB();
