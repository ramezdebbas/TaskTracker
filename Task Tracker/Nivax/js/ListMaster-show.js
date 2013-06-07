(function () {
    "use strict";
    var page = WinJS.UI.Pages.define("/pages/listmaster-show.html", {
        ready: function (element, options) {
            document.getElementById("btnEdit").addEventListener("click", show_doClickEdit, false);
            document.getElementById("btnExpand").addEventListener("click", show_doClickExpand, false);
            document.getElementById("btnHome").addEventListener("click", show_doClickHome, false);
            document.getElementById("btnSnapHome").addEventListener("click", show_doClickHome, false);

            var btnBack = document.getElementById("btnBack");
            btnBack.addEventListener("click", show_doClickBack, false);

            if (WinJS.Navigation.canGoBack) {
                btnBack.setAttribute("class", btnBack.getAttribute("class").replace(" home", " back"));
            } else {
                btnBack.setAttribute("class", btnBack.getAttribute("class").replace(" back", " home"));
            }

            activateCSS("show");

            if ((WinJS.Navigation.state != null) && (WinJS.Navigation.state.mode == "file")) {
                ListMaster.loadXmlFile("", "", "show", WinJS.Navigation.state.file);
            } else {
                show_doPageSetup();
            }

            changes = false;

            var printManager = Windows.Graphics.Printing.PrintManager.getForCurrentView();
            printManager.onprinttaskrequested = onPrintTaskRequested;

            window.addEventListener("resize", show_doPageSetup, false);
        },
        unload: function () {
            document.getElementById("btnHome").removeEventListener("click", show_doClickHome, false);
            document.getElementById("btnBack").removeEventListener("click", show_doClickBack, false);
            document.getElementById("btnExpand").removeEventListener("click", show_doClickExpand, false);
            document.getElementById("btnSnapHome").removeEventListener("click", show_doClickHome, false);
            document.querySelector("body").style.backgroundColor = "rgb(0, 150, 169)";
            document.getElementById("footer").innerText = "";
            ListMaster.removeAppBars();
            deactivateCSS("show");

            var printManager = Windows.Graphics.Printing.PrintManager.getForCurrentView();
            printManager.onprinttaskrequested = null;

            window.removeEventListener("resize", show_doPageSetup, false);
        }
    });
})();

function onPrintTaskRequested(printEvent) {
    printEvent.request.createPrintTask("Print Sample", function (args) {
        args.setSource(MSApp.getHtmlPrintDocumentSource(document));
    });
}

function show_doPageSetup() {
    var listID = ListMaster.currentList.selectSingleNode("/list").attributes.getNamedItem("id").value;
    var listState = ListMaster.currentList.selectSingleNode("/list").attributes.getNamedItem("state").value
    var startCategoryOrder = "1";

    var body = document.querySelector("body");
    body.style.backgroundColor = ListMaster.currentList.selectSingleNode("/list").attributes.getNamedItem("bgcolor").value;
    document.getElementById("pageTitle").innerText = ListMaster.currentList.selectSingleNode("/list").attributes.getNamedItem("title").value;
    if (ListMaster.currentList.selectSingleNode("/list/footertext").attributes.getNamedItem("visibility").value == "visible") {
        document.getElementById("footer").innerText = ListMaster.currentList.selectSingleNode("/list/footertext").innerText;        
    }

    if (ListMaster.currentList.selectSingleNode("/list").attributes.getNamedItem("textcolor").value == "light") {
        activateCSS("show", "light");
    } else {
        activateCSS("show", "dark");
    }

    var renderHost = document.querySelector(".renderShowList");
    renderHost.innerHTML = "";
    renderHost.style.backgroundColor = ListMaster.currentList.selectSingleNode("/list").attributes.getNamedItem("bgcolor").value;

    WinJS.UI.Pages.render("/fragments/listmaster-show-header.html", renderHost, {
        listID: listID,
        startCategoryOrder: startCategoryOrder,
        previewMode: false,
        listState: listState
    }).done();
}

function show_doClickBack() {
    if (changes) {
        ListMaster.saveXmlFile("", "", ListMaster.currentList, ListMaster.file);
        changes = false;
    }

    if (document.getElementById("btnBack").getAttribute("class").indexOf("home") > 0) {
        WinJS.Navigation.navigate(ListMaster.pages[0].url);
    } else {
        doNavigateBack();
    }
}

function show_doClickEdit() {
    if (changes) {
        ListMaster.saveXmlFile("", "", ListMaster.currentList, ListMaster.file);
        changes = false;
    }

    var initialState = new Object;
    initialState.mode = "edit";
    initialState.file = ListMaster.file;

    WinJS.Navigation.navigate(ListMaster.pages[2].url, initialState);
}

function show_doClickExpand() {
    var listState = ListMaster.currentList.selectSingleNode("/list").attributes.getNamedItem("state").value

    if (listState == "normal") {
        ListMaster.currentList.selectSingleNode("/list").attributes.getNamedItem("state").value = "expanded"
    } else {
        ListMaster.currentList.selectSingleNode("/list").attributes.getNamedItem("state").value = "normal"
    }

    ListMaster.saveXmlFile("", "", ListMaster.currentList, ListMaster.file);
    changes = false;

    show_doPageSetup();
}

function show_toggleItemState(eventInfo) {
    if (eventInfo != null) {
        //need to figure out what item was ticked and write this back to the list
        var itemID = eventInfo.srcElement.id.substr(13).substr(0,30);
        var stateOrder = eventInfo.srcElement.id.substr(eventInfo.srcElement.id.indexOf("-") + 1);

        if (eventInfo.srcElement.checked) {
            ListMaster.currentList.selectSingleNode("/list/categories/category/items/item[@id=" + itemID + "]/states/state[@order=" + stateOrder + "]").attributes.getNamedItem("checked").value = "true";
        } else {
            ListMaster.currentList.selectSingleNode("/list/categories/category/items/item[@id=" + itemID + "]/states/state[@order=" + stateOrder + "]").attributes.getNamedItem("checked").value = "false";
        }

        changes = true;
    }
}

function show_doClickHome() {
    if (changes) {
        ListMaster.saveXmlFile("", "", ListMaster.currentList, ListMaster.file);
        changes = false;
    }

    WinJS.Navigation.navigate(ListMaster.pages[0].url);
}

function setStateLayout(forceSnapped, stateContainer) {
    if (forceSnapped) {
        var isSnapped = true;
    } else {
        var layoutState = Windows.UI.ViewManagement.ApplicationViewState;
        var appLayout = Windows.UI.ViewManagement.ApplicationView;
        var isSnapped = appLayout.value === layoutState.snapped;
    }

    if (isSnapped) {
        stateContainer.style.msGridRow = 2;
    } else {
        stateContainer.style.msGridRow = 1;
    }
}