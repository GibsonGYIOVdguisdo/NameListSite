//Variables

const reader1 = new FileReader(); //Reader 1 handles adding names from a file to a name list
const reader2 = new FileReader(); //Reader 2 handles opening a file to a name list (Overwrites current names)

const fileInput = document.getElementById("fileUpload");
const uploadButton = document.getElementById("addToListButton");

const nameInput = document.getElementById("nameInput");
const addNameButton = document.getElementById("nameConfirm");
const nameArea = document.getElementById("nameArea");

const downloadButton = document.getElementById("downloadA");
const openButton = document.getElementById("openToListButton");

const randomNameButton = document.getElementById("randomNameButton");
const lastRandomNameText = document.getElementById("chosenRandomName");
const previousRandomNameDiv = document.getElementById("lastRandomNames");

const nameListsNamesDiv = document.getElementById("classListDiv");
const newNameListButton = document.getElementById("NewClassButton");
const currentNameListText = document.getElementById("CurrentClassDisplay");

let currentNameList = ""; //Stores the name of the current selected name list
let allNameLists = {}; //This one object stores all data for the name lists




//Saving and loading name lists from local storage

function saveNameListsToLocalStorage(){
    let textToSave = JSON.stringify(allNameLists);
    localStorage.setItem("classObject",textToSave);
}

function loadFromLocalStorage(){
    let localStorageNameList = JSON.parse(localStorage.getItem("classObject"));
    if(localStorageNameList){
        allNameLists = localStorageNameList;
        for(let className of Object.keys(allNameLists)){
            addClassToPage(className);
        }
        openClassToPage(Object.keys(allNameLists)[0]);
    }
}
loadFromLocalStorage();




//Random name generator

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
randomNameButton.onclick = randomNameCode;

let choosingRandomName = false;
async function randomNameCode(){
    if(choosingRandomName === false){
        choosingRandomName = true;
        let nameListForRandom = currentNameList;
        let pupilCount = getPupilArrayFromClass(nameListForRandom).length;
        let randomPupil = "";
        let startIndex = Math.floor(Math.random()*pupilCount);
        let randomScrollAmount = Math.floor(Math.random()*10)+20;
        lastRandomNameText.style = "font-weight: 200;"
        for(i=randomScrollAmount;i>=1;i--){
            index = (startIndex+i)%(pupilCount)
            randomPupil = getPupilArrayFromClass(nameListForRandom)[index];
            lastRandomNameText.innerHTML = randomPupil;
            if(i>10){
                await sleep(50);
            }
            else if(i>7){
                await sleep(100)
            }
            else if(i>5){
                await sleep(180)
            }
            else if(i>3){
                await sleep(330)
            }
            else if(i===3){
                await sleep(600)
            }
            else if(i===2){
                await sleep(1000)
            }
            if(!randomPupil){
                break;
            }
        }
        lastRandomNameText.style = "font-weight: 600;"
        if(randomPupil != undefined){
            let tempPar = document.createElement("p");
            tempPar.innerHTML = randomPupil;
            previousRandomNameDiv.prepend(tempPar)
        }
        choosingRandomName = false;
    }
}




//Adding, removing and editing of the list of name lists (Editing of the "classes")

function promptForNewNameList(promptMessage){
    newClassName = prompt(promptMessage);
    while(allNameLists && newClassName in allNameLists){
        newClassName = prompt(promptMessage);
    }
    if(newClassName.replaceAll(" ","") !== ""){
        allNameLists[newClassName] = {};
        allNameLists[newClassName]["currentId"] = 0;
        allNameLists[newClassName]["pupilList"] = {};
        currentNameList = newClassName;
        addClassToPage(newClassName);
        openClassToPage(newClassName);
    }
}
newNameListButton.setAttribute("onclick","promptForNewNameList('What should the name list be called?')");


function addClassToPage(className){
    let tempDiv1 = document.createElement("div"); 
    let tempDiv2 = document.createElement("div"); 
    tempDiv2.style = "display: flex; justify-content: space-between;"
    tempDiv1.style = "display: inline-block;"
    let tempBut1 = document.createElement("button");
    tempBut1.style = "width: 100%;"
    tempBut1.innerHTML = className;
    tempBut1.className = "classButton";

    let tempBut2 = document.createElement("button");
    tempBut2.innerHTML = "del";
    tempBut2.className = "classButton";

    tempBut1.onclick = () => {
        openClassToPage(className);
    }
    tempBut2.onclick = () => {
        tempBut2.parentNode.parentNode.remove();
        delete allNameLists[className];
        if(className === currentNameList){
            openClassToPage(Object.keys(allNameLists)[0]);
        }
        saveNameListsToLocalStorage();
    }

    tempDiv2.appendChild(tempBut1);
    tempDiv1.appendChild(tempBut2);
    tempDiv2.appendChild(tempDiv1);
    nameListsNamesDiv.appendChild(tempDiv2);
    saveNameListsToLocalStorage();
}

function openClassToPage(className){
    nameArea.innerHTML = "";
    pupilObject = getPupilObjectFromClass(className)
    currentNameList = className;
    for(let [key, value] of Object.entries(pupilObject)){
        addPupilToSite(className, value, key);
    }
    currentNameListText.innerHTML = className;
}




//Adding, removing and editing of pupils (editing of names)

function removePupilFromClassByID(className, pupilID){
    if(className in allNameLists){
        delete allNameLists[className]["pupilList"][pupilID];
        saveNameListsToLocalStorage();
    }
}

function addPupilMain(className, pupilName){
    if(pupilName.replaceAll(" ","") !== "" && className){
        addPupilToClass(className, pupilName);
        let currentId = allNameLists[className]["currentId"];
        addPupilToSite(className,pupilName,"pupil"+currentId);
        saveNameListsToLocalStorage();
    }
}


function addPupilToSite(className, pupilName, pupilID){
    let buttons = addPupilToSiteWithoutDeletion(pupilName,pupilID);
    let pupilButton = buttons[0]
    let editButton = buttons[1]
    pupilButton.onclick = () =>{
        removePupilFromClassByID(className, pupilID);
        pupilButton.parentNode.parentNode.remove();
        updateDownloadButton();
    }
    editButton.onclick = () =>{
        let newName = promptForNewName();
        let nameText = document.getElementById(pupilID + "Text");
        nameText.innerHTML = newName;
        editPupilNameById(className, pupilID, newName);
    }
}

function editPupilNameById(className, pupilID, newName){
    if(className in allNameLists){
        allNameLists[className]["pupilList"][pupilID] = newName;

        updateDownloadButton();
        saveNameListsToLocalStorage();
    }
}

function promptForNewName(){
    let name = prompt("What should it be renamed");
    while ((name.replaceAll(" ","" ) === "") || !name){
        name = prompt("What should it be renamed");
    }
    return(name);
}

function addPupilToSiteWithoutDeletion(pupilName, pupilID){ 
    let tempDiv1 = document.createElement("div");
    let tempDiv2 = document.createElement("div");
    let tempPar = document.createElement("p");
    let tempBut1 = document.createElement("button");
    let tempBut2 = document.createElement("button");
    tempBut2.innerHTML = "edit";
    tempPar.innerHTML = pupilName;
    tempBut1.innerHTML = "remove";
    tempBut1.className = "pupilRemoveButton";
    tempPar.className = "pupilName";
    tempPar.id = pupilID + "Text"
    tempDiv1.className = "pupilDiv";
    tempBut2.className = "editButton";
    tempDiv1.appendChild(tempPar);
    tempDiv2.appendChild(tempBut2)
    tempDiv2.appendChild(tempBut1)
    tempDiv1.appendChild(tempDiv2);
    nameArea.appendChild(tempDiv1);
    tempBut1.id = pupilID;
    updateDownloadButton();
    return([tempBut1    ,tempBut2]);
}


function addPupilToClass(className, pupilName){
    if(className in allNameLists){
        allNameLists[className]["currentId"] += 1;
        currentPupilId = allNameLists[className]["currentId"];
        allNameLists[className]["pupilList"]["pupil"+currentPupilId] = pupilName;
    }
    else{
        allNameLists[className] = {};
        allNameLists[className]["currentId"] = 1;
        allNameLists[className]["pupilList"] = {};
        currentPupilId = allNameLists[className]["currentId"];    
        allNameLists[className]["pupilList"]["pupil"+currentPupilId] = pupilName;
        addClassToPage(className);
    }
}


function addNameViaInputField(){
    if (nameInput.value){
        addPupilMain(currentNameList, nameInput.value);
    }
    nameInput.value = "";
}
addNameButton.onclick = addNameViaInputField;


nameInput.addEventListener("keydown", (event) => {
    if(event.key == "Enter"){
        addNameViaInputField();
    }
})




//File handling

openButton.onclick = () =>{
    reader2.readAsText(fileInput.files[0]);
}


reader1.onload = (result) =>{
    let allText = result.target.result;
    allText = allText.replaceAll("\r","");
    let fileAsArray = allText.split("\n");
    for (let pupil of fileAsArray){
        addPupilMain(currentNameList, pupil);
    }
}


reader2.onload = (result) =>{
    allNameLists[currentNameList]["pupilList"] = {};
    nameArea.innerHTML="";
    let allText = result.target.result;
    allText = allText.replaceAll("\r","");
    let fileAsArray = allText.split("\n");
    for (let pupil of fileAsArray){
        addPupilMain(currentNameList, pupil);
    }
}


function saveToTextFile(textAsArray){
    let textFile = new Blob(textAsArray);
    return(textFile);
}


function getPupilTXT(allPupils){
    let pupilArrayPrepared = [];
    for(let index = 0; allPupils.length-1>index; index++){
        pupilArrayPrepared.push(allPupils[index]+"\n");
    }
    pupilArrayPrepared.push(allPupils[allPupils.length-1]);
    return(saveToTextFile(pupilArrayPrepared));
}


function updateDownloadButton(){
    downloadButton.href = URL.createObjectURL(getPupilTXT(getPupilArrayFromClass(currentNameList)));
    downloadButton.download = "pupils.txt"
}


uploadButton.onclick = () => {
    if (fileInput.files[0] != undefined){
        reader1.readAsText(fileInput.files[0]);
    }
}




//Helper functions

function getPupilArrayFromClass(className){
    return(Object.values(allNameLists[className]["pupilList"]));
}


function getPupilObjectFromClass(className){
    return(allNameLists[className]["pupilList"]);
}


