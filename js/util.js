/*
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

"use strict";

/* Util.js - Utility functions that don't fit in other files */


/*Verify if a variable is defined. Adds an additional check to
see if the variable is a string, it is not empty*/
function isDefined(a) {
    if( a === undefined || a === null ) return false;
    if( typeof a === "string" ) return a != "";
    return true;
}

/*Returns a if a is equal to true (Ie not 0, not "", etc...)
otherwise returns b, regardless what b is */
function AorB(a,b) {
    return isDefined(a) ? a : b;
}


/*Returns the current date as a string*/
function nowAsString() {
    return new Date().toISOString().replace("T", " ").replace("Z"," ");
}


/*Get type, ie String, int, etc...*/
function getType(instance_var) {
    instance_var = instance_var.type;
    instance_var = instance_var.split(" ");
    instance_var = instance_var[instance_var.length - 1];
    return instance_var;
}

/*Returns default value for type, ie int = 0, boolean = false*/
function getDefaultType(type) {
    switch(type) {
        case "String": return `""`;
        case "int":
        case "long":
        case "byte":
        case "short":
        case "float":
        case "double":
            return "0";
        case "char": return "'u0000'";
        case "boolean": return "false";
        default: return "null";
    }
}

/*Get the name of an instance variable*/
function getName(instance_var) {
    instance_var = instance_var.name;
    instance_var = instance_var.split(" ");
    instance_var = instance_var[instance_var.length - 1];
    return instance_var;
}

/*Is an instance_variable an array?*/
function typeIsArray(instance_var) {
    return getType(instance_var).includes("[]") || getName(instance_var).includes("[]");
}

/*Is an instance variable final?*/
function isNotFinal(instance_var) {
    return !instance_var.type.includes("final ");
}

/*Returns if the instance_var should be compared with == or .equals*/
function equalsFuncOrOperator(instance_var, compare_name) {
    var PRIMITIVES = ["int", "short", "long", "char", "byte", "boolean", "float", "double", "void"]; /*Compare with ==*/
    if( PRIMITIVES.includes(getType(instance_var)) )
        return " == " + compare_name;
    return ".equals(" + compare_name + ")";
}


/*Converts instance variable to parameters, ie [v1, v2] -> ["int v1", "int v2"]*/
function toParam(instance_var) {
    instance_var = instance_var.type + " " + instance_var.name;
    return instance_var.replace("private ","").replace("public ","").replace("static ", "").replace("final ", "")
                               .replace("const ", "").replace("volatile ", "").replace("transient ", "")
                               .split("=")[0].trim();
}

/*Converts instance variables to this.[name] = [name] format*/
function toConstruct(instance_var) {
    instance_var = getName(instance_var);
    return "        this." + instance_var + " = " + instance_var + ";";
}

/*Defines an instance variable*/
function defineVar(instance_var, params) {
    var prefix = "";
    if( params.auto_private && !instance_var.type.startsWith("public ")
            && !instance_var.type.startsWith("private ")
            && !instance_var.type.startsWith("default ")
            && !instance_var.type.startsWith("protected ") )
        prefix = "private ";
    if( isNotFinal(instance_var) ) return `    ` + prefix + instance_var.type + " " + instance_var.name + ";";
    return `    ` + prefix + instance_var.type + " " + instance_var.name + " = " + getDefaultType(getType(instance_var)) + ";";
}

/*Is the variable name valid? Must follow java variable naming rules
(Correct characters, can't start with number, not a keyword)*/
function isValidJavaVariable(name) {
    const KEYWORDS = ["abstract", "continue", "for", "new", "switch", "assert", "defeault",
        "goto", "package", "synchronized", "boolean", "do", "if", "private", "this", "break", "double", "implements",
        "protected", "throw", "byte", "else", "import", "public", "throws", "case", "enum", "instanceof", "return",
        "transient", "catch", "extends", "int", "short", "try", "char", "final", "interface", "static", "void",
        "class", "finally", "long", "strictfp", "volatile", "const", "float", "native", "super", "while"];
    return /^[a-zA-Z_$][a-zA-Z_$0-9]*$/g.test(name) && !KEYWORDS.includes(name);
}

/*Is the java type valid? Only verifies if there is more than 1 access
modifier (ie can't have public private int)*/
function isValidJavaType(type) {
    const ACCESS = ["private", "public", "default", "protected"];

    var count = 0;
    for(var a in ACCESS) {
        if( type.includes(a) ) count++;
    }
    return count < 2;
}


/*Is uppercase*/
String.prototype.isUppercase = function() {
    return this.toUpperCase() == this;
}

/*String replaceall*/
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

/*String trim*/
String.prototype.trim = function() {
    return String(this).replace(/^\s+|\s+$/g, '');
};
