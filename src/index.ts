// Base component class
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
    templateElement: HTMLTemplateElement
    hostElement: T
    element: U

    constructor(templateId: string, hostElementId: string, insertAtStart: boolean, newElementId?: string) {
        this.templateElement = document.querySelector(templateId)!
        this.hostElement = document.querySelector(hostElementId)!

        const importedNode = document.importNode(this.templateElement.content, true)

        this.element = importedNode.firstElementChild as U

        if (newElementId) {
            this.element.id = newElementId
        }

        this.attach(insertAtStart)
    }

    private attach(insertAtBeginning: boolean) {
        this.hostElement.insertAdjacentElement(insertAtBeginning ? 'afterbegin' : 'beforeend', this.element)
    }

    abstract configure(): void
    abstract renderContent(): void
}

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
class ProjectList extends Component<HTMLDivElement, HTMLElement> {
    assignedProjects: Project[] = []

    constructor(private type: 'active' | 'finished') {
        super('#project-list', '#app', false, `${type}-projects`)

        this.configure()

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

    configure() {
        projectState.addListener((projects: Project[]) => {
            const relevantProjects = projects.filter((prj) => {
                if (this.type === 'active') {
                    return prj.status === ProjectStatus.Active
                }
                return prj.status === ProjectStatus.Finished
            })

            this.assignedProjects = relevantProjects
            this.renderProjects()
        })
    }

    renderContent() {
        this.element.querySelector('ul')!.id = 'project-list'
        this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS'
    }
}

// ProjectInput Class
class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
    titleInputElement: HTMLInputElement
    descriptionInputElement: HTMLInputElement
    peopleInputElement: HTMLInputElement

    constructor() {
        super('#project-input', '#app', true, 'user-input')

        this.titleInputElement = this.element.querySelector('#title') as HTMLInputElement
        this.descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement
        this.peopleInputElement = this.element.querySelector('#people') as HTMLInputElement

        this.configure()
    }

    configure() {
        this.element.addEventListener('submit', this.submitHandler)
    }

    renderContent() {}

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
}

// instantiate classes
const prjInput = new ProjectInput()
const activePrjList = new ProjectList('active')
const finishedPrjList = new ProjectList('finished')
