(function () {
    "use strict";
    var page = WinJS.UI.Pages.define("/pages/listmaster-home.html", {
        ready: function (element, options) {
            document.getElementById("btnAdd").addEventListener("click", home_doClickAdd, false);
            document.getElementById("btnEdit").addEventListener("click", home_doClickEdit, false);
            document.getElementById("btnDelete").addEventListener("click", home_doClickDelete, false);
            document.getElementById("btnShow").addEventListener("click", home_doClickShow, false);
            document.getElementById("btnRoam").addEventListener("click", home_doClickRoam, false);
            document.getElementById("btnDownload").addEventListener("click", home_doClickDownload, false);
            document.getElementById("btnPin").addEventListener("click", home_doClickPin, false);
            document.getElementById("pageTitle").innerText = "Task Tracker";

            window.addEventListener("resize", onLayoutChanged, false);

            ListMaster.loadXmlFile("data", "list-blank.xml", "home");

            doHomePageSetup();

            var listSelector = document.getElementById("listSelectorView").winControl
            listSelector.addEventListener("iteminvoked", home_doInvokeList, false);
            listSelector.addEventListener("selectionchanged", home_doSelectList, false);

            activateCSS("home");
        },
        unload: function () {
            ListMaster.lists = [];
            ListMaster.removeAppBars();
            deactivateCSS("home");
            window.removeEventListener("resize", onLayoutChanged, false);
            clearInterval(timer);
        }
    });

    // Command button functions
    function home_doClickAdd() {
        var listView = document.getElementById("listSelectorView").winControl;
        listView.selection.clear().done(function () {
            var initialState = new Object;
            initialState.mode = "add";

            WinJS.Navigation.navigate(ListMaster.pages[2].url, initialState);
        });
    }

    function home_doClickEdit() {
        var listView = document.getElementById("listSelectorView").winControl;

        if (listView.selection.count() > 0) {
            listView.selection.getItems().done(function (currentSelection) {
                currentSelection.forEach(function (selectedItem) {
                    home_editList(selectedItem.data.file);
                });
            });
        }
    }

    function home_doClickDelete(element) {
        var message = "";
        var listView = document.getElementById("listSelectorView").winControl;

        if (listView.selection.count() > 0) {
            listView.selection.getItems().done(function (currentSelection) {
                currentSelection.forEach(function (selectedItem) {
                    if (Windows.UI.StartScreen.SecondaryTile.exists(selectedItem.data.id)) {
                        // this list has been pinned so tell the user to unpin it first 
                        showMessage("This list has been pinned to the Start Screen. You must unpin it before you can delete it.");
                    } else {
                        // the list hasn't been pinned so  display the normal dialog

                        if (selectedItem.data.skydrive && hasSkyDrive) {
                            message = "This will remove the list from your PC and from your SkyDrive. Are you sure you want to do this?";
                        } else {
                            message = "This will remove the list from your PC. Are you sure you want to do this?";
                        }

                        // Create the message dialog and set its content
                        var msg = new Windows.UI.Popups.MessageDialog(message);

                        // Add commands and set their command handlers
                        msg.commands.append(new Windows.UI.Popups.UICommand("Yes", home_doDelete));
                        msg.commands.append(new Windows.UI.Popups.UICommand("No", null));

                        // Set the command that will be invoked by default
                        msg.defaultCommandIndex = 0;

                        // Set the command to be invoked when escape is pressed
                        msg.cancelCommandIndex = 1;

                        // Show the message dialog
                        msg.showAsync();
                    }

                 });
            });
        }
    }

    function home_doDelete() {
        var listView = document.getElementById("listSelectorView").winControl;

        if (listView.selection.count() > 0) {
            listView.selection.getItems().done(function (currentSelection) {
                currentSelection.forEach(function (selectedItem) {
                    home_deleteList(selectedItem.data);
                });
            });
        }
    }

    function home_deleteList(item) {
        ListMaster.deleteXmlFile("home", item.file, item.fileID);
    }

    function home_doClickPin(element) {
        var listView = document.getElementById("listSelectorView").winControl;

        if (listView.selection.count() > 0) {
            listView.selection.getItems().done(function (currentSelection) {
                currentSelection.forEach(function (selectedItem) {
                    var btnPin = document.getElementById("btnPin").winControl;

                    if (Windows.UI.StartScreen.SecondaryTile.exists(selectedItem.data.id)) {
                        var tile = new Windows.UI.StartScreen.SecondaryTile(selectedItem.data.id);

                        var selectionRect = element.srcElement.getBoundingClientRect();
                        var buttonCoordinates = { x: selectionRect.left, y: selectionRect.top, width: selectionRect.width, height: selectionRect.height };
                        var placement = Windows.UI.Popups.Placement.above;

                        return new WinJS.Promise(function (complete, error, progress) {
                            tile.requestDeleteForSelectionAsync(buttonCoordinates, placement).done(function (isDeleted) {
                                if (isDeleted) {
                                    complete(true);

                                    btnPin.label = "Pin to Start";
                                    btnPin.icon = WinJS.UI.AppBarIcon.pin;
                                    btnPin.tooltip = "Pin List to Start Screen";
                                } else {
                                    complete(false);
                                }
                            });
                        });

                    } else {
                        if (selectedItem.data.textcolor == "light") {
                            var uriLogo = new Windows.Foundation.Uri("ms-appx:///images/logo.png");
                            var uriwideLogo = new Windows.Foundation.Uri("ms-appx:///images/splashscreen.png");
                        } else {
                            var uriLogo = new Windows.Foundation.Uri("ms-appx:///images/logo_dark.png");
                            var uriwideLogo = new Windows.Foundation.Uri("ms-appx:///images/splashscreen_dark.png");
                        }
                        var tileOptions = Windows.UI.StartScreen.TileOptions.showNameOnLogo + Windows.UI.StartScreen.TileOptions.showNameOnWideLogo;
                        var tile = new Windows.UI.StartScreen.SecondaryTile(selectedItem.data.id, selectedItem.data.title, "Task Tracker List", selectedItem.data.id, tileOptions, uriLogo, uriwideLogo);

                        tile.backgroundColor = ListMaster.toaRGB(selectedItem.data.bgcolor);
                        if (selectedItem.data.textcolor == "light") {
                            tile.foregroundText = Windows.UI.StartScreen.ForegroundText.light;
                            tile.smallLogo = new Windows.Foundation.Uri("ms-appx:///images/smalllogo.png");
                        } else {
                            tile.foregroundText = Windows.UI.StartScreen.ForegroundText.dark;
                            tile.smallLogo = new Windows.Foundation.Uri("ms-appx:///images/smalllogo_dark.png");
                        }

                        var selectionRect = element.srcElement.getBoundingClientRect();
                        var buttonCoordinates = { x: selectionRect.left, y: selectionRect.top, width: selectionRect.width, height: selectionRect.height };
                        var placement = Windows.UI.Popups.Placement.above;

                        return new WinJS.Promise(function (complete, error, progress) {
                            tile.requestCreateForSelectionAsync(buttonCoordinates, placement).done(function (isCreated) {
                                if (isCreated) {
                                    complete(true);

                                    var notifications = Windows.UI.Notifications;
                                    var wideTemplate = notifications.TileTemplateType.tileWideText09;
                                    var tileXml = notifications.TileUpdateManager.getTemplateContent(wideTemplate);

                                    var tileTextAttributes = tileXml.getElementsByTagName("text");
                                    tileTextAttributes[0].appendChild(tileXml.createTextNode(selectedItem.data.title));
                                    tileTextAttributes[1].appendChild(tileXml.createTextNode(selectedItem.data.description));

                                    var squareTemplate = notifications.TileTemplateType.tileSquareText04;
                                    var squareTileXml = notifications.TileUpdateManager.getTemplateContent(squareTemplate);

                                    var squareTileTextAttributes = squareTileXml.getElementsByTagName("text");
                                    squareTileTextAttributes[0].appendChild(squareTileXml.createTextNode(selectedItem.data.title));

                                    var node = tileXml.importNode(squareTileXml.getElementsByTagName("binding").item(0), true);
                                    tileXml.getElementsByTagName("visual").item(0).appendChild(node);

                                    var tileNotification = new notifications.TileNotification(tileXml);

                                    var updater = notifications.TileUpdateManager.createTileUpdaterForSecondaryTile(selectedItem.data.id);
                                    updater.update(tileNotification);

                                    btnPin.label = "Unpin from Start";
                                    btnPin.icon = WinJS.UI.AppBarIcon.unpin;
                                    btnPin.tooltip = "Unpin List from Start Screen";

                                } else {
                                    complete(false);
                                }
                            });
                        });

                    }

                });
            });
        }
    }
    
    function home_doClickRoam() {
        var listView = document.getElementById("listSelectorView").winControl;

        if (listView.selection.count() > 0) {
            listView.selection.getItems().done(function (currentSelection) {
                currentSelection.forEach(function (selectedItem) {
                    home_toggleRoam(selectedItem.data, selectedItem.data.skydrive);
                });
            });
        }
    }

    function home_doClickShow() {
        var listView = document.getElementById("listSelectorView").winControl;

        if (listView.selection.count() > 0) {
            listView.selection.getItems().done(function (currentSelection) {
                currentSelection.forEach(function (selectedItem) {
                    home_showList(selectedItem.data.file);
                });
            });
        }
    }

    function home_toggleRoam(item, skydrive) {
        var rootProgress = document.getElementById("rootProgress");
        rootProgress.style.display = "block";

        WL.login({
            scope: "wl.skydrive_update"
        }).then( function (response) {
            if (skydrive) {
                //this is where the delete code needs to go
                WL.api ({
                    path: item.fileID,
                    method: "DELETE"
                }).then(function (response) {
                    //now we need to update the visibility attribute of this list
                    var loadSettings = new Windows.Data.Xml.Dom.XmlLoadSettings;
                    loadSettings.prohibitDtd = false;
                    loadSettings.resolveExternals = false;
                    Windows.Data.Xml.Dom.XmlDocument.loadFromFileAsync(item.file, loadSettings).then(function (doc) {
                        doc.selectSingleNode("/list").attributes.getNamedItem("visibility").value = "private";
                        doc.saveToFileAsync(item.file).done(function () {
                            if (item.file.path.indexOf("RoamingState") > 0) {
                                item.file.moveAsync(Windows.Storage.ApplicationData.current.localFolder).done(doHomePageSetup);
                            } else {
                                doHomePageSetup();
                            }
                        });
                    });

                }, function (responseFailed) {
                    showMessage(responseFailed.error.message);
                });
            } else {
                //this is where the upload code needs to go
                WL.backgroundUpload({
                    path: ListMaster.skydriveFolderID,
                    file_name: item.file.name,
                    file_input: item.file
                }).then(function (response) {
                    //now we need to update the visibility attribute of this list
                    var loadSettings = new Windows.Data.Xml.Dom.XmlLoadSettings;
                    loadSettings.prohibitDtd = false;
                    loadSettings.resolveExternals = false;
                    Windows.Data.Xml.Dom.XmlDocument.loadFromFileAsync(item.file, loadSettings).then(function (doc) {
                        doc.selectSingleNode("/list").attributes.getNamedItem("visibility").value = "skydrive";
                        doc.saveToFileAsync(item.file).done(function () {
                            if (item.file.path.indexOf("RoamingState") > 0) {
                                item.file.moveAsync(Windows.Storage.ApplicationData.current.localFolder).done(doHomePageSetup);
                            } else {
                                doHomePageSetup();
                            }
                        });
                    });
                }, function (responseFailed) {
                    showMessage(responseFailed.error.message);
                });
            }
        });
    }

    function home_editList(file) {
        var initialState = new Object;
        initialState.mode = "edit";
        initialState.file = file;

        WinJS.Navigation.navigate(ListMaster.pages[2].url, initialState);
    }

    function home_showList(file) {
        var initialState = new Object;
        initialState.mode = "file";
        initialState.file = file;

        var url = ListMaster.pages[1].url;
        return WinJS.Navigation.navigate(url, initialState);
    }

    function home_doInvokeList(eventObject) {
        eventObject.detail.itemPromise.done(function (invokedItem) {
            home_showList(invokedItem.data.file);
        });
    }

    function home_doSelectList(eventObject) {
        var appBar = document.getElementById('appBar').winControl;
        var listView = document.getElementById("listSelectorView").winControl;
        var count = listView.selection.count();
        if (count > 0) {
            listView.selection.getItems().done(function (currentSelection) {
                currentSelection.forEach(function (selectedItem) {
                    var btnPin = document.getElementById("btnPin").winControl;

                    // see if the list in question has a secondary tile and update the pin button accordingly
                    if (Windows.UI.StartScreen.SecondaryTile.exists(selectedItem.data.id)) {
                        btnPin.label = "Unpin from Start";
                        btnPin.icon = WinJS.UI.AppBarIcon.unpin;
                        btnPin.tooltip = "Unpin List from Start Screen";
                    } else {
                        btnPin.label = "Pin to Start";
                        btnPin.icon = WinJS.UI.AppBarIcon.pin;
                        btnPin.tooltip = "Pin List to Start Screen";
                    }

                    // Show selection commands in AppBar
                    if (hasSkyDrive) {
                        appBar.showCommands([btnRoam, btnDownload, btnEdit, btnDelete, btnShow, btnPin]);
                    } else {
                        appBar.showCommands([btnEdit, btnDelete, btnShow, btnPin]);
                    }
                    appBar.sticky = true;
                    appBar.show();

                });
            });
        } else {
            // Hide selection commands in AppBar
            if (hasSkyDrive) {
                appBar.hideCommands([btnRoam, btnEdit, btnDelete, btnShow, btnPin]);
            } else {
                appBar.hideCommands([btnRoam, btnDownload, btnEdit, btnDelete, btnShow, btnPin]);
            }
            appBar.hide();
            appBar.sticky = false;
        }
    }

})();

WinJS.Utilities.markSupportedForProcessing(listSelectorTemplate);

function home_doClickDownload() {
    if (hasSkyDrive) {
        WL.login({
            scope: "wl.skydrive_update"
        }).then(function (response) {
            WL.api({
                path: ListMaster.skydriveFolderID + "/files",
                method: "GET"
            }).then(function (response) {
                var newCount = 0;
                var downloaded = 0;

                var rootProgress = document.getElementById("rootProgress");
                rootProgress.style.display = "block";

                for (var x = 0; x < response.data.length; x++) {
                    if (response.data[x].name.indexOf(".lmx") > 0) {
                        var exists = false;

                        for (var l = 0; l < ListMaster.lists.length; l++) {
                            if (ListMaster.lists[l].fileID == response.data[x].id) {
                                //we have a match so mark this as found
                                exists = true;
                            }
                        }

                        if (!exists) {
                            //there is a list on skydrive that isn't on the local machine
                            //so download it 
                            newCount = newCount + 1;
                            var downloadID = response.data[x].source;

                            downloadFile(response.data[x].source, response.data[x].name, newCount, downloaded);
                        }
                    }
                }

                if (newCount == 0) {
                    rootProgress.style.display = "none";
                    showMessage("There are no additional lists saved to your skydrive location.");
                }

            }, function (responseFailed) {
                showMessage(responseFailed.error.message);
            });
        }, function (responseFailed) {
            showMessage(responseFailed.error.message);
        });
    }
}

function downloadFile(downloadID, filename, newCount, downloaded) {
    var folder = Windows.Storage.ApplicationData.current.localFolder;
    folder.createFileAsync(filename, Windows.Storage.CreationCollisionOption.generateUniqueName).then(function (file) {
        WL.backgroundDownload({
            path: downloadID,
            file_output: file
        }).then(function (download) {
            downloaded = downloaded + 1;

            if (newCount == downloaded) {
                //done them all so update the list
                doHomePageSetup();
            }
        });
    });
}

function getFiles() {
    var search = Windows.Storage.Search;
    var fileProperties = Windows.Storage.FileProperties;
    var r = 0;
    var f = 0;
    var lists = [];

    // Create query options with common query sort order and file type filter.
    var fileTypeFilter = [".lmx"];
    var queryOptions = new search.QueryOptions(search.CommonFileQuery.orderByName, fileTypeFilter);

    // Query the roaming folder library.
    var queryRoaming = Windows.Storage.ApplicationData.current.roamingFolder.createFileQueryWithOptions(queryOptions);
    queryRoaming.getFilesAsync().done(function (itemsRoaming) {
        // process the query results
        itemsRoaming.forEach(function (itemRoaming) {
            var loadSettings = new Windows.Data.Xml.Dom.XmlLoadSettings;
            loadSettings.prohibitDtd = false;
            loadSettings.resolveExternals = false;
            Windows.Data.Xml.Dom.XmlDocument.loadFromFileAsync(itemRoaming, loadSettings).then(function (doc) {

                var listSelector = {
                    id: doc.selectSingleNode("/list").attributes.getNamedItem("id").value,
                    title: doc.selectSingleNode("/list").attributes.getNamedItem("title").value,
                    description: doc.selectSingleNode("/list/description").innerText,
                    bgcolor: doc.selectSingleNode("/list").attributes.getNamedItem("bgcolor").value,
                    textcolor: doc.selectSingleNode("/list").attributes.getNamedItem("textcolor").value,
                    file: itemRoaming,
                    counter: r,
                    roaming: true,
                    skydrive: (doc.selectSingleNode("/list").attributes.getNamedItem("visibility").value == "skydrive"),
                    fileID: null,
                    version: doc.selectSingleNode("/list").attributes.getNamedItem("version").value
                }

                lists[r] = listSelector;
                r++;

                if (r == f) {
                    //we just processed the last one from the roaming folder so we now should do the same with the local folder
                    var l = 0;
                    var t = 0;

                    var queryLocal = Windows.Storage.ApplicationData.current.localFolder.createFileQueryWithOptions(queryOptions);
                    queryLocal.getFilesAsync().done(function (itemsLocal) {
                        // process the query results
                        itemsLocal.forEach(function (itemLocal) {
                            var loadSettings = new Windows.Data.Xml.Dom.XmlLoadSettings;
                            loadSettings.prohibitDtd = false;
                            loadSettings.resolveExternals = false;
                            Windows.Data.Xml.Dom.XmlDocument.loadFromFileAsync(itemLocal, loadSettings).then(function (doc) {

                                var listSelector = {
                                    id: doc.selectSingleNode("/list").attributes.getNamedItem("id").value,
                                    title: doc.selectSingleNode("/list").attributes.getNamedItem("title").value,
                                    description: doc.selectSingleNode("/list/description").innerText,
                                    bgcolor: doc.selectSingleNode("/list").attributes.getNamedItem("bgcolor").value,
                                    textcolor: doc.selectSingleNode("/list").attributes.getNamedItem("textcolor").value,
                                    file: itemLocal,
                                    counter: r+l,
                                    roaming: false,
                                    skydrive: (doc.selectSingleNode("/list").attributes.getNamedItem("visibility").value == "skydrive"),
                                    fileID: null,
                                    version: doc.selectSingleNode("/list").attributes.getNamedItem("version").value
                                }

                                lists[r+l] = listSelector;
                                l++;

                                if (l == t) {
                                    //we should now have processed everything so bind the list
                                    //then check on skydrive
                                    home_bindList(lists)
                                    if (hasSkyDrive) {
                                        getRemoteFiles(lists)
                                    }
                                }
                            });

                            t++;
                        });

                        if (itemsLocal.length == 0) {
                            //we still need to bind the list because there were some roaming items
                            home_bindList(lists)
                            if (hasSkyDrive) {
                                getRemoteFiles(lists)
                            }
                        }
                    });
                    

                }

            }, function (error) {
                errorhandler(error);
            });

            f++;
        });

        if (itemsRoaming.length == 0) {
            //there may still be local items so we need to look there as well
            var l = 0;
            var t = 0;

            var queryLocal = Windows.Storage.ApplicationData.current.localFolder.createFileQueryWithOptions(queryOptions);
            queryLocal.getFilesAsync().done(function (itemsLocal) {
                // process the query results
                itemsLocal.forEach(function (itemLocal) {
                    var loadSettings = new Windows.Data.Xml.Dom.XmlLoadSettings;
                    loadSettings.prohibitDtd = false;
                    loadSettings.resolveExternals = false;
                    Windows.Data.Xml.Dom.XmlDocument.loadFromFileAsync(itemLocal, loadSettings).then(function (doc) {

                        var listSelector = {
                            id: doc.selectSingleNode("/list").attributes.getNamedItem("id").value,
                            title: doc.selectSingleNode("/list").attributes.getNamedItem("title").value,
                            description: doc.selectSingleNode("/list/description").innerText,
                            bgcolor: doc.selectSingleNode("/list").attributes.getNamedItem("bgcolor").value,
                            textcolor: doc.selectSingleNode("/list").attributes.getNamedItem("textcolor").value,
                            file: itemLocal,
                            counter: r + l,
                            roaming: false,
                            skydrive: (doc.selectSingleNode("/list").attributes.getNamedItem("visibility").value == "skydrive"),
                            fileID: null,
                            version: doc.selectSingleNode("/list").attributes.getNamedItem("version").value
                        }

                        lists[r + l] = listSelector;
                        l++;

                        if (l == t) {
                            //we should now have processed everything so bind the list
                            home_bindList(lists)
                            if (hasSkyDrive) {
                                getRemoteFiles(lists)
                            }
                        }
                    });

                    t++;
                });

                if (itemsLocal.length == 0) {
                    //no local items no roaming items so hide the list
                    home_hideList();
                }

            });
        }
    });
}

function home_sortListArray(lists) {
    var items = lists.length;
    var swapped = false;

    if (items > 1) {
        //no need to sort the list if there is only one item in it.
        do {
            swapped = false;
            for (var i = 1; i < items; i++) {
                if (lists[i - 1].title > lists[i].title) {
                    var temp = lists[i];
                    lists[i] = lists[i - 1];
                    lists[i - 1] = temp;
                    swapped = true;
                }
            }
            items = items - 1;
        }
        while (swapped)
    }

}

function home_bindList(lists, force) {
    var bindData = false;
    if (force) {
        bindData = true;
    }

    //first I need to sort the array of lists found so that the lists are shown in list title order
    home_sortListArray(lists);

    //now to compare the lists we had with the list we just got
    if ((ListMaster.lists.length == 0) || (ListMaster.lists.length != lists.length)) {
        bindData = true;
    } else {
        for (var i = 0; i < lists.length; i++) {
            var a = lists[i];
            var b = ListMaster.lists[i];

            if (a.id != b.id) {
                bindData = true;
            } else if (a.title != b.title) {
                bindData = true;
            } else if (a.bgcolor != b.bgcolor) {
                bindData = true;
            } else if (a.description != b.description) {
                bindData = true;
            } else if (a.roaming != b.roaming) {
                bindData = true;
            } else if (a.textcolor != b.textcolor) {
                bindData = true;
            } else if (a.skydrive != b.skydrive) {
                bindData = true;
            }
        }
    }

    if (bindData) {
        //this is either the first time through or there have been changes made to the lists
        homeList = new WinJS.Binding.List(lists)

        var listView = document.getElementById("listSelectorView")

        listView.winControl.itemDataSource = homeList.dataSource;
        ListMaster.lists = lists;

        var appBar = document.getElementById("appBar").winControl;
        appBar.hideCommands([btnRoam, btnEdit, btnDelete, btnShow, btnPin]);

        listView.style.display = "block";

        onLayoutChanged();

        var noLists = document.getElementById("noLists");
        noLists.style.display = "none";
    }

    var rootProgress = document.getElementById("rootProgress");
    rootProgress.style.display = "none";
}

function home_hideList() {
    var listView = document.getElementById("listSelectorView")
    listView.style.display = "none";

    var noLists = document.getElementById("noLists");
    noLists.style.display = "block";

    var appBar = document.getElementById("appBar").winControl;
    appBar.hideCommands([btnRoam, btnEdit, btnDelete, btnShow, btnPin]);
    appBar.show();
}

function doHomePageSetup() {
    getFiles();
    var appBar = document.getElementById("appBar").winControl;
    if (hasSkyDrive) {
        appBar.showCommands([btnDownload]);
    } else {
        appBar.hideCommands([btnDownload]);
    }
}

function getRemoteFiles(lists) {
    WL.login({
        scope: ["wl.signin", "wl.skydrive_update"]
    }).then( WL.api({
            path: "me/skydrive/files",
            method: "GET"
        }).then( function (response) {
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
                        "name": "TaskTracker",
                        "description": "Holds files used by the Task Tracker application"
                    }
                }).then(function (response) {
                    getRemotefiles();
                }, function (responseFailed) {
                    showMessage(responseFailed.error.message);
                });
            } else {
                ListMaster.skydriveFolderID = listFolderID;

                WL.api({
                    path: listFolderID + "/files",
                    method: "GET"
                }).then(function (response) {
                    var newLists = false;

                    for (var x = 0; x < response.data.length; x++) {
                        if (response.data[x].name.indexOf(".lmx") > 0) {
                            found = false;

                            for (var l = 0; l < lists.length; l++) {
                                if (lists[l].file.name == response.data[x].name) {
                                    //we have a match so mark this as skydrive
                                    lists[l].skydrive = true;
                                    lists[l].fileID = response.data[x].id;
                                    found = true;

                                    var listID = lists[l].id;
                                    var localVersion = lists[l].version;
                                    var downloadID = response.data[x].source;

                                    checkVersion(listID, localVersion, downloadID);
                                }
                            }

                            if (!found) {
                                newLists = true;
                            }
                        }
                    }

                    if (newLists) {
                        //show the message to the user that there are extra lists available on skydrive
                        // Create the message dialog and set its content
                        var msg = new Windows.UI.Popups.MessageDialog("There are additional lists available on skyDrive. Do you want to download them now?");

                        // Add commands and set their command handlers
                        msg.commands.append(new Windows.UI.Popups.UICommand("Yes", home_doClickDownload));
                        msg.commands.append(new Windows.UI.Popups.UICommand("No", null));

                        // Set the command that will be invoked by default
                        msg.defaultCommandIndex = 0;

                        // Set the command to be invoked when escape is pressed
                        msg.cancelCommandIndex = 1;

                        // Show the message dialog
                        msg.showAsync();
                    }

                }, function (responseFailed) {
                    showMessage(responseFailed.error.message);
                });
            }
        }, function (responseFailed) {
            showMessage(responseFailed.error.message);
        })
    );
}

function checkVersion(listID, localVersion, downloadID) {
    var folder = Windows.Storage.ApplicationData.current.localFolder;
    folder.createFileAsync("syncfile.tmp", Windows.Storage.CreationCollisionOption.generateUniqueName).then(function (file) {
        WL.backgroundDownload({
            path: downloadID,
            file_output: file
        }).then(function (download) {
            var loadSettings = new Windows.Data.Xml.Dom.XmlLoadSettings;
            loadSettings.prohibitDtd = false;
            loadSettings.resolveExternals = false;
            Windows.Data.Xml.Dom.XmlDocument.loadFromFileAsync(file, loadSettings).then(function (doc) {
                var version = doc.selectSingleNode("/list").attributes.getNamedItem("version").value
                if (parseInt(version) > parseInt(localVersion)) {
                    //the file we just downloaded needs to replace the existing one
                    swapFiles(listID, file, version);
                } else {
                    //delete the file we just downloaded
                    file.deleteAsync();
                }
            }, function (error) {
                errorhandler(error);
            });
        });
    });
}

function swapFiles(listID, file, version) {
    //need to find this list ID in the array of lists
    for (var l = 0; l < ListMaster.lists.length; l++) {
        if (ListMaster.lists[l].id == listID) {
            // this is the list to swap out
            var arrayRef = l;
            ListMaster.lists[arrayRef].version = version;

            ListMaster.lists[arrayRef].file.deleteAsync().done(function () {
                ListMaster.lists[arrayRef].file = null;
                file.renameAsync(ListMaster.lists[arrayRef].title + ".lmx", Windows.Storage.CreationCollisionOption.generateUniqueName).done(function () {
                    ListMaster.lists[arrayRef].file = file;
                    doHomePageSetup();
                });
            });
        }
    }
}

function listSelectorTemplate(itemPromise) {
    return itemPromise.then(function (currentItem) {

        // Build ListView Item Container div
        var result = document.createElement("div");
        result.className = "listTileContainer";
        result.style.overflow = "hidden";
        result.style.backgroundColor = currentItem.data.bgcolor;

        // Build content body
        var body = document.createElement("div");
        body.className = "listTileDetail";
        body.style.overflow = "hidden";
        body.style.backgroundColor = currentItem.data.bgcolor;

        // Display description text on the tile
        var fulltext = document.createElement("h6");
        fulltext.className = "listTileDescription";
        if (currentItem.data.textcolor == "dark") {
            fulltext.className = fulltext.className + " listTileDark";
        }
        fulltext.innerText = currentItem.data.description;
        body.appendChild(fulltext);

        // Display title
        var title = document.createElement("h4");
        title.innerText = currentItem.data.title;
        title.className = "listTileTitle";
        body.appendChild(title);

        //SkyDrive Icon
        if (currentItem.data.skydrive) {
            var skydrive = document.createElement("div");
            skydrive.className = "skydriveList";
            body.appendChild(skydrive);
        } else {
            //Roaming Icon
            if (currentItem.data.roaming) {
                var roaming = document.createElement("div");
                roaming.className = "roamingList";
                body.appendChild(roaming);
            }
        }

        //put the body into the ListView Item
        result.appendChild(body);

        return result;
    });
}

function onLayoutChanged() {
    var layoutState = Windows.UI.ViewManagement.ApplicationViewState;
    var appLayout = Windows.UI.ViewManagement.ApplicationView;
    var isSnapped = appLayout.value === layoutState.snapped;

    var listView = document.getElementById("listSelectorView")

    if (isSnapped) {
        listView.style.height = (window.innerHeight - 100).toString() + "px";
    } else {
        listView.style.height = (window.innerHeight - 250).toString() + "px";
    }
}
