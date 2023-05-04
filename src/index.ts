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

    constructor(private type: 'active' | 'finished') {
        this.templateElement = document.querySelector('#project-list')!
        this.hostElement = document.querySelector('#app')!

        const importedNode = document.importNode(this.templateElement.content, true)

        this.element = importedNode.firstElementChild as HTMLElement
        this.element.id = `${this.type}-projects`

        this.attach()
        this.renderContent()
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

    private gatherUserInput(): [string, string, number] {
        const enteredTitle = this.titleInputElement.value
        const enteredDescription = this.descriptionInputElement.value
        const enteredPeople = this.peopleInputElement.value

        return [enteredTitle, enteredDescription, +enteredPeople]
    }

    @autobind
    private submitHandler(event: Event) {
        event.preventDefault()
        const userInput = this.gatherUserInput()
        if (Array.isArray(userInput)) {
            const [title, desc, people] = userInput
            console.log(title, desc, people)
        }
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
