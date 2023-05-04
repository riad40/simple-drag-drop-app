"use strict";
// ProjectList Class
class ProjectList {
    constructor(type) {
        this.type = type;
        this.templateElement = document.querySelector('#project-list');
        this.hostElement = document.querySelector('#app');
        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild;
        this.element.id = `${this.type}-projects`;
        this.attach();
        this.renderContent();
    }
    attach() {
        this.hostElement.insertAdjacentElement('beforeend', this.element);
    }
    renderContent() {
        this.element.querySelector('ul').id = 'project-list';
        this.element.querySelector('h2').textContent = this.type.toUpperCase() + ' PROJECTS';
    }
}
// ProjectInput Class
class ProjectInput {
    constructor() {
        this.templateElement = document.querySelector('#project-input');
        this.hostElement = document.querySelector('#app');
        const importedNode = document.importNode(this.templateElement.content, true);
        this.formElement = importedNode.firstElementChild;
        this.formElement.id = 'user-input';
        this.titleInputElement = this.formElement.querySelector('#title');
        this.descriptionInputElement = this.formElement.querySelector('#description');
        this.peopleInputElement = this.formElement.querySelector('#people');
        this.attach();
        this.configure();
    }
    submitHandler(event) {
        event.preventDefault();
        console.log(this.titleInputElement.value);
    }
    attach() {
        this.hostElement.insertAdjacentElement('afterbegin', this.formElement.bind(this));
    }
    configure() {
        this.formElement.addEventListener('submit', this.submitHandler);
    }
}
// instantiate classes
const prjInput = new ProjectInput();
const activePrjList = new ProjectList('active');
const finishedPrjList = new ProjectList('finished');
