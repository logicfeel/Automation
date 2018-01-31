// function bold(person) {
//     return person.id + " " + person.name;
// }

// function list(items, options) {
//     var out = "<ul>";
  
//     // for(var i=0, l=items.length; i<l; i++) {
//     //   out = out + "<li>" + options.fn(items[i]) + "</li>";
//     // }
//     out = out + "<li>" + options.fn(items) + "</li>";
//     return out + "</ul>";
// }


// var bolds =  function(person) {
//     return person.id + " " + person.name;
// };
// var lists = function(items, options) {
//     var out = "<ul>";
  
//     // for(var i=0, l=items.length; i<l; i++) {
//     //   out = out + "<li>" + options.fn(items[i]) + "</li>";
//     // }
//     out = out + "<li>" + options.fn(items) + "</li>";
//     return out + "</ul>";
//   };

  module.exports = {
        bold: function(person) {
            return person.id + " " + person.name;
        },
        list: function(items, options) {
            var out = "<ul>";
        
            // for(var i=0, l=items.length; i<l; i++) {
            //   out = out + "<li>" + options.fn(items[i]) + "</li>";
            // }
            out = out + "<li>" + options.fn(items) + "</li>";
            return out + "</ul>";
        }      
  }