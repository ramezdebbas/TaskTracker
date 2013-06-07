(function () {
    "use strict";
    var page = WinJS.UI.Pages.define("/pages/listmaster-edit.html", {
        ready: function (element, options) {
            document.getElementById("btnSave").addEventListener("click", doClickSave, false);
            document.getElementById("btnAddCategory").addEventListener("click", doAddCategory, false);
            document.getElementById("btnDelCategory").addEventListener("click", doDelCategory, false);
            document.getElementById("btnAddItem").addEventListener("click", doAddItem, false);
            document.getElementById("btnDelItem").addEventListener("click", doDelItem, false);
            document.getElementById("color-Select").addEventListener("click", edit_doSelectColor, false);
            document.getElementById("btnUp").addEventListener("click", doMoveUp, false);
            document.getElementById("btnDown").addEventListener("click", doMoveDown, false);
            document.getElementById("btnHome").addEventListener("click", edit_doClickHome, false);
            document.getElementById("btnSnapHome").addEventListener("click", edit_doNavigateHome, false);
            document.getElementById("btnBold").addEventListener("click", doToggleBold, false);
            document.getElementById("btnItalic").addEventListener("click", doToggleItalic, false);
            document.getElementById("btnUnderline").addEventListener("click", doToggleUnderline, false);
            document.getElementById("btnList").addEventListener("click", doToggleBulletedList, false);

            var btnBack = document.getElementById("btnBack");
            btnBack.addEventListener("click", edit_doClickBack, false);

            if (WinJS.Navigation.canGoBack) {
                btnBack.setAttribute("class", btnBack.getAttribute("class").replace(" home", " back"));
            } else {
                btnBack.setAttribute("class", btnBack.getAttribute("class").replace(" back", " home"));
            }

            if ((WinJS.Navigation.state != null) && (WinJS.Navigation.state.mode == "add")) {
                document.getElementById("pageTitle").innerText = "Add List";
                ListMaster.loadXmlFile("data", "list-blank.xml", "add");
            } else {
                document.getElementById("pageTitle").innerText = "Edit List";
                ListMaster.loadXmlFile("", "", "edit", WinJS.Navigation.state.file);
            }

            changes = false;

            activateCSS("edit");
            document.getElementById('appBar').winControl.hideCommands([btnDelCategory, btnUp, btnDown, btnAddItem, btnDelItem, btnBold, btnItalic, btnUnderline, btnList]);

        },
        unload: function () {
            document.getElementById("btnHome").addEventListener("click", edit_doClickHome, false);
            ListMaster.removeAppBars();
            document.getElementById("btnBack").removeEventListener("click", edit_doClickBack, false);
            document.getElementById("btnSnapHome").removeEventListener("click", edit_doNavigateHome, false);
            document.getElementById("color-Select").removeEventListener("click", edit_doSelectColor, false);
            deactivateCSS("edit");

            selectedCategoryID = -1;
            selectedItemID = -1;
        }
    });
})();

//Add all Supported Edit Page Functions here 
WinJS.Utilities.markSupportedForProcessing(toggleDescription);
WinJS.Utilities.markSupportedForProcessing(toggleTitleText);
WinJS.Utilities.markSupportedForProcessing(toggleFooterText);

function doToggleBold(eventInfo) {
    document.execCommand("bold", false, null);

    if (eventInfo != null) {
        if (eventInfo.srcElement.id.substr(0, 19) == "editItemDescription") {
            srcID = eventInfo.srcElement.id.substr(19);
            ListMaster.currentList.selectSingleNode("/list/categories/category/items/item[@id=" + srcID + "]/description").innerText = eventInfo.srcElement.innerHTML;
        } else if (eventInfo.srcElement.id.substr(0, 23) == "editCategoryDescription") {
            srcID = eventInfo.srcElement.id.substr(23);
            ListMaster.currentList.selectSingleNode("/list/categories/category[@id=" + srcID + "]/description").innerText = eventInfo.srcElement.innerHTML;
        } else if (eventInfo.srcElement.id.substr(0, 19) == "editListDescription") {
            ListMaster.currentList.selectSingleNode("/list/description").innerText = eventInfo.srcElement.innerHTML;
        }
    }
}

function doToggleItalic(eventInfo) {
    document.execCommand("italic", false, null);

    if (eventInfo != null) {
        if (eventInfo.srcElement.id.substr(0, 19) == "editItemDescription") {
            srcID = eventInfo.srcElement.id.substr(19);
            ListMaster.currentList.selectSingleNode("/list/categories/category/items/item[@id=" + srcID + "]/description").innerText = eventInfo.srcElement.innerHTML;
        } else if (eventInfo.srcElement.id.substr(0, 23) == "editCategoryDescription") {
            srcID = eventInfo.srcElement.id.substr(23);
            ListMaster.currentList.selectSingleNode("/list/categories/category[@id=" + srcID + "]/description").innerText = eventInfo.srcElement.innerHTML;
        } else if (eventInfo.srcElement.id.substr(0, 19) == "editListDescription") {
            ListMaster.currentList.selectSingleNode("/list/description").innerText = eventInfo.srcElement.innerHTML;
        }
    }
}

function doToggleUnderline(eventInfo) {
    document.execCommand("underline", false, null);

    if (eventInfo != null) {
        if (eventInfo.srcElement.id.substr(0, 19) == "editItemDescription") {
            srcID = eventInfo.srcElement.id.substr(19);
            ListMaster.currentList.selectSingleNode("/list/categories/category/items/item[@id=" + srcID + "]/description").innerText = eventInfo.srcElement.innerHTML;
        } else if (eventInfo.srcElement.id.substr(0, 23) == "editCategoryDescription") {
            srcID = eventInfo.srcElement.id.substr(23);
            ListMaster.currentList.selectSingleNode("/list/categories/category[@id=" + srcID + "]/description").innerText = eventInfo.srcElement.innerHTML;
        } else if (eventInfo.srcElement.id.substr(0, 19) == "editListDescription") {
            ListMaster.currentList.selectSingleNode("/list/description").innerText = eventInfo.srcElement.innerHTML;
        }
    }
}

function doToggleBulletedList(eventInfo) {
    document.execCommand("insertunorderedlist", false, null);

    if (eventInfo != null) {
        if (eventInfo.srcElement.id.substr(0, 19) == "editItemDescription") {
            srcID = eventInfo.srcElement.id.substr(19);
            ListMaster.currentList.selectSingleNode("/list/categories/category/items/item[@id=" + srcID + "]/description").innerText = eventInfo.srcElement.innerHTML;
        } else if (eventInfo.srcElement.id.substr(0, 23) == "editCategoryDescription") {
            srcID = eventInfo.srcElement.id.substr(23);
            ListMaster.currentList.selectSingleNode("/list/categories/category[@id=" + srcID + "]/description").innerText = eventInfo.srcElement.innerHTML;
        } else if (eventInfo.srcElement.id.substr(0, 19) == "editListDescription") {
            ListMaster.currentList.selectSingleNode("/list/description").innerText = eventInfo.srcElement.innerHTML;
        }
    }
}

function edit_doPageSetup(adding) {
    if (adding) {
        ListMaster.currentList.selectSingleNode("/list").attributes.getNamedItem("id").value = ListMaster.createID();
        ListMaster.currentList.selectSingleNode("/list/categories/category").attributes.getNamedItem("id").value = ListMaster.createID();
        ListMaster.currentList.selectSingleNode("/list/categories/category/items/item").attributes.getNamedItem("id").value = ListMaster.createID();
    }

    var previewArea = document.querySelector("#previewArea");
    previewArea.style.height = (window.innerHeight - 250).toString() + "px";
    var editArea = document.querySelector("#editArea");
    editArea.style.height = (window.innerHeight - 250).toString() + "px";

    var listID = ListMaster.currentList.selectSingleNode("/list").attributes.getNamedItem("id").value;

    var renderHost = document.querySelector(".renderEditList");
    renderHost.innerHTML = "";

    WinJS.UI.Pages.render("/fragments/listmaster-edit-header.html", renderHost, {
        listID: listID
    }).done(function () {
        doPreviewList();
    });
    
}

function doPreviewList() {
    var listID = ListMaster.currentList.selectSingleNode("/list").attributes.getNamedItem("id").value;
    var startCategoryOrder = "1";

    if (selectedCategoryID != -1) {
        startCategoryOrder = ListMaster.currentList.selectSingleNode("/list/categories/category[@id=" + selectedCategoryID + "]").attributes.getNamedItem("order").value;
    } else if (selectedItemID != -1) {
        startCategoryOrder = ListMaster.currentList.selectSingleNode("/list/categories/category/items/item[@id=" + selectedItemID + "]").parentNode.parentNode.attributes.getNamedItem("order").value;
    }

    var renderHost = document.querySelector(".renderShowList");
    renderHost.innerHTML = "";
    renderHost.style.backgroundColor = ListMaster.currentList.selectSingleNode("/list").attributes.getNamedItem("bgcolor").value;

    WinJS.UI.Pages.render("/fragments/listmaster-show-header.html", renderHost, {
        listID: listID,
        startCategoryOrder: startCategoryOrder,
        previewMode: true,
        listState: "normal"
    }).done();
}

function edit_doSelectColor() {
    var color = document.getElementById("color-Hex");
    var listBackground = document.querySelector(".editListBgSample");

    if ((listBackground != null) && (color != null)) {
        listBackground.style.backgroundColor = "#" + color.value;
        ListMaster.currentList.selectSingleNode("/list").attributes.getNamedItem("bgcolor").value = "#" + color.value;
    }

    doPreviewList();

    changes = true;
}

function toggleDescription(eventInfo) {
    if (eventInfo != null) {
        var descElement = null;
        var srcItem = "";
        var srcType = "";
        var listID = ListMaster.currentList.selectSingleNode("/list").attributes.getNamedItem("id").value;

        if (eventInfo.srcElement.id == "editListDescriptionVisibility" + listID) {
            descElement = document.getElementById("editListDescription" + listID);
            descNode = ListMaster.currentList.selectSingleNode("/list/description")
        } else {
            descElement = document.getElementById(eventInfo.srcElement.id.replace("Visibility", ""));
            if (eventInfo.srcElement.id.substr(4, 4) == "Item") {
                srcType = "Item";
                srcID = eventInfo.srcElement.id.replace("editItemDescriptionVisibility", "");
                descNode = ListMaster.currentList.selectSingleNode("/list/categories/category/items/item[@id=" + srcID + "]/description")
                doSelectItem(srcID);
            } else if (eventInfo.srcElement.id.substr(4, 8) == "Category") {
                srcType = "Category";
                srcID = eventInfo.srcElement.id.replace("editCategoryDescriptionVisibility", "");
                descNode = ListMaster.currentList.selectSingleNode("/list/categories/category[@id=" + srcID + "]/description")
                doSelectCategory(srcID);
            }
        }
        if (eventInfo.srcElement.winControl.checked) {
            descElement.style.display = "block";
            descNode.attributes.getNamedItem("visibility").value = "visible";
        } else {
            descElement.style.display = "none";
            descNode.attributes.getNamedItem("visibility").value = "hidden";
        }

        doPreviewList();

        changes = true;
    }
}

function toggleTitleText(eventInfo) {
    if (eventInfo.srcElement.winControl.checked) {
        ListMaster.currentList.selectSingleNode("/list").attributes.getNamedItem("textcolor").value = "light";
    } else {
        ListMaster.currentList.selectSingleNode("/list").attributes.getNamedItem("textcolor").value = "dark";
    }

    doPreviewList();

    changes = true;
}

function toggleFooterText(eventInfo) {
    if (eventInfo.srcElement.winControl.checked) {
        ListMaster.currentList.selectSingleNode("/list/footertext").attributes.getNamedItem("visibility").value = "visible";
    } else {
        ListMaster.currentList.selectSingleNode("/list/footertext").attributes.getNamedItem("visibility").value = "hidden";
    }

    doPreviewList();

    changes = true;
}

function toggleState(eventInfo) {
    var srcID = eventInfo.srcElement.id.replace("editListState","").substr(0,30);
    var stateOrder = eventInfo.srcElement.id.replace("editListState", "").substr(31);

    if (eventInfo.srcElement.checked) {
        ListMaster.currentList.selectSingleNode("/list/categories/category/items/item[@id="+srcID+"]/states/state[@order="+stateOrder+"]").attributes.getNamedItem("checked").value = "true";
    } else {
        ListMaster.currentList.selectSingleNode("/list/categories/category/items/item[@id=" + srcID + "]/states/state[@order=" + stateOrder + "]").attributes.getNamedItem("checked").value = "false";
    }

    doPreviewList();

    changes = true;
}

function doOnBlur(eventInfo) {
    var srcID = "";
    document.getElementById('appBar').winControl.hideCommands([btnBold, btnItalic, btnUnderline, btnList]);

    if (eventInfo.srcElement.id.substr(0, 13) == "editListTitle") {
        if (eventInfo.srcElement.value == "") {
            eventInfo.srcElement.value = ListMaster.blankList.selectSingleNode("/list").attributes.getNamedItem("title").value;
        }
        ListMaster.currentList.selectSingleNode("/list").attributes.getNamedItem("title").value = eventInfo.srcElement.value;
    } else if (eventInfo.srcElement.id.substr(0, 14) == "editFooterText") {
        ListMaster.currentList.selectSingleNode("/list/footertext").innerText = eventInfo.srcElement.value;
    } else if (eventInfo.srcElement.id.substr(0, 17) == "editCategoryTitle") {
        if (eventInfo.srcElement.value == "") {
            eventInfo.srcElement.value = ListMaster.blankList.selectSingleNode("/list/categories/category").attributes.getNamedItem("title").value;
        }
        srcID = eventInfo.srcElement.id.substr(17);
        ListMaster.currentList.selectSingleNode("/list/categories/category[@id=" + srcID + "]").attributes.getNamedItem("title").value = eventInfo.srcElement.value;
    } else if (eventInfo.srcElement.id.substr(0, 13) == "editItemTitle") {
        if (eventInfo.srcElement.value == "") {
            eventInfo.srcElement.value = ListMaster.blankList.selectSingleNode("/list/categories/category/items/item").attributes.getNamedItem("title").value;
        }
        srcID = eventInfo.srcElement.id.substr(13);
        ListMaster.currentList.selectSingleNode("/list/categories/category/items/item[@id=" + srcID + "]").attributes.getNamedItem("title").value = eventInfo.srcElement.value;
    } else if (eventInfo.srcElement.id.substr(0, 19) == "editItemDescription") {
        srcID = eventInfo.srcElement.id.substr(19);
        ListMaster.currentList.selectSingleNode("/list/categories/category/items/item[@id=" + srcID + "]/description").innerText = eventInfo.srcElement.innerHTML;
    } else if (eventInfo.srcElement.id.substr(0, 23) == "editCategoryDescription") {
        srcID = eventInfo.srcElement.id.substr(23);
        ListMaster.currentList.selectSingleNode("/list/categories/category[@id=" + srcID + "]/description").innerText = eventInfo.srcElement.innerHTML;
    } else if (eventInfo.srcElement.id.substr(0, 19) == "editListDescription") {
        ListMaster.currentList.selectSingleNode("/list/description").innerText = eventInfo.srcElement.innerHTML;
    }

    doPreviewList();
}

function doClickSave() {
    ListMaster.saveXmlFile("local", ListMaster.currentList.selectSingleNode("/list").attributes.getNamedItem("title").value + ".lmx", ListMaster.currentList, ListMaster.file);
    changes = false;
    if (nav != null) {
        if (nav == "home") {
            nav = null;
            edit_doNavigateHome();
        } else if (nav == "back") {
            nav = null;
            doNavigateBack();
        }
    }
}

function edit_doClickBack(eventInfo) {
    if (changes) {
        // Create the message dialog and set its content
        var msg = new Windows.UI.Popups.MessageDialog("All unsaved changes will be lost. Are you sure you want to go back?");

        nav = "back";

        // Add commands and set their command handlers
        msg.commands.append(new Windows.UI.Popups.UICommand("Yes", doNavigateBack));
        msg.commands.append(new Windows.UI.Popups.UICommand("No", null));
        msg.commands.append(new Windows.UI.Popups.UICommand("Save and go back", doClickSave));

        // Set the command that will be invoked by default
        msg.defaultCommandIndex = 0;

        // Set the command to be invoked when escape is pressed
        msg.cancelCommandIndex = 1;

        // Show the message dialog
        msg.showAsync();
    } else {
        doNavigateBack();
    }
}

function edit_doClickHome() {
    if (changes) {
        // Create the message dialog and set its content
        var msg = new Windows.UI.Popups.MessageDialog("All unsaved changes will be lost. Are you sure you want to go to the home screen?");

        nav = "home";

        // Add commands and set their command handlers
        msg.commands.append(new Windows.UI.Popups.UICommand("Yes", edit_doNavigateHome));
        msg.commands.append(new Windows.UI.Popups.UICommand("No", null));
        msg.commands.append(new Windows.UI.Popups.UICommand("Save and go home", doClickSave));

        // Set the command that will be invoked by default
        msg.defaultCommandIndex = 0;

        // Set the command to be invoked when escape is pressed
        msg.cancelCommandIndex = 1;

        // Show the message dialog
        msg.showAsync();
    } else {
        edit_doNavigateHome();
    }
}

function edit_doNavigateHome() {
    WinJS.Navigation.navigate(ListMaster.pages[0].url);
}

function doGotFocus(eventInfo) {
    var srcItem = "";
    var srcType = "";
    changes = true;

    if (eventInfo != null) {

        if (eventInfo.srcElement.id.substr(0, 13) == "editListTitle") {
            if (eventInfo.srcElement.value == ListMaster.blankList.selectSingleNode("/list").attributes.getNamedItem("title").value) {
                //the user hasn't typed anything yet so clear this field
                eventInfo.srcElement.value = "";
            }
        } else if (eventInfo.srcElement.id.substr(4,4) == "Item") {
            srcType = "Item";
            if (eventInfo.srcElement.parentNode.id.substr(0, 12) != "editListItem") {
                srcID = eventInfo.srcElement.parentNode.parentNode.id.substr(12);
            } else {
                srcID = eventInfo.srcElement.parentNode.id.substr(12);
            }
            if (eventInfo.srcElement.id.substr(0, 13) == "editItemTitle") {
                if (eventInfo.srcElement.value == ListMaster.blankList.selectSingleNode("/list/categories/category/items/item").attributes.getNamedItem("title").value) {
                    //the user hasn't typed anything yet so clear this field
                    eventInfo.srcElement.value = "";
                }
            } else if (eventInfo.srcElement.id.substr(0, 19) == "editItemDescription") {
                if (eventInfo.srcElement.innerText == ListMaster.blankList.selectSingleNode("/list/categories/category/items/item/description").innerText) {
                    //the user hasn't typed anything yet so clear this field
                    eventInfo.srcElement.innerText = "";
                }
                document.getElementById('appBar').winControl.showCommands([btnBold, btnItalic, btnUnderline, btnList]);
                document.getElementById('appBar').winControl.show();
            }
            doSelectItem(srcID);
        } else if (eventInfo.srcElement.id.substr(4, 8) == "Category") {
            srcType = "Category";
            if (eventInfo.srcElement.parentNode.id.substr(0,16) != "editListCategory") {
                srcID = eventInfo.srcElement.parentNode.parentNode.id.substr(16);
            } else {
                srcID = eventInfo.srcElement.parentNode.id.substr(16);
            }
            if (eventInfo.srcElement.id.substr(0, 17) == "editCategoryTitle") {
                if (eventInfo.srcElement.value == ListMaster.blankList.selectSingleNode("/list/categories/category").attributes.getNamedItem("title").value) {
                    //the user hasn't typed anything yet so clear this field
                    eventInfo.srcElement.value = "";
                }
            } else if (eventInfo.srcElement.id.substr(0, 23) == "editCategoryDescription") {
                if (eventInfo.srcElement.innerText == ListMaster.blankList.selectSingleNode("/list/categories/category/description").innerText) {
                    //the user hasn't typed anything yet so clear this field
                    eventInfo.srcElement.innerText = "";
                }
                document.getElementById('appBar').winControl.showCommands([btnBold, btnItalic, btnUnderline, btnList]);
                document.getElementById('appBar').winControl.show();
            }
            doSelectCategory(srcID);
        } else if (eventInfo.srcElement.id.substr(0, 14) == "editFooterText") {
            if (eventInfo.srcElement.value == ListMaster.blankList.selectSingleNode("/list/footertext").innerText) {
                //the user hasn't typed anything yet so clear this field
                eventInfo.srcElement.value = "";
            }
        } else if (eventInfo.srcElement.id.substr(0, 19) == "editListDescription") {
            if (eventInfo.srcElement.innerText == ListMaster.blankList.selectSingleNode("/list/description").innerText) {
                //the user hasn't typed anything yet so clear this field
                eventInfo.srcElement.innerText = "";
            }
        }

        doPreviewList();
    }
}

function doSelectItem(itemID) {
    var itemSection = null;
    var categorySection = null;

    if (selectedItemID != itemID) {
        if (selectedItemID != -1) {
            // clear the existing item selection
            itemSection = document.getElementById("editListItem" + selectedItemID);
            if (itemSection != null) {
                itemSection.setAttribute("class", itemSection.attributes.getNamedItem("class").value.replace("itemSelected", ""));
                document.getElementById("editItemSelected" + selectedItemID).style.display = "none";
            }
        }

        //clear any existing category selection
        if (selectedCategoryID != -1) {
            categorySection = document.getElementById("editListCategory" + selectedCategoryID);
            if (categorySection != null) {
                categorySection.setAttribute("class", categorySection.attributes.getNamedItem("class").value.replace("categorySelected", ""));
                document.getElementById("editCategorySelected" + selectedCategoryID).style.display = "none";
            }
            selectedCategoryID = -1;
        }

        // apply the new selection
        itemSection = document.getElementById("editListItem" + itemID);
        if (itemSection != null) {
            itemSection.setAttribute("class", itemSection.attributes.getNamedItem("class").value + " itemSelected");
            document.getElementById("editItemSelected" + itemID).style.display = "block";
        }

        selectedItemID = itemID;

        document.getElementById('appBar').winControl.showCommands([btnUp, btnDown, btnAddItem, btnDelItem]);

        //Need to determine if it makes sense for the up and down buttons to appear
        //if there is only one category then these can stay hidden.
        categoryID = ListMaster.currentList.selectSingleNode("/list/categories/category/items/item[@id=" + itemID + "]").parentNode.parentNode.attributes.getNamedItem("id").value;
        if (ListMaster.currentList.selectNodes("/list/categories/category[@id=" + categoryID + "]/items/item").length <= 1) {
            document.getElementById('appBar').winControl.hideCommands([btnUp, btnDown]);
        }
    }

    var appBar = document.getElementById('appBar').winControl

    if (selectedItemID == -1) {
        appBar.hideCommands([btnDelCategory, btnUp, btnDown, btnAddItem, btnDelItem]);
    } else {
        appBar.hideCommands([btnDelCategory]);
        appBar.show();
    }
}

function doSelectCategory(categoryID) {
    var itemSection = null;
    var categorySection = null;

    if (selectedCategoryID != categoryID) {
        if (selectedCategoryID != -1) {
            // clear the existing item selection
            categorySection = document.getElementById("editListCategory" + selectedCategoryID);
            if (categorySection != null) {
                categorySection.setAttribute("class", categorySection.attributes.getNamedItem("class").value.replace("categorySelected", ""));
                document.getElementById("editCategorySelected" + selectedCategoryID).style.display = "none";
            }
        }

        //clear any existing item selection
        if (selectedItemID != -1) {
            itemSection = document.getElementById("editListItem" + selectedItemID);
            if (itemSection != null) {
                itemSection.setAttribute("class", itemSection.attributes.getNamedItem("class").value.replace("itemSelected", ""));
                document.getElementById("editItemSelected" + selectedItemID).style.display = "none";
            }
            selectedItemID = -1;
        }

        // apply the new selection
        categorySection = document.getElementById("editListCategory" + categoryID);
        if (categorySection != null) {
            categorySection.setAttribute("class", categorySection.attributes.getNamedItem("class").value + " categorySelected");
            document.getElementById("editCategorySelected" + categoryID).style.display = "block";
        }

        selectedCategoryID = categoryID;

        document.getElementById('appBar').winControl.showCommands([btnDelCategory, btnUp, btnDown, btnAddItem]);

        //Need to determine if it makes sense for the up and down buttons to appear
        //if there is only one category then these can stay hidden.
        if (ListMaster.currentList.selectNodes("/list/categories/category").length == 1) {
            document.getElementById('appBar').winControl.hideCommands([btnUp, btnDown]);
        }
    }

    var appBar = document.getElementById('appBar').winControl

    if (selectedCategoryID == -1) {
        appBar.hideCommands([btnDelCategory, btnUp, btnDown, btnAddItem, btnDelItem]);
    } else {
        appBar.hideCommands([btnDelItem]);
        appBar.show();
    }
}

function doAddCategory() {
    var tempcategory = ListMaster.blankList.selectSingleNode("/list/categories/category");
    var newcategory = ListMaster.currentList.importNode(tempcategory, true);
    var categories = ListMaster.currentList.selectSingleNode("/list/categories");

    var categoryID = newcategory.attributes.getNamedItem("id");
    var categoryOrder = newcategory.attributes.getNamedItem("order");
    categoryID.value = ListMaster.createID();
    categoryOrder.value = ListMaster.currentList.selectNodes("/list/categories/category").length + 1;

    var newItem = newcategory.selectSingleNode("./items/item");
    var itemID = newItem.attributes.getNamedItem("id");
    itemID.value = ListMaster.createID();

    categories.appendChild(newcategory);

    edit_doPageSetup(false);

    changes = true;
}


function doAddItem() {
    if (selectedCategoryID != -1) {
        var categoryID = selectedCategoryID;
    } else {
        var categoryID = ListMaster.currentList.selectSingleNode("/list/categories/category/items/item[@id=" + selectedItemID + "]").parentNode.parentNode.attributes.getNamedItem("id").value;
    }
    var tempitem = ListMaster.blankList.selectSingleNode("/list/categories/category/items/item");
    var newitem = ListMaster.currentList.importNode(tempitem, true);
    var items = ListMaster.currentList.selectSingleNode("/list/categories/category[@id=" + categoryID + "]/items");

    var itemID = newitem.attributes.getNamedItem("id");
    var itemOrder = newitem.attributes.getNamedItem("order");
    itemID.value = ListMaster.createID();
    itemOrder.value = ListMaster.currentList.selectNodes("/list/categories/category[@id=" + categoryID + "]/items/item").length + 1;

    items.appendChild(newitem);

    edit_doPageSetup(false);

    changes = true;
}

function doDelItem() {
    if (selectedItemID != -1) {
        var itemID = selectedItemID;
        var item = ListMaster.currentList.selectSingleNode("/list/categories/category/items/item[@id=" + itemID + "]");
        var categoryID = item.parentNode.parentNode.attributes.getNamedItem("id").value;
        selectedItemID = -1;

        item.parentNode.removeChild(item);

        doReorderList("item", categoryID);

        edit_doPageSetup(false);

        changes = true;
    }

    document.getElementById('appBar').winControl.hideCommands([btnDelCategory, btnUp, btnDown, btnAddItem, btnDelItem]);
}

function doDelCategory() {
    if (selectedCategoryID != -1) {

        var categoryID = selectedCategoryID;
        var category = ListMaster.currentList.selectSingleNode("/list/categories/category[@id=" + categoryID + "]");

        selectedCategoryID = -1;

        category.parentNode.removeChild(category);

        doReorderList("category");

        edit_doPageSetup(false);

        changes = true;
    }

    document.getElementById('appBar').winControl.hideCommands([btnDelCategory, btnUp, btnDown, btnAddItem, btnDelItem]);
}

function doAddState(eventInfo) {
    if (eventInfo != null) {
        var itemID = eventInfo.srcElement.id.substr(12);
        var states = ListMaster.currentList.selectSingleNode("/list/categories/category/items/item[@id=" + itemID + "]/states");

        var tempstate = ListMaster.blankList.selectSingleNode("/list/categories/category/items/item/states/state");
        var newstate = ListMaster.currentList.importNode(tempstate, true);

        var stateOrder = newstate.attributes.getNamedItem("order");
        stateOrder.value = ListMaster.currentList.selectNodes("/list/categories/category/items/item[@id=" + itemID + "]/states/state").length + 1;

        states.appendChild(newstate);

        edit_doPageSetup(false);

        changes = true;

    }
}

function doDelState(eventInfo) {
    if (eventInfo != null) {
        var itemID = eventInfo.srcElement.id.substr(15);
        var maxOrder = ListMaster.currentList.selectNodes("/list/categories/category/items/item[@id=" + itemID + "]/states/state").length
        if (maxOrder > 0) {
            var maxstate = ListMaster.currentList.selectSingleNode("/list/categories/category/items/item[@id=" + itemID + "]/states/state[@order=" + maxOrder + "]");
            var states = ListMaster.currentList.selectSingleNode("/list/categories/category/items/item[@id=" + itemID + "]/states");

            states.removeChild(maxstate);

            edit_doPageSetup(false);

            changes = true;
        }
    }
}

function doReorderList(level, parentID) {
    var counter = 1;

    if (level == "category") {
        var listCategories = ListMaster.currentList.selectNodes("/list/categories/category");
        var catSort = new Array;
        
        for (var c = 0; c < listCategories.length; c++) {
            catSort[(listCategories[c].attributes.getNamedItem("order").value - 1)] = listCategories[c].attributes.getNamedItem("id").value;
        }

        for (var c = 0; c < catSort.length; c++) {
            var categoryID = catSort[c]

            if (categoryID != null) {
                ListMaster.currentList.selectSingleNode("/list/categories/category[@id=" + categoryID + "]").attributes.getNamedItem("order").value = counter;
                counter++;
            }
        }
    } else if (level == "item") {
        var listItems = ListMaster.currentList.selectNodes("/list/categories/category[@id=" + parentID + "]/items/item");
        var itemSort = new Array;

        for (var i = 0; i < listItems.length; i++) {
            itemSort[(listItems[i].attributes.getNamedItem("order").value - 1)] = listItems[i].attributes.getNamedItem("id").value;
        }

        for (var i = 0; i < itemSort.length; i++) {
            var itemID = itemSort[i]

            if (itemID != null) {
                ListMaster.currentList.selectSingleNode("/list/categories/category/items/item[@id=" + itemID + "]").attributes.getNamedItem("order").value = counter;
                counter++;
            }
        }
    }
}

function doMoveUp() {
    if (selectedItemID != -1) {
        var item = ListMaster.currentList.selectSingleNode("/list/categories/category/items/item[@id=" + selectedItemID + "]");
        var categoryID = item.parentNode.parentNode.attributes.getNamedItem("id").value;

        if (item.attributes.getNamedItem("order").value != "1") {
            var thisOrder = item.attributes.getNamedItem("order").value
            var orderBefore = (parseInt(thisOrder) - 1).toString();
            var itemBefore = ListMaster.currentList.selectSingleNode("/list/categories/category[@id=" + categoryID + "]/items/item[@order=" + orderBefore + "]");

            itemBefore.attributes.getNamedItem("order").value = thisOrder;
            item.attributes.getNamedItem("order").value = orderBefore;
        }

    } else if (selectedCategoryID != -1) {
        var category = ListMaster.currentList.selectSingleNode("/list/categories/category[@id=" + selectedCategoryID + "]");

        if (category.attributes.getNamedItem("order").value != "1") {
            var thisOrder = category.attributes.getNamedItem("order").value
            var orderBefore = (parseInt(thisOrder) - 1).toString();
            var categoryBefore = ListMaster.currentList.selectSingleNode("/list/categories/category[@order=" + orderBefore + "]");

            categoryBefore.attributes.getNamedItem("order").value = thisOrder;
            category.attributes.getNamedItem("order").value = orderBefore;
        }
    }

    edit_doPageSetup();

    changes = true;
}

function doMoveDown() {
    if (selectedItemID != -1) {
        var item = ListMaster.currentList.selectSingleNode("/list/categories/category/items/item[@id=" + selectedItemID + "]");
        var categoryID = item.parentNode.parentNode.attributes.getNamedItem("id").value;
        var thisOrder = item.attributes.getNamedItem("order").value
        var orderAfter = (1 + parseInt(thisOrder)).toString();
        var itemAfter = ListMaster.currentList.selectSingleNode("/list/categories/category[@id=" + categoryID + "]/items/item[@order=" + orderAfter + "]");

        if (itemAfter != null) {
            itemAfter.attributes.getNamedItem("order").value = thisOrder;
            item.attributes.getNamedItem("order").value = orderAfter;
        }

    } else if (selectedCategoryID != -1) {
        var category = ListMaster.currentList.selectSingleNode("/list/categories/category[@id=" + selectedCategoryID + "]");
        var thisOrder = category.attributes.getNamedItem("order").value
        var orderAfter = (1 + parseInt(thisOrder)).toString();
        var categoryAfter = ListMaster.currentList.selectSingleNode("/list/categories/category[@order=" + orderAfter + "]");

        if (categoryAfter != null) {
            categoryAfter.attributes.getNamedItem("order").value = thisOrder;
            category.attributes.getNamedItem("order").value = orderAfter;
        }
    }

    edit_doPageSetup();

    changes = true;
}