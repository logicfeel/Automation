
import { StringValidator } from "./Validation";

import * as m from "test";

import * as s from "../m4";

export const numberRegexp = /^[0-9]+$/;

// export class ZipCodeValidator implements StringValidator {
    
export class ZipCodeValidator implements StringValidator {
    constructor(){
        console.log('createeedd' + m.defaultName);
        var a  = new s.Shapes.Triangle();
        
    }
    isAcceptable(s: string) {
        return s.length === 5 && numberRegexp.test(s);
    }
}


 var a = new ZipCodeValidator();
console.log('create');