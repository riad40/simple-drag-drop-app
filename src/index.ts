// Project Type

enum ProjectStatus {
    Active,
    Finished,
}

class Project {
    constructor(
        public id: string,
        public title: string,
        public description: string,
        public people: number,
        public status: ProjectStatus
    ) {}
}

// Project state management class

type Listener = (items: Project[]) => void
class ProjectState {
    private projects: Project[] = []
    private listeners: Listener[] = []
    private static instance: ProjectState

    private constructor() {}

    static getInstance() {
        if (this.instance) {
            return this.instance
        }
        this.instance = new ProjectState()
        return this.instance
    }

    addListener(listenerFn: Listener) {
        this.listeners.push(listenerFn)
    }

    addProject(title: string, description: string, numOfPeople: number) {
        const newProject = new Project(Math.random().toString(), title, description, numOfPeople, ProjectStatus.Active)
        this.projects.push(newProject)
        for (const listenerFn of this.listeners) {
            listenerFn(this.projects.slice())
        }
    }
}

// Global constant
const projectState = ProjectState.getInstance()

// Validation
interface Validatable {
    value: string | number
    required?: boolean
    minLength?: number
    maxLength?: number
    min?: number
    max?: number
}

function validate(validatableInput: Validatable) {
    let isValid = true
    if (validatableInput.required) {
        isValid = isValid && validatableInput.value.toString().trim().length !== 0
    }
    if (validatableInput.minLength != null && typeof validatableInput.value === 'string') {
        isValid = isValid && validatableInput.value.length >= validatableInput.minLength
    }
    if (validatableInput.maxLength != null && typeof validatableInput.value === 'string') {
        isValid = isValid && validatableInput.value.length <= validatableInput.maxLength
    }
    if (validatableInput.min != null && typeof validatableInput.value === 'number') {
        isValid = isValid && validatableInput.value >= validatableInput.min
    }
    if (validatableInput.max != null && typeof validatableInput.value === 'number') {
        isValid = isValid && validatableInput.value <= validatableInput.max
    }
    return isValid
}

// autobind decorator
function autobind(_: any, _2: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    const adjDescriptor: PropertyDescriptor = {
        configurable: true,
        get() {
            const boundFn = originalMethod.bind(this)
            return boundFn
        },
    }
    return adjDescriptor
}

// ProjectList Class
class ProjectList {
    templateElement: HTMLTemplateElement
    hostElement: HTMLDivElement
    element: HTMLElement
    assignedProjects: any[] = []

    constructor(private type: 'active' | 'finished') {
        this.templateElement = document.querySelector('#project-list')!
        this.hostElement = document.querySelector('#app')!

        const importedNode = document.importNode(this.templateElement.content, true)

        this.element = importedNode.firstElementChild as HTMLElement
        this.element.id = `${this.type}-projects`

        projectState.addListener((projects: Project[]) => {
            this.assignedProjects = projects
            this.renderProjects()
        })

        this.attach()

        this.renderContent()
    }

    renderProjects() {
        const listEl = this.element.querySelector('ul')! as HTMLUListElement
        listEl.innerHTML = ''
        for (const prjItem of this.assignedProjects) {
            const listItem = document.createElement('li')
            listItem.textContent = prjItem.title
            listEl.appendChild(listItem)
        }
    }

    private attach() {
        this.hostElement.insertAdjacentElement('beforeend', this.element)
    }

    private renderContent() {
        this.element.querySelector('ul')!.id = 'project-list'
        this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS'
    }
}

// ProjectInput Class
class ProjectInput {
    templateElement: HTMLTemplateElement
    hostElement: HTMLDivElement
    formElement: HTMLFormElement
    titleInputElement: HTMLInputElement
    descriptionInputElement: HTMLInputElement
    peopleInputElement: HTMLInputElement

    constructor() {
        this.templateElement = document.querySelector('#project-input')!
        this.hostElement = document.querySelector('#app')!

        const importedNode = document.importNode(this.templateElement.content, true)

        this.formElement = importedNode.firstElementChild as HTMLFormElement

        this.formElement.id = 'user-input'

        this.titleInputElement = this.formElement.querySelector('#title') as HTMLInputElement
        this.descriptionInputElement = this.formElement.querySelector('#description') as HTMLInputElement
        this.peopleInputElement = this.formElement.querySelector('#people') as HTMLInputElement

        this.attach()

        this.configure()
    }

    private gatherUserInput(): [string, string, number] | void {
        const enteredTitle = this.titleInputElement.value
        const enteredDescription = this.descriptionInputElement.value
        const enteredPeople = this.peopleInputElement.value

        const titleValidatable: Validatable = {
            value: enteredTitle,
            required: true,
        }

        const descriptionValidatable: Validatable = {
            value: enteredDescription,
            required: true,
            minLength: 5,
        }

        const peopleValidatable: Validatable = {
            value: +enteredPeople,
            required: true,
            min: 1,
            max: 10,
        }

        if (!validate(titleValidatable) || !validate(descriptionValidatable) || !validate(peopleValidatable)) {
            alert('Invalid input, please try again!')
            return
        }

        return [enteredTitle, enteredDescription, +enteredPeople]
    }

    private clearInputs() {
        this.titleInputElement.value = ''
        this.descriptionInputElement.value = ''
        this.peopleInputElement.value = ''
    }

    @autobind
    private submitHandler(event: Event) {
        event.preventDefault()
        const userInput = this.gatherUserInput()
        if (Array.isArray(userInput)) {
            const [title, desc, people] = userInput
            projectState.addProject(title, desc, people)
        }
        this.clearInputs()
    }

    private attach() {
        this.hostElement.insertAdjacentElement('afterbegin', this.formElement)
    }

    private configure() {
        this.formElement.addEventListener('submit', this.submitHandler)
    }
}

// instantiate classes
const prjInput = new ProjectInput()
const activePrjList = new ProjectList('active')
const finishedPrjList = new ProjectList('finished')
function renderProjects() {
    throw new Error('Function not implemented.')
}
