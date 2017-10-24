/*
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

"use strict";

/* This file contains all the methods that generate the individual
parts of the java class, given the parameters */


/*Generates the default comments for a class
Returns an object containing different comment types */
function generateComments(params){
    if( !params.comments ) return {"header":"", "description":"", "instance_variables":"", "constructor":""};
    return {
        "header": "/**\n* Created " + nowAsString()
                    + "\n* Using Gavin Song's Java class generator"
                    + "\n* Copyright " + (new Date().getFullYear()) + "\n**/",
        "description": "/**\n* " + params.description + "\n**/",
        "instance_variables": "/*-- Instance Variables --*/",
        "constructor": "/*-- Constructor --*/",
    }
}


/*Generates the constructor, if allowed*/
function makeConstructor(params, comments){
    if( !params.allow_constructor ) return "";

    var constructor_params = params.instance_vars.filter(isNotFinal).map(toParam);
    for(var i=3;i<constructor_params.length;i+=4){
        constructor_params[i] = "\n             " + constructor_params[i];
    }

    return `    ` + comments.constructor +
`
    public ` + params.className + `(` + constructor_params.join(", ") + `){
` + params.instance_vars.filter(isNotFinal).map(toConstruct).join("\n") + `
    }`;
}


/*Generate a get method for a particular instance variable*/
function generateGet(instance_var){
    var prefix = "this.";
    var is_static = instance_var.type.includes("static ");
    if( is_static ) prefix = "";

    var returned =
`    public ` + (is_static ? "static " : "") + getType(instance_var) + ` get` + instance_var.name + `(){
        return ` + prefix + instance_var.name + `;
    }
`;
    return returned;
}

/*Generate a set method for a particular instance variable*/
function generateSet(instance_var){
    if( !instance_var.writable ) return "";
    if( instance_var.type.includes("final ") ) return "";
    var returned =
`    public void set` + instance_var.name + `(` + getType(instance_var) + ` n){
        this.` + instance_var.name + ` = n;
    }
`;
    return returned;
}

/*Generate an equals function for a particular class*/
function generateEquals(params){
    var returned = "    public boolean equals(" + params.className + " other){\n";

    if( params.instance_vars.length == 0 ){
        returned += "         return false;\n";
        returned += "    }";
        return returned;
    }

    for (let instance_var of params.instance_vars){
        if( !params.arrays && typeIsArray(instance_var) ){
            if( params.comments ) returned += "         /*Check if " + instance_var.name + " is equal*/\n";
            returned +=
`         ` + getType(instance_var) + ` other_` + instance_var.name + ` = other.get` + instance_var.name + `();
         for(int i=0;i<this.` + instance_var.name + `.length;i++){
            if(!( other_` + instance_var.name + equalsFuncOrOperator(instance_var, "this." + instance_var.name ) + ` )){
                return false;
            }
         }\n\n
`
        }
    }

    var non_array = [];
    for (let instance_var of params.instance_vars){
        if( !typeIsArray(instance_var) ){
            non_array.push( "other.get" + instance_var.name + "()" + equalsFuncOrOperator(instance_var, "this." + instance_var.name ) );
        }else if( params.arrays ){
            non_array.push( "Arrays.deepEquals( other.get" + instance_var.name + "()" + ", this." + instance_var.name + ")" );
        }
    }

    returned += non_array.length > 0 ? "         /*Check equality of other variables*/\n" +
        "         return " + non_array.join(" && \n                ") + ";\n" : "";

    returned += "    }";
    return returned;
}

/*Generates a toString function for a particular class*/
function generateToString(params){
    var returned = "    public String toString(){\n";
    returned += "         String returned = \"" + params.className + " object:\\n\";\n";

    for (let instance_var of params.instance_vars){
        if( !params.arrays && typeIsArray(instance_var) ){
            returned +=

`         for(int i=0;i<this.` + instance_var.name + `.length;i++){
            returned += "` + instance_var.name + ` index " + i + ": " + this.` + instance_var.name + `[i];
         }\n\n
`
        }
    }

    for (let instance_var of params.instance_vars){
        if( params.arrays && typeIsArray(instance_var) ){
            returned += `         returned += "` + instance_var.name + `: " + Arrays.toString(this.` + instance_var.name + `) + "\\n";\n`;
        }else{
            returned += `         returned += "` + instance_var.name + `: " + this.` + instance_var.name + ` + "\\n";\n`;
        }
    }
    returned += "         return returned;\n";
    returned += "    }";
    return returned;
}

/*Should it add the import arrays header?*/
function generateImport(params){
    if(!params.arrays) return "";
    for (let instance_var of params.instance_vars){
        if( typeIsArray(instance_var) ){
            return "import java.util.Arrays;\n";
        }
    }
    return "";
}
