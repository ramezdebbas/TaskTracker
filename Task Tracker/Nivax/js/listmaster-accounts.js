(function () {
    "use strict";
    var page = WinJS.UI.Pages.define("/pages/listmaster-accounts.html", {

        ready: function (element, options) {
            // Register the handlers for dismissal
            document.getElementById("applicationOptionsFlyout").addEventListener("keydown", handleAltLeft);
            document.getElementById("applicationOptionsFlyout").addEventListener("keypress", handleBackspace);
            document.getElementById("btnSignIn").addEventListener("click", doClickSignin);
            document.getElementById("btnSignOut").addEventListener("click", doClickSignout);

            var applicationData = Windows.Storage.ApplicationData.current;
            var roamingSettings = applicationData.roamingSettings;

            // Read data from a simple setting
            var value = roamingSettings.values["connectSkyDrive"];

            var control = document.querySelector("#connectSkyDrive");

            if (value == "yes") {
                control.winControl.checked = true;
                var session = WL.getSession();
                if (session) {
                    if (WL.canLogout()) {
                        document.getElementById("btnSignOut").style.display = "block";
                    } else {
                        document.getElementById("btnSignOut").style.display = "none";
                    }
                    document.getElementById("btnSignIn").style.display = "none";
                    if (ListMaster.currentUser != null) {
                        document.getElementById("currentUser").innerText = "Current User: " + ListMaster.currentUser;
                        document.getElementById("currentUserImg").src = ListMaster.currentUserImg;
                    } else {
                        document.getElementById("currentUser").style.display = "none";
                        document.getElementById("currentUserImg").style.display = "none";
                    }
                } else {
                    document.getElementById("btnSignOut").style.display = "none";
                    document.getElementById("btnSignIn").style.display = "block";
                    document.getElementById("currentUser").style.display = "none";
                    document.getElementById("currentUserImg").style.display = "none";
                }
            } else {
                control.winControl.checked = false;

                document.getElementById("btnSignOut").style.display = "none";
                document.getElementById("btnSignIn").style.display = "none";
                document.getElementById("currentUser").style.display = "none";
                document.getElementById("currentUserImg").style.display = "none";
            }

        },

        unload: function () {
            // Remove the handlers for dismissal
            document.getElementById("applicationOptionsFlyout").removeEventListener("keydown", handleAltLeft);
            document.getElementById("applicationOptionsFlyout").removeEventListener("keypress", handleBackspace);
            document.getElementById("btnSignIn").removeEventListener("click", doClickSignin);
            document.getElementById("btnSignout").removeEventListener("click", doClickSignout);
        },
    });

    function handleAltLeft(evt) {
        // Handles Alt+Left in the control and dismisses it
        if (evt.altKey && evt.key === 'Left') {
            WinJS.UI.SettingsFlyout.show();
        }
    };

    function handleBackspace(evt) {
        // Handles the backspace key or alt left arrow in the control and dismisses it
        if (evt.key === 'Backspace') {
            WinJS.UI.SettingsFlyout.show();
        }
    };
})();

WinJS.Utilities.markSupportedForProcessing(toggleSkyDrive);

function doClickSignin() {
    document.getElementById("accountStatus").innerText = "Signing In...";
    document.getElementById("winlive").style.display = "block";
    WL.init();
    WL.login({
        scope: ["wl.signin", "wl.skydrive_update"]
    }, onSigninComplete);
}

function onSigninComplete() {
    document.getElementById("winlive").style.display = "none";

    var control = document.querySelector("#connectSkyDrive");
    var session = WL.getSession();

    if (!session.error) {
        document.getElementById("btnSignIn").style.display = "none";
        setSkyDrive(true);
    } else {
        // an error occured signing in so set the toggle back to no
        roamingSettings.values["connectSkyDrive"] = "no";
        control.winControl.checked = false;
    }
}

function doClickSignout() {
    document.getElementById("accountStatus").innerText = "Signing out...";
    document.getElementById("winlive").style.display = "block";
    WL.init();
    WL.logout();
}

function toggleSkyDrive() {

    var applicationData = Windows.Storage.ApplicationData.current;
    var roamingSettings = applicationData.roamingSettings;

    // Read data from a simple setting
    var value = roamingSettings.values["connectSkyDrive"];

    if (value === "no") {
        roamingSettings.values["connectSkyDrive"] = "yes";

        document.getElementById("btnSignOut").style.display = "none";
        document.getElementById("btnSignIn").style.display = "block";
        document.getElementById("currentUser").style.display = "none";
        document.getElementById("currentUserImg").style.display = "none";
    }
    else {
        roamingSettings.values["connectSkyDrive"] = "no";

        document.getElementById("btnSignOut").style.display = "none";
        document.getElementById("btnSignIn").style.display = "none";
        document.getElementById("currentUser").style.display = "none";
        document.getElementById("currentUserImg").style.display = "none";

        setSkyDrive(false);
    }
}
