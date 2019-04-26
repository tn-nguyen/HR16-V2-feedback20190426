

function rediect_index() {
    $("#dialog_renew_pwd").hide();
    
    _session_check();
}

function regist_callback() {
    $("#btn_send_password").click(onclick_send_set_password);
    $("#new_password").keyup(_changed_password);
    $("#confirm_password").keyup(_changed_password);
}

function setLanuage() {
    // $("#password_rules_1").text("1. " + langArray["LTXT_SETUPUSER_PASSWDRULE1"]);
    // $("#password_rules_2").text("2. " + langArray["LTXT_SETUPUSER_PASSWDRULE2_I3"]);
    // $("#password_rules_3").text("3. " + langArray["LTXT_SETUPUSER_PASSWDRULE6"]);
}

function _session_check() {
    var session = getCookie("ISESSIONID");
    var action = "action=session&menu=check&sessionid="+session;

    $.ajax({
        url: "/cgi-bin/webra_fcgi.fcgi",
        type: 'POST',
        data: action,
        async: false,
        success: function(response) {
            session_error_count = 0;

            if(response == "No Permission Error!") {
                move_login_page();
                return;
            }
            else if(response == "Password is not initiallized!") {
                $("#dialog_renew_pwd").show();
                regist_callback();
                setLanuage();
                return;
            }

            var tmp = response.replace(/^&+/, "");;

            var array = encode_to_array(tmp);

            if(array["result"] != 200) {
                move_login_page();
                return;
            }

            if ( browerIE == true ) {
                var request_os = window.navigator.appVersion;
                request_os = request_os.toLowerCase();
                if ( request_os.indexOf('nt 6.') > 0 
                     || request_os.indexOf('nt 10.') > 0) {
                    self.location='html/trustsite.htm';
                }
            }
            else {
                self.location='html/live.htm';
            }

            return;
        },
        error: function(response) {
            move_login_page();
            return;
        }
    });

}

function onclick_send_set_password() {
    var password = $("#new_password").val();
    var confirm_password = $("#confirm_password").val();


    if(password != confirm_password) {
        alert(langArray['LTXT_DIFF_CONFIRM_PASS']);
    }
    else if(_password_valid_check()) {
        var action = "action=set_init&menu=password&passwd=" + $("#new_password").val();

        $.ajax({
            url: "/cgi-bin/webra_fcgi.fcgi",
            type: 'POST',
            data: action,
            async: false,
            success: function(response) {
                if(response == "No Permission Error!") {
                    alert("Send error!!!");
                    return;
                }

                var array = encode_to_array(response);

                self.location='login.htm';
            },
            error: function(response) {
                alert("Send Error");
                return;
            }
        });
    }
    else {
        alert(langArray['LTXT_ERR_USERPASSWD']);
    }


}

function _password_valid_check() {
    var password = $("#new_password").val();
    var confirm_password = $("#confirm_password").val();
    
    var valid_status = _valid_check_password(password, confirm_password);

    // if(password.length == 0 && confirm_password.length == 0) {
    //     return false;
    // }
    // else if(password != confirm_password) {
    //     return false;
    // }

    // console.log(password + " / " + confirm_password);
    
    return valid_status;
}

function _changed_password(e) {
    if(e.keyCode == 13) {
        onclick_send_set_password();
    }
    else {
        var password = $("#new_password").val();
        var confirm_password = $("#confirm_password").val();

        _valid_check_password(password, confirm_password);
    }
}

function _valid_check_password(pw1, pw2) {
    var valid_status = true;
    
    var filter = /^[A-Za-z0-9\`\!\@\#\$\%\^\&\*\(\)\_\+\[\]\|\:\'\,\;\/\~\-\=\{\}\\\.\"\<\>\?\ ]+$/,
        filterUpperCase = /[A-Z]+/,
        filterLowerCase = /[a-z]+/,
        filterNumeric = /[0-9]+/,
        filterSpecial = /[^0-9A-Za-z\ \~\`\!\@\#\$\^\&\-\_\.\;\,\t\r\n]+/;
    
    
    if( (pw1.length < 8)
        || (pw1.length > 16 || pw2.length > 16)) {
        valid_status = false;
        $("#password_rules_1").css("color", "red");
    }
    else {
        $("#password_rules_1").css("color", "green");
    }

    var conbinationCheck = 0;
    if(filterUpperCase.test(pw1)) {
        conbinationCheck++;
    }
    if(filterLowerCase.test(pw1)) {
        conbinationCheck++;
    }
    if(filterNumeric.test(pw1)) {
        conbinationCheck++;
    }
    if(filterSpecial.test(pw1)) {
        conbinationCheck++;
    }

    if( conbinationCheck < 2) {
        valid_status = false;
        $("#password_rules_2").css("color", "red");
    }
    else {
        $("#password_rules_2").css("color", "green");
    }

    // if( pw1 != pw2 ) {
    //     valid_status = false;
    //     $("#password_rules_3").css("color", "red");
    // }
    // else {
    //     $("#password_rules_3").css("color", "green");
    // }

    if( filterSpecial.test(pw1)) {
        valid_status = false;
        $("#password_rules_3").css("color", "red");
    }
    else {
        $("#password_rules_3").css("color", "green");
    }

    return valid_status;
}


