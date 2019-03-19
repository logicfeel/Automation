var ClassWithStaticMethod = /** @class */ (function () {
    function ClassWithStaticMethod() {
    }
    ClassWithStaticMethod.staticMethod = function () {
        return 'static method has been called.';
    };
    return ClassWithStaticMethod;
}());
console.log(ClassWithStaticMethod.staticMethod());
// expected output: "static method has been called."
