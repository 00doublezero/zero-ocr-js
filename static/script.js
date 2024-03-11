const socket = new WebSocket("ws://localhost:8080");

const svgIconArrowBottom = '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <rect width="24" height="24" fill="white"></rect> <path d="M17 9.5L12 14.5L7 9.5" stroke="#000000" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>';
const svgIconArrowLeft = '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <rect width="24" height="24" fill="white"></rect> <path d="M14.5 17L9.5 12L14.5 7" stroke="#000000" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>';
const svgIconListArrowBottom = '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M13 12H21M13 8H21M13 16H21M6 7V17M6 17L3 14M6 17L9 14" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>';

const blockClassName = "block";
const textClassName = "text";
const buttonMorphInfoClassName = "morphInfo";
const buttonSelecttextClassName = "selectText";
const buttonCollapsClassName = "collaps";
const spanMorphInfoName = "spanMorphInfo";
const tablemorpINfoName = "tableMorphInfo";

socket.addEventListener("message", (event) => {
    add_block(event.data.trim());
});

function add_block(textOutput) {

    const blockDiv = document.createElement("div");
    blockDiv.classList.add(blockClassName);

    const textParagraphP = document.createElement("p");
    textParagraphP.classList.add(textClassName);

    const morphInfoButton = document.createElement("button");
    morphInfoButton.classList.add(buttonMorphInfoClassName);
    morphInfoButton.setAttribute("unselectable", "on");

    const selectTextButton = document.createElement("button");
    selectTextButton.classList.add(buttonSelecttextClassName);

    const collapsButton = document.createElement("button");
    collapsButton.classList.add(buttonCollapsClassName);

    document.getElementById('ocr').append(blockDiv);
    blockDiv.append(morphInfoButton, selectTextButton, collapsButton, textParagraphP);

    textParagraphP.insertAdjacentHTML('beforeend', textOutput);

    morphInfoButton.insertAdjacentHTML('beforeend', svgIconArrowBottom);
    selectTextButton.insertAdjacentHTML('beforeend', svgIconArrowLeft);
    collapsButton.insertAdjacentHTML('beforeend', svgIconListArrowBottom);

    morphInfoButton.addEventListener("click", tocken, false);
    morphInfoButton.addEventListener("click", hide_show, false);
    selectTextButton.addEventListener("click", select_text, false);
    collapsButton.addEventListener("click", collapse, false);

    morphInfoButton.setAttribute('click_nuber', 0);
    window.scrollTo(0, document.body.scrollHeight);
}

function collapse() {
    function getNextSiblings(elem, filter) {
        var sibs = [];
        var nextElem = elem.parentNode.firstChild;
        do {
            if (nextElem.nodeType === 3) continue; // ignore text nodes
            if (nextElem === elem) continue; // ignore elem of target
            if (nextElem === elem.nextElementSibling) {
                if (!filter || filter(elem)) {
                    sibs.push(nextElem);
                    elem = nextElem;
                }
            }
        } while (nextElem = nextElem.nextSibling)
        return sibs;
    }
    let newText = this.parentElement.textContent;
    let siblings = getNextSiblings(this.parentElement);
    if (siblings.length > 0) {
        siblings.forEach((sibling) => {
            newText += sibling.textContent;
        })
        add_block(newText);
        // TODO: remove duplicate functionality with "selected_text"
        let range = document.createRange();
        range.selectNode(this.parentElement.parentElement.lastChild);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
    }

}

function select_text() {
    let text = this.parentElement.getElementsByClassName(textClassName)[0];
    let range = document.createRange();
    range.selectNode(text);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
}

function hide_show() {
    let morpinfoTable = this.parentElement.getElementsByClassName(tablemorpINfoName)[0];

    let morpinfoTableDisplay = getComputedStyle(morpinfoTable).display;
    if (this.getAttribute('click_nuber') == 0) {
        this.setAttribute('click_nuber', 1);
    } else {
        if (morpinfoTableDisplay !== "none") {
            morpinfoTable.style.display = "none";
        } else {
            morpinfoTable.style.display = "block";
        }
    }

}
function tocken() {
    let ret = kagome_tokenize(this.parentElement.getElementsByClassName(textClassName)[0]
        .textContent.trim());

    const morphInfoSpan = document.createElement('span');
    morphInfoSpan.classList.add(spanMorphInfoName);

    const morpinfoTable = document.createElement('table');
    morpinfoTable.classList.add(tablemorpINfoName);

    const blockDiv = this.parentElement;
    blockDiv.append(morphInfoSpan);

    morphInfoSpan.append(morpinfoTable);
    for (const key in ret) {
        morpinfoTable.insertAdjacentHTML('beforeend',
            "<tr>" +
            "<td>" + ret[key].surface_form + "</td>" +
            "<td>" + ret[key].pos + "</td>" +
            //"<td>"+ ret[key].base_form+"</td>"+
            "<td>" + ret[key].reading + "</td>" +
            //"<td>"+ ret[key].pronunciation+"</td>"+
            "</tr>"
        );
    }
    this.removeEventListener("click", tocken);
}
