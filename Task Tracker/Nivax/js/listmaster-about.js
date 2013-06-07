(function () {
    "use strict";
    var page = WinJS.UI.Pages.define("/pages/listmaster-about.html", {

        ready: function (element, options) {
            // Register the handlers for dismissal
            document.getElementById("applicationAboutFlyout").addEventListener("keydown", handleAltLeft);
            document.getElementById("applicationAboutFlyout").addEventListener("keypress", handleBackspace);
            //var version = Windows.Storage.ApplicationData.version;
            //document.getElementById("appVersion").innerText = version;
        },

        unload: function () {
            // Remove the handlers for dismissal
            document.getElementById("applicationAboutFlyout").removeEventListener("keydown", handleAltLeft);
            document.getElementById("applicationAboutFlyout").removeEventListener("keypress", handleBackspace);
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

