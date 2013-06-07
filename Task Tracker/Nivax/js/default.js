var homeList = {};
var selectedItemID = -1;
var selectedCategoryID = -1;
var timer = -1;
var changes = false;
var nav = null;
var hasSkyDrive = false;

(function () {
    "use strict";

    WinJS.Binding.optimizeBindingReferences = true;

    var appTitle = "Task Tracker";

    var pages = [
        { url: "/pages/ListMaster-home.html", title: "Task Tracker" },
        { url: "/pages/ListMaster-show.html", title: "Show List" },
        { url: "/pages/ListMaster-edit.html", title: "Edit List" }
    ];

    function activated(eventObject) {

        if (eventObject.detail.kind === Windows.ApplicationModel.Activation.ActivationKind.launch) {
            // Use setPromise to indicate to the system that the splash screen must not be torn down
            // until after processAll and navigate complete asynchronously.
            eventObject.setPromise(WinJS.UI.processAll().then(function () {
                checkSkyDrive();

                // Navigate to either the first scenario or to the last running scenario
                // before suspension or termination.
                if (eventObject.detail.arguments === "") {
                    if (ListMaster.currentList != null) {
                        var url = WinJS.Application.sessionState.lastUrl || pages[0].url;
                    } else {
                        var url = pages[0].url;
                    }

                    return WinJS.Navigation.navigate(url);
                } else {
                    //need to find the file associated with this argument and go to the show page
                    // Create query options with common query sort order and file type filter.
                    // This is called when the user clicks on a pinned tile
                    var search = Windows.Storage.Search;
                    var fileTypeFilter = [".lmx"];
                    var queryOptions = new search.QueryOptions(search.CommonFileQuery.orderByName, fileTypeFilter);

                    // Query the roaming folder library.
                    var queryLocal = Windows.Storage.ApplicationData.current.localFolder.createFileQueryWithOptions(queryOptions);
                    queryLocal.getFilesAsync().done(function (itemsLocal) {
                        // process the query results
                        itemsLocal.forEach(function (itemLocal) {
                            var loadSettings = new Windows.Data.Xml.Dom.XmlLoadSettings;
                            loadSettings.prohibitDtd = false;
                            loadSettings.resolveExternals = false;
                            Windows.Data.Xml.Dom.XmlDocument.loadFromFileAsync(itemLocal, loadSettings).then(function (doc) {
                                if (doc.selectSingleNode("/list").attributes.getNamedItem("id").value === eventObject.detail.arguments) {
                                    var initialState = new Object;
                                    initialState.mode = "file";
                                    initialState.file = itemLocal;

                                    var url = pages[1].url;
                                    return WinJS.Navigation.navigate(url, initialState);
                                }
                            });
                        });
                    });
                }
            }));
        } else if (eventObject.detail.kind === Windows.ApplicationModel.Activation.ActivationKind.file) {
            eventObject.setPromise(WinJS.UI.processAll().then(function () {
                checkSkyDrive();

                //Navigate directly to the list show page because the user has double clicked 
                //on an associated file
                var initialState = new Object;
                initialState.mode = "file";
                initialState.file = eventObject.detail.files[0];

                var url = pages[1].url;
                return WinJS.Navigation.navigate(url, initialState);
            }));

        }

    }

    WinJS.Navigation.addEventListener("navigated", function (eventObject) {
        var url = eventObject.detail.location;
        var host = document.getElementById("contentHost");
        // Call unload method on current scenario, if there is one
        host.winControl && host.winControl.unload && host.winControl.unload();
        WinJS.Utilities.empty(host);
        eventObject.detail.setPromise(WinJS.UI.Pages.render(url, host, eventObject.detail.state).then(function () {
            WinJS.Application.sessionState.lastUrl = url;
        }));
    });

    WinJS.Namespace.define("ListMaster", {
        appTitle: appTitle,
        pages: pages,
        settings: null,
        blankList: null,
        currentList: null,
        currentUser: null,
        currentUserImg: null,
        skydriveFolderID: "",
        file: null,
        lists: [],
        removeAppBars: function () {
            // Remove AppBar from previous pages
            var otherAppBars = document.querySelectorAll('div[data-win-control="WinJS.UI.AppBar"]');
            var len = otherAppBars.length;
            for (var i = 0; i < len; i++) {
                var otherPageAppBar = otherAppBars[i];
                otherPageAppBar.parentNode.removeChild(otherPageAppBar);
            }
        },
        loadXmlFile: function (foldername, filename, page, file) {
            ListMaster.file = null;

            if (file != null) {
                var loadSettings = new Windows.Data.Xml.Dom.XmlLoadSettings;
                loadSettings.prohibitDtd = false;
                loadSettings.resolveExternals = false;
                Windows.Data.Xml.Dom.XmlDocument.loadFromFileAsync(file, loadSettings).then(function (doc) {
                    ListMaster.file = file;
                    ListMaster.currentList = doc;
                    if (page == "show") {
                        show_doPageSetup();
                    } else if (page == "edit") {
                        edit_doPageSetup();
                    }
                }, function (error) {
                    errorhandler(error);
                });
            } else {
                Windows.ApplicationModel.Package.current.installedLocation.getFolderAsync(foldername).then(function (folder) {
                    folder.getFileAsync(filename).done(function (file) {
                        var loadSettings = new Windows.Data.Xml.Dom.XmlLoadSettings;
                        loadSettings.prohibitDtd = false;
                        loadSettings.resolveExternals = false;
                        Windows.Data.Xml.Dom.XmlDocument.loadFromFileAsync(file, loadSettings).then(function (doc) {
                            if (page == "startup") {
                                ListMaster.settings = doc;
                                doAppSetup();
                            } else {
                                ListMaster.currentList = doc;
                                if (page == "home") {
                                    ListMaster.blankList = doc;
                                } else if (page == "add") {
                                    edit_doPageSetup(true);
                                } else if (page == "edit") {
                                    ListMaster.file = file;
                                    edit_doPageSetup(false);
                                } else if (page == "show") {
                                    ListMaster.file = file;
                                    show_doPageSetup();
                                }
                            }
                        }, function (error) {
                            errorhandler(error);
                        });
                    }, function (error) {
                        errorhandler(error);
                    });
                }, function (error) {
                    errorhandler(error);
                });
            }
        },
        saveXmlFile: function (foldername, filename, doc, file) {
            var version = doc.selectSingleNode("/list").attributes.getNamedItem("version")
            if (!version) {
                version = doc.createAttribute("version");
                version.value = 1;
                doc.selectSingleNode("/list").attributes.setNamedItem(version);
            } else {
                version.value = parseInt(version.value) + 1;
            }
 
            if (file != null) {
                doc.saveToFileAsync(file).done(function () {
                    ListMaster.file = file;
                    if (doc.selectSingleNode("/list").attributes.getNamedItem("visibility").value == "skydrive") {
                        ListMaster.uploadXmlFile(file);
                    }
                }, function (error) {
                    errorhandler(error);
                });
            } else {
                var folder = Windows.Storage.ApplicationData.current.localFolder;
                folder.createFileAsync(filename, Windows.Storage.CreationCollisionOption.generateUniqueName).then(function (file) {
                    doc.saveToFileAsync(file).done(function () {
                        ListMaster.file = file;
                        if (hasSkyDrive) {
                            if (doc.selectSingleNode("/list").attributes.getNamedItem("visibility").value == "skydrive") {
                                ListMaster.uploadXmlFile(file);
                            }
                        }
                    }, function (error) {
                        errorhandler(error);
                    });
                }, function (error) {
                    errorhandler(error);
                });
            }
        },
        deleteXmlFile: function (page, file, fileID) {
            if (file != null) {
                file.deleteAsync().done(function () {
                    ListMaster.file = null;

                    if (hasSkyDrive && fileID) {
                        //a fileID has been passed so the file needs to be delete from skydrive as well
                        WL.login({
                            scope: "wl.skydrive_update"
                        }).then(function (response) {
                            WL.api({
                                path: fileID,
                                method: "DELETE"
                            }).then(function (response) {
                                if (page == "home") {
                                    doHomePageSetup();
                                }
                            });
                        });
                    } else {
                        if (page == "home") {
                            doHomePageSetup();
                        }
                    }
                }, function (error) {
                    errorhandler(error);
                });
            }
        },
        uploadXmlFile: function (file) {
            WL.login({
                scope: "wl.skydrive_update"
            }).then(function (response) {
                WL.backgroundUpload({
                    path: ListMaster.skydriveFolderID,
                    file_name: file.name,
                    file_input: file,
                    overwrite: true
                });
            });
        },
        createID: function () {
            var sID = Date.parse(Date()) + Math.random().toString().replace("0.", "") + Math.random().toString().replace("0.", "");
            sID = sID.substring(0, 30);
            return sID;
        },
        toaRGB: function (hexColor) {
            var color = { a: 0, r: 0, g: 0, b: 0 };

            if (hexColor.charAt(0) === "#") {
                hexColor = hexColor.substr(1, 6);
            }

            color.r = parseInt(hexColor.substr(0, 2), 16);
            color.g = parseInt(hexColor.substr(2, 2), 16);
            color.b = parseInt(hexColor.substr(4, 2), 16);

            return color;
        }
    });

    WinJS.Application.onsettings = function (e) {
        e.detail.applicationcommands = {  "about": { title: "About", href: "/pages/listmaster-about.html" }, "accounts": { title: "Accounts", href: "/pages/listmaster-accounts.html" } };
        WinJS.UI.SettingsFlyout.populateSettings(e);
    };

    WinJS.Application.addEventListener("activated", activated, false);
    WinJS.Application.start();
})();

function checkSkyDrive() {
    var applicationData = Windows.Storage.ApplicationData.current;
    var roamingSettings = applicationData.roamingSettings;

    // Read data from a simple setting
    var value = roamingSettings.values["connectSkyDrive"];
    if ((!value) || (value === "no")) {
        roamingSettings.values["connectSkyDrive"] = "no";
        setSkyDrive(false);
    } else {
        // Initialise the Windows Live environment
        WL.init();
        WL.getLoginStatus().then(function (response) {
            onSessionChange(response);
        });
    }
}

function onSessionChange(response) {
    var session = WL.getSession();
    if (!session) {
        setSkyDrive(false);
    } else {
        setSkyDrive(true);
    }
}

function onLoginComplete() {
    var session = WL.getSession();
    if (!session.error) {
        setSkyDrive(true);
    } else {
        setSkyDrive(false);
    }
}

function setSkyDrive(status) {
    var oStatus = document.getElementById("skydrivestatus");
    var oProgress = document.getElementById("progressSignIn");
    var oLogo = document.getElementById("skydrivelogo");

    if (status) {
        oStatus.innerText = "Connected";

        WL.api({
            path: "me",
            method: "GET"
        }).then(function (response) {
            ListMaster.currentUser = response.first_name + " " + response.last_name;
        });

        WL.api({
            path: "me/picture",
            method: "GET"
        }).then(function (response) {
            if (response.location) {
                ListMaster.currentUserImg = response.location;
            }
        });

        WL.api({
            path: "me/skydrive/files",
            method: "GET"
        }).then(function (response) {
            var listFolderID = "";
            for (var s = 0; s < response.data.length; s++) {
                if (response.data[s].name == "ListMaster") {
                    listFolderID = response.data[s].id;
                }
            }

            if (listFolderID === "") {
                // the listMaster folder doesn't exist yet so we should created it
                WL.api({
                    path: "me/skydrive",
                    method: "POST",
                    body: {
                        "name": "ListMaster",
                        "description": "Holds files used by the Task Tracker application"
                    }
                }).then(function (response) {
                    getRemotefiles();
                }, function (responseFailed) {
                    showMessage(responseFailed.error.message);
                });
            } else {
                ListMaster.skydriveFolderID = listFolderID;
            }
        });

        if (document.getElementById("btnDownload")) {
            var appBar = document.getElementById("appBar").winControl;
            appBar.showCommands([btnDownload]);
        }

    } else {
        oStatus.innerText = "Not connected";

        ListMaster.currentUser = null;
        ListMaster.currentUserImg = null;
        ListMaster.skydriveFolderID = "";

        if (document.getElementById("btnDownload")) {
            var appBar = document.getElementById("appBar").winControl;
            appBar.hideCommands([btnDownload]);
        }
    }

    oProgress.style.display = "none";
    oLogo.style.display = "block";

    hasSkyDrive = status;
}

function doAppSetup() {
    //write code here to configure the app based on settings XML file
}

function errorhandler(details) {
    // Create the message dialog and set its content
    var msg = new Windows.UI.Popups.MessageDialog("An error has occured.\n" + details.description, "Oops!");

    // Add commands and set their command handlers
    msg.commands.append(new Windows.UI.Popups.UICommand("OK", null));

    // Set the command that will be invoked by default
    msg.defaultCommandIndex = 0;

    // Set the command to be invoked when escape is pressed
    msg.cancelCommandIndex = 0;

    // Show the message dialog
    msg.showAsync();
    //return WinJS.Navigation.navigate("error.html", details);
}

function showMessage(message) {
    // Create the message dialog and set its content
    var msg = new Windows.UI.Popups.MessageDialog(message);

    // Add commands and set their command handlers
    msg.commands.append(new Windows.UI.Popups.UICommand("OK", null));

    // Set the command that will be invoked by default
    msg.defaultCommandIndex = 0;

    // Set the command to be invoked when escape is pressed
    msg.cancelCommandIndex = 0;

    // Show the message dialog
    msg.showAsync();
}


function showColorPicker() {
    var btnColor = document.querySelector(".editListBgColor");

    document.getElementById("colorPicker").winControl.show(btnColor);
}

function selectPaletteTile(tileColor) {
    document.getElementById("color-Hex").value = tileColor;
    updateColorText();
}

function updateColorRange() {
    var txtHex = document.getElementById("color-Hex");
    var rngRed = document.getElementById("color-Red");
    var rngGreen = document.getElementById("color-Green");
    var rngBlue = document.getElementById("color-Blue");
    var colorSample = document.getElementById("color-Sample");
    var txtPrevious = document.getElementById("color-Previous");

    var Red = rngRed.valueAsNumber.toString(16);
    var Green = rngGreen.valueAsNumber.toString(16);
    var Blue = rngBlue.valueAsNumber.toString(16);

    if (Red.length == 1) {
        Red = "0" + Red;
    }
    if (Green.length == 1) {
        Green = "0" + Green;
    }
    if (Blue.length == 1) {
        Blue = "0" + Blue;
    }

    txtHex.value = Red + Green + Blue;
    colorSample.style.backgroundColor = "#" + txtHex.value
    txtPrevious.value = txtHex.value;
}

function updateColorText() {
    var txtHex = document.getElementById("color-Hex");
    var rngRed = document.getElementById("color-Red");
    var rngGreen = document.getElementById("color-Green");
    var rngBlue = document.getElementById("color-Blue");
    var colorSample = document.getElementById("color-Sample");
    var txtPrevious = document.getElementById("color-Previous");

    if (txtHex.value.length == 6) {
        rngRed.value = parseInt(txtHex.value.substr(0, 2), 16);
        rngGreen.value = parseInt(txtHex.value.substr(2, 2), 16);
        rngBlue.value = parseInt(txtHex.value.substr(4, 2), 16);

        colorSample.style.backgroundColor = "#" + txtHex.value;
        txtPrevious.value = txtHex.value;
    } else {
        txtHex.value = txtPrevious.value;
    }

}

function doNavigateBack() {
    if (WinJS.Navigation.canGoBack) {
        WinJS.Navigation.back();
    }
}

function activateCSS(page, style) {
    var sheetName = ""

    if (page == null) {
        showMessage("You must pass a page to activate a style");
    } else {
        if (page == "show") {
            if (style == null) {
                sheetName = "listmaster-show.css"
            } else {
                if (style == "light") {
                    sheetName = "listmaster-show-light.css"
                } else if (style == "dark") {
                    sheetName = "listmaster-show-dark.css"
                }
            }
        } else if (page == "edit") {
            sheetName = "listmaster-edit.css"
        } else if (page == "home") {
            sheetName = "listmaster-home.css"
        } else {
            showMessage("unknown page passed to style sheet activate.");
        }
    }

    if (sheetName != "") {
        for (var s = 0; s < document.styleSheets.length; s++) {
            var style = document.styleSheets[s];
            if ((style.href != null) && (style.href.indexOf(sheetName, 0) > 0)) {
                style.disabled = false;
            }
        }
    }
}

function deactivateCSS(page) {
    var sheetName = ""

    if (page == null) {
        showMessage("You must pass a page to deactivate styles");
    } else {
        if (page == "home") {
            sheetName = "listmaster-home.css"
        } else if (page == "edit") {
            sheetName = "listmaster-edit.css"
        } else if (page == "show") {
            sheetName = "listmaster-show"
        } else {
            showMessage("unknown page passed to style sheet deactivate.");
        }
    }

    if (sheetName != "") {
        for (var s = 0; s < document.styleSheets.length; s++) {
            var style = document.styleSheets[s];
            if ((style.href != null) && (style.href.indexOf(sheetName, 0) > 0)) {
                style.disabled = true;
            }
        }
    }
}