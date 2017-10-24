/*
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

"use strict";

/*The js that does the work behind generating the file.

Generates a java class given the following parameters:
-----------------------------------------------------
> Class name - Mixed case with first letter capitalized, such as ImageData
> Comments (Add auto-generated comments to file?)
> main() - Add main method?
> Constructor
> Abstract class


Optional parameters:
-----------------------------------------------------
> Class description (Optional)
> Package (If not blank then adds package)

> Instance varaibles - read, or read/write
    Instance varaibles are an array of objects like this:
        {
            type: "type, ie static String",
            name: "name, ie myVar",
            writeable: "writable, true or false. If false then only get no set"
        }

Generates
-----------------------------------------------------
> Equals method (Auto generated, all instance vars are equal)
> To string method (Auto generated, displays all instance vars)
> Class
> Warnings about variable names and other things that aren't allowed
*/


/*Adjusts params, in case data was not given*/
function fixParams(params){
    /*-- Required --*/
    params.className = AorB(params.className, "MyClass");
    params.comments = AorB(params.comments, true);
    params.main = AorB(params.main, false);
    params.allow_constructor = AorB(params.allow_constructor, true);
    params.abstract = AorB(params.abstract, false);

    /*-- Optional --*/
    params.description = AorB(params.description, "Description for " + params.className);
    params.package = AorB(params.package, "");
    params.instance_vars = AorB(params.instance_vars, []);
    params.auto_private = AorB(params.auto_private, true);
    params.sort_vars = AorB(params.sort_vars, true);

    /*-- Varaible fixing --*/

    /*Fix package string, if user adds "package " in front or adds semicolon*/
    if( params.package.startsWith("package ") ) params.package = params.package.replace("package ","");
    params.package = params.package.replaceAll(";", "");

    /*Should it use java.util.Arrays?*/
    params.arrays = AorB(params.arrays, false);

    return params;
}


/*Returns an array of strings of warning messages for class*/
function getWarnings(params){
    var returned = [];

    if( !params.className[0].isUppercase() ){ /*Class name is not capitalized camel case*/
        returned.push("Class name should be camel case with first letter capitalized, for example ImageSprite");
    }

    for (let instance_var of params.instance_vars){
        /*Instance varaible is not private*/
        if( !instance_var.type.startsWith("private") && !instance_var.type.includes("static ") && !params.auto_private ){
            returned.push("Instance variable " + instance_var.name + " should be private." );
        }

        /*static final variables should be uppercase*/
        if( instance_var.type.includes("static ") && instance_var.type.includes("final ") && !instance_var.type.isUppercase() ){
            returned.push("Static final variable " + instance_var.name + " should be named in all uppercase." );
        }

        if( !isValidJavaVariable(instance_var.name) ){
            returned.push("Variable " + instance_var.name + " has an invalid name." );
        }

        if( !isValidJavaType(instance_var.type) ){
            returned.push("Variable " + instance_var.name + " has an invalid type." );
        }
    }

    return returned;
}







/*Call this method to generate the class.
Returns a JSON object: {"warnings":[], "class":"[CLASS STRING]"} */
function generateJavaClass(params){
    params = fixParams(params);

    var comments = generateComments(params);
    var pkg = params.package ? "package " + params.package + ";" : "";
    var class_declare = params.abstract ? "public abstract class " + params.className : "public class " + params.className;

    var constrct = makeConstructor(params, comments);
    var instance_vars = params.instance_vars.slice(0);


    if( params.sort_vars ){
        instance_vars.sort(function(a, b){
            var keyA = getType(a) + a.name;
            var keyB = getType(b) + b.name;
            if(keyA < keyB) return -1;
            if(keyA > keyB) return 1;
            return 0;
        });
    }


    var returned =
comments.header + `
` + pkg + `
` + generateImport(params) + `
` + comments.description + `
` + class_declare + `{
    ` + comments.instance_variables + `
` + instance_vars.map(x=>defineVar(x,params)).join("\n") + `

` + constrct + `

` + (
    params.main ?
`    public static void main(String[] args) {
        /*Code here*/
    }` : ""
) +
`


    /*-- Standard class functionality --*/
` + instance_vars.map(generateGet).filter(function(x){return x!="";}).join("\n") + `
` + instance_vars.map(generateSet).filter(function(x){return x!="";}).join("\n") + `

` + generateEquals(params) + `

` + generateToString(params) + `
}
`;

    while( returned.includes("\n\n\n") ) returned = returned.replaceAll("\n\n\n","\n\n");
    return returned;
}
