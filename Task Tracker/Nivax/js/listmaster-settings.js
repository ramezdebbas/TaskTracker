(function () {
    "use strict";
    var page = WinJS.UI.Pages.define("/pages/listmaster-settings.html", {

        ready: function (element, options) {
            // Register the handlers for dismissal
            document.getElementById("applicationOptionsFlyout").addEventListener("keydown", handleAltLeft);
            document.getElementById("applicationOptionsFlyout").addEventListener("keypress", handleBackspace);
        },

        unload: function () {
            // Remove the handlers for dismissal
            document.getElementById("applicationOptionsFlyout").removeEventListener("keydown", handleAltLeft);
            document.getElementById("applicationOptionsFlyout").removeEventListener("keypress", handleBackspace);
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