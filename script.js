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

randomNameButton.onclick = () =>{
    let pupilCount = getPupilArrayFromClass(currentNameList).length;
    let randomPupil = getPupilArrayFromClass(currentNameList)[Math.floor(Math.random()*pupilCount)];
    if(randomPupil != undefined){
        lastRandomNameText.innerHTML = randomPupil;
        let tempPar = document.createElement("p");
        tempPar.innerHTML = randomPupil;
        previousRandomNameDiv.prepend(tempPar);
    }
}




//Adding, removing and editing of the list of name lists (Editing of the "classes")

function promptForNewClass(promptMessage){
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
newNameListButton.setAttribute("onclick","promptForNewClass('What should the class be called?')");


function addClassToPage(className){
    let tempBut = document.createElement("button");
    tempBut.innerHTML = className;
    tempBut.className = "classButton";
    tempBut.onclick = () => {
        openClassToPage(className);
    }
    nameListsNamesDiv.appendChild(tempBut);
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

function addPupilMain(className, pupilName){
    if(pupilName.replaceAll(" ","") !== "" && className){
        addPupilToClass(className, pupilName);
        let currentId = allNameLists[className]["currentId"];
        addPupilToSite(className,pupilName,"pupil"+currentId);
        saveNameListsToLocalStorage();
    }
}


function addPupilToSite(className, pupilName, pupilID){
    let pupilButton = addPupilToSiteWithoutDeletion(pupilName,pupilID);
    pupilButton.onclick = () =>{
        removePupilFromClassByID(className, pupilID);
        pupilButton.parentNode.remove();
        updateDownloadButton();
    }
}


function addPupilToSiteWithoutDeletion(pupilName, pupilID){ 
    let tempDiv = document.createElement("div");
    let tempPar = document.createElement("p");
    let tempBut = document.createElement("button");
    tempPar.innerHTML = pupilName;
    tempBut.innerHTML = "remove";
    tempBut.className = "pupilRemoveButton";
    tempPar.className = "pupilName";
    tempDiv.appendChild(tempPar);
    tempDiv.appendChild(tempBut);
    tempDiv.className = "pupilDiv";
    nameArea.appendChild(tempDiv);
    tempBut.id = pupilID;
    updateDownloadButton();
    return(tempBut);
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


function removePupilFromClassByID(className, pupilID){
    if(className in allNameLists){
        delete allNameLists[className]["pupilList"][pupilID];
        saveNameListsToLocalStorage();
    }
}
