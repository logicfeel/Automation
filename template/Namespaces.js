'use strict';

function Namespace(pBaseTemplate) {
    
    // TODO: 타입검사 pBaseTemplate
    this._BaseTemplate  = pBaseTemplate;
    this.import = this._BaseTemplate._import;

    // this.part = this._CommonTemplate.part;
    this.part = new NsCollection('part', this);
    this.data = new NsCollection('data', this);
    this.helper = new NsCollection('helper', this);
    this.decorator = new NsCollection('decorator', this);
}

Namespace.prototype.import = function(pNamespace) {
    
    // TODO: pNamespace 타입 검사 

};


function NsCollection(pAttr, pBaseTemplate) {

    this._SCOPE     = pAttr;
    this._BaseTemplate  = pBaseTemplate;
    
}

NsCollection.prototype.add = function(pAttr, pBaseCollection) {
    
    // TODO: pBaseCollection 타입 검사 

    Object.defineProperty(this, pAttr, {
        get: function() { 
            return pBaseCollection[pAttr]; 
        },
        set: function(newValue) { 
            pBaseCollection[pAttr] = newValue;
        },
        enumerable: true,
        configurable: true
    });

};


module.exports = {
    Namespace: Namespace,
    NsCollection: NsCollection
};