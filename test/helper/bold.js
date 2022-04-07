var Handlebars          = require('handlebars');


// Handlebars.registerHelper("bold", function(options) {
//     return new Handlebars.SafeString('<div class="mybold">' + options.fn(this) + "</div>");
// });

// module.exports = {
//     bold: function(options) {
//         return new Handlebars.SafeString('<div class="mybold">' + options.fn(this) + "</div>");
//     },
//     qux: function () {
//         return "// do something";
//     }
// }; 


module.exports = function(options) {
        return new Handlebars.SafeString('<div class="mybold">' + options.fn(this) + "</div>");
}; 