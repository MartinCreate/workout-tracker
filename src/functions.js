import axios from "./axios";

export const delUnit = (e) => {
    const parent = e.target.parentElement;
    const gParent = parent.parentNode;
    const ggParent = gParent.parentNode;

    const deleteEl = e.target.parentElement;
    deleteEl.parentNode.removeChild(deleteEl);

    if (ggParent.getElementsByClassName("unit-div").length < 2) {
        const addUnit = ggParent.getElementsByClassName("set-unit-add")[0];
        addUnit.style.display = "inline-block";
    }
};

export const delEl = (e, tag) => {
    const deleteEl = e.target.parentElement;
    const gP = deleteEl.parentNode;

    deleteEl.parentNode.removeChild(deleteEl);

    if (tag) {
        if (gP.getElementsByClassName("tag").length < 10) {
            const tagAdd = gP.getElementsByClassName("tag-add")[0];
            tagAdd.style.display = "inline-block";
        }
    }
};

export const delParent = (e) => {
    const deleteEl = e.target.parentElement;
    const workout = deleteEl.parentNode;
    workout.parentNode.removeChild(workout);
};

export const collapse = (e) => {
    const coll = e.currentTarget;
    coll.classList.toggle("active");
    const content = coll.nextElementSibling;

    //removing success/error message
    const gP = coll.parentNode.parentNode;
    const successMsgs = gP.getElementsByClassName("success-save");
    if (successMsgs) {
        for (let i = 0; i < successMsgs.length; i++) {
            successMsgs[i].remove();
        }
    }

    if (content.style.display === "grid") {
        content.style.display = "none";
    } else {
        content.style.display = "grid";
    }
};

export const submitExercise = async (e) => {
    console.log("--- In submitExercise(e) ---");
    const saveButton = e.target;
    const parent = e.target.parentElement;
    const gP = parent.parentNode;
    const gggP = gP.parentNode.parentNode;

    let exerData = {};
    // example of how exerData is structured
    // exerData = {
    //     woName: "Chest Day"
    //     exName: "Pushups",
    //     exTags: ["bodyweight", "chest"],
    //     sets: [
    //         [ 10, [ [12, "kg"], [10, "sec"] ] ],
    //         [ 10 ],
    //         [ 10, [ [18, "kg"] ] ],
    //     ],
    // };
    //Where sets[i][0] is the number of reps

    //----- Workout & Exercise Name
    const workoutName = gggP.getElementsByClassName("wo-name")[0].value;
    const exerName = gP.getElementsByClassName("exer-name-input")[0].value;
    //error message if !workoutName
    //error message if !exerName
    exerData.woName = workoutName;
    exerData.exName = exerName;

    //----- Tag data
    const tags = gP.getElementsByClassName("tag-input");
    if (tags.length != 0) {
        //1) delete tag-divs w/ empty inputs
        for (let i = tags.length - 1; i > -1; i--) {
            if (!tags[i].value) {
                const tagPar = tags[i].parentNode;
                tagPar.parentNode.removeChild(tagPar);
            }
        }

        //2) get data from tags
        if (tags.length != 0) {
            let tagsArr = [];
            for (let i = 0; i < tags.length; i++) {
                tagsArr.push(tags[i].value);
            }
            exerData.exTags = tagsArr;
        }
    }

    //----- Sets data
    const setDivs = gP.getElementsByClassName("set-div");

    if (setDivs.length != 0) {
        let setsData = [];

        for (let s = 0; s < setDivs.length; s++) {
            let setData = [];
            const reps = setDivs[s].getElementsByClassName("reps-inp")[0].value;
            //error message if reps is not a number

            setData.push(reps);

            const val = setDivs[s].getElementsByClassName("unit-val-inp");
            const m = setDivs[s].getElementsByClassName("unit-measure-inp");
            //error message if val.length != m.length

            if (val.length != 0) {
                let units = [];

                for (let i = 0; i < val.length; i++) {
                    let unit = [];
                    const unitVal = val[i].value;
                    const unitMeas = m[i].value;

                    unit.push(unitVal);
                    unit.push(unitMeas);

                    units.push(unit);
                }
                setData.push(units);
            }
            setsData.push(setData);
        }
        exerData.sets = setsData;
    }

    //do axios post here
    console.log("submitExercise data being sent to server: ", exerData);
    if (!exerData.exName) {
        const errMsg = document.createElement("div");
        errMsg.classList.add("success-save");
        errMsg.classList.add("error-save");
        errMsg.innerHTML =
            "Error: please make sure your exercise has a name and at least one filled out set";
        parent.insertBefore(errMsg, saveButton);
        console.log("Error, no exerName");
        return;
    }
    try {
        const { data } = await axios.post("/submit-exercise", exerData);
        console.log("data after /submit-exercise: ", data);

        if (data == "success") {
            ///xxxxx anchor
            //remove existing msgs
            const successMsgs = parent.getElementsByClassName("success-save");
            if (successMsgs) {
                for (let i = 0; i < successMsgs.length; i++) {
                    successMsgs[i].remove();
                }
            }
            const errorMsg = parent.getElementsByClassName("error-save");
            if (errorMsg) {
                for (let i = 0; i < errorMsg.length; i++) {
                    errorMsg[i].remove();
                }
            }

            // render feedback message
            console.log("parent: ", parent);
            const goodMsg = document.createElement("div");
            goodMsg.classList.add("success-save");
            goodMsg.innerHTML = "Exercise data has been saved!";
            console.log("saveButton: ", saveButton);
            parent.insertBefore(goodMsg, saveButton);
        } else if (data == "error") {
            const errMsg = document.createElement("div");
            errMsg.classList.add("success-save");
            errMsg.classList.add("error-save");
            errMsg.innerHTML =
                "Error: please make sure your exercise has a name and at least one filled out set";
            console.log("saveButton: ", saveButton);
            parent.insertBefore(errMsg, saveButton);
        }
    } catch (e) {
        console.log("ERROR in POST /submit-exercise: ", e);
    }
};

export const createTagsDiv = () => {
    const tagsDiv = document.createElement("div");
    tagsDiv.classList.add("tags-div");

    const toggleTag = document.createElement("button");
    toggleTag.classList.add("toggle-tags");
    toggleTag.classList.add("toggle-button");
    toggleTag.addEventListener("click", (e) => collapse(e));
    toggleTag.innerHTML = "Tags";

    const addTagButton = document.createElement("button");
    addTagButton.classList.add("tag-add");
    addTagButton.innerHTML = "+ Tag";
    addTagButton.addEventListener("click", (e) => addWoTag(e));

    const tags = document.createElement("div");
    tags.classList.add("tags");
    tags.classList.add("collapse");

    tags.appendChild(addTagButton);
    tagsDiv.appendChild(toggleTag);
    tagsDiv.appendChild(tags);

    return tagsDiv;
};

//export this (and import in other create-workout) when editing hardcoded html
export const addWoTag = (e) => {
    console.log("addWoTag is running");

    const parent = e.target.parentElement;
    const newTagDiv = document.createElement("div");
    const tagInp = document.createElement("input");

    const delTag = document.createElement("button");
    delTag.innerHTML = "- Tag";
    delTag.addEventListener("click", (e) => delEl(e, true));
    delTag.classList.add("del-button");
    delTag.classList.add("tag-del");

    newTagDiv.classList.add("tag");
    tagInp.classList.add("tag-input");
    tagInp.type = "text";
    tagInp.setAttribute("placeholder", "Tag Name");

    newTagDiv.appendChild(tagInp);
    newTagDiv.appendChild(delTag);
    parent.appendChild(newTagDiv);

    if (parent.getElementsByClassName("tag").length == 10) {
        const tagAdd = parent.getElementsByClassName("tag-add")[0];
        tagAdd.style.display = "none";
    }
};

export const addExercise = (e, location) => {
    const p = e.target.parentElement;
    const parent = p.parentNode;

    const exerDiv = document.createElement("div");
    exerDiv.classList.add("exer-div");

    const exerNav = document.createElement("div");
    exerNav.classList.add("exer-nav");

    const exerInp = document.createElement("input");
    exerInp.classList.add("exer-name-input");
    exerInp.setAttribute("placeholder", "Exercise Name");

    const tagsDiv = createTagsDiv();

    const delExer = document.createElement("button");
    delExer.classList.add("exer-del");
    delExer.addEventListener("click", (e) => delParent(e));
    delExer.innerHTML = "Delete Exercise";

    const toggleSets = document.createElement("button");
    toggleSets.classList.add("sets-toggle");
    toggleSets.classList.add("toggle-button");
    toggleSets.addEventListener("click", (e) => collapse(e));
    toggleSets.innerHTML = "Sets";

    const setsDiv = document.createElement("div");
    setsDiv.classList.add("sets-div");
    setsDiv.classList.add("collapse");

    const setAdd = document.createElement("button");
    setAdd.classList.add("set-add");
    setAdd.addEventListener("click", (e) => addSet(e));
    setAdd.innerHTML = "+ Set";

    const submitExer = document.createElement("button");
    submitExer.classList.add("submit-exer");
    submitExer.addEventListener("click", (e) => submitExercise(e));
    submitExer.innerHTML = " Save Exercise";

    setsDiv.appendChild(setAdd);
    setsDiv.appendChild(submitExer);

    exerNav.appendChild(exerInp);
    exerNav.appendChild(tagsDiv);
    exerNav.appendChild(delExer);

    exerDiv.appendChild(exerNav);
    exerDiv.appendChild(toggleSets);
    exerDiv.appendChild(setsDiv);

    parent.appendChild(exerDiv);
    console.log("parent: ", parent);
    const submitWo = parent.getElementsByClassName(location)[0];
    parent.insertBefore(exerDiv, submitWo);
};

//only exported for editing hardcoded html
export const addSet = (e) => {
    const parent = e.target.parentElement;
    const setDiv = document.createElement("div");
    setDiv.classList.add("set-div");

    const repsInp = document.createElement("input");
    repsInp.classList.add("reps-inp");
    repsInp.setAttribute("placeholder", "reps");

    const pr = document.createElement("p");
    pr.classList.add("reps-label");
    pr.innerHTML = "r";

    const unitsDiv = document.createElement("div");
    unitsDiv.classList.add("units-div");

    const addUnits = document.createElement("button");
    addUnits.classList.add("set-unit-add");
    addUnits.innerHTML = "+ Unit";
    addUnits.addEventListener("click", (e) => addUnit(e));

    const copySet = document.createElement("button");
    copySet.classList.add("set-copy");
    copySet.innerHTML = "x2";
    copySet.addEventListener("click", (e) => duplicateSet(e));

    const delSet = document.createElement("button");
    delSet.classList.add("set-del");
    delSet.addEventListener("click", (e) => delEl(e));
    delSet.innerHTML = "- Set";

    setDiv.appendChild(repsInp);
    setDiv.appendChild(pr);
    setDiv.appendChild(unitsDiv);

    setDiv.appendChild(addUnits);
    setDiv.appendChild(copySet);
    setDiv.appendChild(delSet);

    const submitExer = parent.getElementsByClassName("submit-exer")[0];
    parent.insertBefore(setDiv, submitExer);
};

//only exported for editing hardcoded html
export const duplicateSet = (e) => {
    const parent = e.target.parentElement;
    const grandparent = parent.parentNode;

    const clone = parent.cloneNode(true);

    const addUnitClone = clone.getElementsByClassName("set-unit-add")[0];
    const copySetClone = clone.getElementsByClassName("set-copy")[0];
    const delSetClone = clone.getElementsByClassName("set-del")[0];
    const delUnitClone = clone.getElementsByClassName("unit-del");

    addUnitClone.addEventListener("click", (e) => addUnit(e));
    copySetClone.addEventListener("click", (e) => duplicateSet(e));
    delSetClone.addEventListener("click", (e) => delEl(e));
    if (delUnitClone) {
        for (let i = 0; i < delUnitClone.length; i++) {
            delUnitClone[i].addEventListener("click", (e) => delUnit(e));
        }
    }

    grandparent.insertBefore(clone, parent.nextSibling);
};

//only exported for editing hardcoded html
export const addUnit = (e) => {
    const prevSib = e.target.previousSibling;
    const parent = e.target.parentElement;
    console.log("parent addUnit(): ", parent);
    const unitDiv = document.createElement("div");

    const valInp = document.createElement("input");
    valInp.classList.add("unit-val-inp");
    valInp.setAttribute("placeholder", "value");
    valInp.type = "text";

    const measureInp = document.createElement("input");
    measureInp.classList.add("unit-measure-inp");
    measureInp.setAttribute("placeholder", "units");
    measureInp.setAttribute("list", "units"); //has to correspond to id of datalist
    measureInp.type = "text";

    const unitsList = document.createElement("datalist");
    unitsList.id = "units";
    unitsList.setAttribute("name", "units");

    const option1 = document.createElement("option");
    const option2 = document.createElement("option");
    const option3 = document.createElement("option");
    const option4 = document.createElement("option");
    const option5 = document.createElement("option");
    option1.setAttribute("value", "kg");
    option2.setAttribute("value", "lb");
    option3.setAttribute("value", "sec");
    option4.setAttribute("value", "sec/rep");
    option5.setAttribute("value", "mins");
    option1.innerHTML = "";
    option2.innerHTML = "Pounds";
    option3.innerHTML = "Seconds";
    option4.innerHTML = "Seconds / Rep";
    option5.innerHTML = "Minutes";
    unitsList.appendChild(option1);
    unitsList.appendChild(option2);
    unitsList.appendChild(option3);
    unitsList.appendChild(option4);
    unitsList.appendChild(option5);

    const unitDel = document.createElement("button");
    unitDel.classList.add("unit-del");
    unitDel.addEventListener("click", (e) => delUnit(e));
    unitDel.innerHTML = "- Unit";

    unitDiv.appendChild(valInp);
    unitDiv.appendChild(measureInp);
    unitDiv.appendChild(unitsList);
    unitDiv.appendChild(unitDel);

    unitDiv.classList.add("unit-div");

    prevSib.appendChild(unitDiv);

    if (parent.getElementsByClassName("unit-div").length == 2) {
        const addUnit = parent.getElementsByClassName("set-unit-add")[0];
        addUnit.style.display = "none";
    }
};
