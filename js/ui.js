var instance_vars = [];

/*Updates the codebox*/
function update(){
    var temp_params = {
        className: $("#name").val(),
        package: $("#package").val(),
        description: $("#desc").val(),

        comments: $("#comments").prop('checked'),
        allow_constructor: $("#constructor").prop('checked'),
        main: $("#main").prop('checked'),
        abstract: $("#abstract").prop('checked'),
        arrays: $("#arrays").prop('checked'),

        auto_private: $("#private").prop('checked'),
        sort_vars: $("#group").prop('checked'),

        instance_vars: instance_vars
    }

    $("#code").html(generateJavaClass( temp_params ));
    $('pre code').each(function(i, block) {
        hljs.highlightBlock(block);
    });

    var warnings = getWarnings(temp_params);
    if( warnings.length > 0 ){
        $("#error").html(
            "<span class='error'>" +
                warnings.join("<br>") + "</span>"
        );
    }else{
        $("#error").html("");
    }
}

setTimeout(function(){
    $("input").change( function() {
        update();
    });

}, 500);


/*Generates the table of instance variables*/
function generateTable(name, type, readonly){
    returned = "<tr id='table_" + name + "'>";
    returned += "<td>" + name + "</td>";
    returned += "<td>" + type + "</td>";
    returned += "<td>" + readonly + "</td>";
    returned += `<td><button onclick='deleteInstanceVar("` + name + `")'>Delete</td>`;
    returned += "</tr>";
    return returned;
}


function deleteInstanceVar(name){
    var index = -1;
    for(var i=0;i<instance_vars.length;i++){
        if( instance_vars[i].name === name ){
            index = i;
            break;
        }
    }

    if(index != -1) instance_vars.splice(index, 1);

    var element = document.getElementById("table_" + name);
    element.outerHTML = "";
    delete element;

    update();
}

function addInstancevar(){
    /*TODO USE FNACY REGEX*/
    var name = $("#var_name").val();
    if( name == "" ) return false;
    if( $("#var_type").val() == "" ) return false;

    if( instance_vars.map(x=>x.name).includes(name) ) return false;

    instance_vars.push({
        "name": name,
        "type":$("#var_type").val(),
        "writable": !$("#var_access").prop('checked')
    });
    update();

    document.getElementById("var_display").innerHTML += generateTable( $("#var_name").val(), $("#var_type").val(), $("#var_access").prop('checked') );
}

setTimeout(update, 200);
