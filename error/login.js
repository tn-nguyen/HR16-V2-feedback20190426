

function check_session() {
    var data = 'action=session&menu=check';
    data += "&sessionid=" + getCookie("ISESSIONID");

    $.ajax({
        datatype : 'text',
        type : 'POST',
        url : '/cgi-bin/webra_fcgi.fcgi',
        data: data,
        success: function(response) {
            if(response.indexOf("No Permission Error!") >= 0 ) {
                // alert(response);
                return false;
            }
            else if(response == "Password is not initiallized!") {
                self.location='redirect.html';
                return;
            }

            var result = encode_to_array(response);
            var cookie = null;

            if(result == null) {
                alert(response);
                return false;
            }

            if(result.result == 200) {
                self.location='html/live.htm';
            } else {
            }
        },
        fail: function(response) {
            console.log(response);
        }
    });
}


function init_login() {
    $("#btn_login").click(callback_btn_login);
    $("#btn_session_check").click(callback_session_check());
    $("#password").keyup(function(e) {
        if(e.keyCode == 13) {
            callback_btn_login();
        }
    });
    $("#btn_forgot_pw").click(showFindPassword);
    $("#complete_find_pw").click(sendSetPasswrod);
    $("#cancel_find_pw").click(hideFindPassword);
    $("#btn_export_user_file").click(exportAuthCode);


    $('input#btn_browsing_auth_code').change(importAuthCode);
}

function callback_btn_login() {
    var username = $("#username").val();
    var password = $("#password").val();
    var timestamp = new Date().getTime();
    var maxage = 86400;

    var data = 'action=session&menu=login';
    data += "&username=" + username;
    data += "&password=" + md5(password);
    data += "&timestamp=" + timestamp;
    data += "&maxage=" + maxage;
    // data += "&debug=";

    $.ajax({
        datatype : 'text',
        type : 'POST',
        url : '/cgi-bin/webra_fcgi.fcgi',
        data: data,
        success: function(response) {
            if(response.indexOf("No Permission Error!") >= 0) {
                alert("No Permission Error!");
            } else if(response.indexOf("Send Error!") >= 0) {
                alert("No Permission Error!");
            } else if (response.indexOf("DVR In SCM not ready!") >= 0) {
                alert(langArray["LTXT_ERR_NVR_NOT_READY"]);
            } else {
                var result = encode_to_array(response);
                var cookie = null;
                
                if(result.result == 200) {
                    // SUCCESS
                    setCookie("ISESSIONID", result.sessionid, result.maxage);
                    self.location='html/live.htm';
                    
                } else if(result.result == 423) {
                    $("#warning_msg").text(langArray['LTXT_LOGIN_LOCKING']);
                    $("#warning_msg").show();
                } else if(result.fail_count == -1) {
                    var text = langArray['LTXT_LOGIN_FAIL_NORMAL'];
                    $("#warning_msg").text(text);
                    $("#warning_msg").show();
                } else {
                    // ERROR OR RETURN 401 ERROR
                    //alert(langArray["LTXT_DIAGNOSIS_LOGIN_FAIL_CAMERA"]);
                    var remainCount = result.fail_limit - result.fail_count;
                    var text = sprintf(langArray['LTXT_LOGIN_FAIL_COUNT'], remainCount);
                        //"Incorrect user id or password. The device will be locked after " + remainCount + " failed login attempts.";
                    $("#warning_msg").text(text);
                    $("#warning_msg").show();
                }
            }


        },
        fail: function(response) {
            if(console && console.log) {
                console.log(response);
            }
        }
    });
}

function callback_session_check() {
    var username = $("#username").val();
    var password = $("#password").val();
    var maxage = 86400;

    var data = 'action=session&menu=check';

    $.ajax({
        datatype : 'text',
        type : 'POST',
        url : '/session/webra_session.fcgi',
        data: data,
        success: function(response) {
            if(response.indexOf("No Permission Error!") >= 0) {
                alert(response);
                return false;
            }

            var result = encode_to_array(response);
            var cookie = null;

            if(result.result == 200) {
                // SUCCESS
                cookie = cookie_to_array(document.cookie);
            } else {
                // ERROR OR RETURN 401 ERROR
                alert("error");
            }
        },
        fail: function(response) {
            console.log(response);
        }
    });
}

function showFindPassword() {
    $("#dialog_renew_pwd").hide();
    $("#dialog_find_password").show();
}

function hideFindPassword() {
    $("#dialog_renew_pwd").show();
    $("#dialog_find_password").hide();
}

function exportAuthCode() {
    var data = 'action=get_code&menu=find.password&response_type=0';

    document.location = 'cgi-bin/webra_fcgi.fcgi?'+data;
}

function importAuthCode() {
    var path = $('#btn_browsing_auth_code').val();
    console.log(path);

    // $("#myInput").change(function() {
    var names = [];
    for (var i = 0; i < this.files.length; ++i)
    {
        var F_name = this.files[i].name;
        names.push(F_name);
        var extension = F_name.replace(/^.*\./, '');
        if(extension == "xml")
        {
            var rd = new FileReader();
            rd.onload = function(e){
                console.log(this.result);
                $("#text_authorization_code").val(this.result);
                // var xmlDoc = $.parseXML(this.result);
                // var $xml = $(xmlDoc);
            };
            rd.readAsText(this.files[i]);
        }
    }
    // $("input[name=file_path]").val(names);

    // });
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
        return 1;
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
        return 2;
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
        return 3;
    }
 
    return 0;
}

function sendSetPasswrod() {
    var auth_code = $("#text_authorization_code").val();
    var password = $("#new_password").val();
    var confirm_password  = $("#new_password_confirm").val();

    if(auth_code.length < 10) {
        alert("Incorrect authorization code.");
        return;
    }
    else if(password != confirm_password) {
        alert(langArray['LTXT_DIFF_CONFIRM_PASS']);
        return;
    }
    else if(_valid_check_password(password, confirm_password) > 0) {
        alert(langArray['LTXT_ERR_USERPASSWD']);
        return;
    }

    var query = "&code=" + auth_code + "&passwd=" + password;
    var data = 'action=set_code&menu=find.password' + query;

    $.ajax({
        datatype : 'text',
        type : 'POST',
        url : '/cgi-bin/webra_fcgi.fcgi',
        data: data,
        success: function(response) {
            if(response.indexOf("status") < 0 ) {
                alert("Incorrect authorization code.");
                return false;
            }

            var result = encode_to_array(response);

            if(result["status"] == 1) {
                alert("Success!!!");
                hideFindPassword();
            }
            else {
                alert("Authcode error!!");
            }

        },
        fail: function(response) {
            console.log(response);
        }
    });
}
