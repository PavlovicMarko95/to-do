var ToDo = function (rootElementAll, rootElementActive, rootElementCompleted) {

    this.rootElementAll = rootElementAll;
    this.rootElementActive = rootElementActive;
    this.rootElementCompleted = rootElementCompleted;


    let ToDoItem = function (content, date) {
        this.id = Math.random().toString(36).substring(7);
        this.content = content;
        this.date = date;
        this.completed = false;
    }


    let ToDoItemViewModel = function (toDoItem, views) {
        this.data = toDoItem;
        this.views = views;

        this.toJSON = function () {
            return this.data;
        }
    }


    let toDoItems = [];


    const TODO_ITEM_TEMPLATE = `
        <div class="todo-item-date">
            <span class="day"></span>
            <span class="month"></span>
        </div>
        <div class="todo-item-content">
            <span class="data"></span>
        </div>
        <span class="delete-btn" title="delete"></span>
`;


    function generateToDoItemView(toDoItem) {

        //first, create root element
        let toDoItemRoot = document.createElement('div');
        toDoItemRoot.classList.add("todo-item");
        toDoItemRoot.setAttribute('data-id', toDoItem.id);
        toDoItemRoot.innerHTML = TODO_ITEM_TEMPLATE;

        toDoItemRoot.getElementsByClassName("day")[0].innerHTML = toDoItem.date.toLocaleString('default', { day: 'numeric' });
        toDoItemRoot.getElementsByClassName("month")[0].innerHTML = toDoItem.date.toLocaleString('default', { month: 'short' });
        var dataElem = toDoItemRoot.getElementsByClassName("data")[0].innerHTML = toDoItem.content;
        toDoItemRoot.getElementsByClassName("delete-btn")[0].setAttribute('data-id', toDoItem.id);

        toDoItemRoot.classList.add(toDoItem.completed ? "completed" : null);

        let toDoItemRootCopy = toDoItemRoot.cloneNode(true);

        rootElementAll.append(toDoItemRoot);

        if (toDoItem.completed) {
            rootElementCompleted.append(toDoItemRootCopy);
        } else {
            rootElementActive.append(toDoItemRootCopy);
        }

        let toDoItemViewModel = new ToDoItemViewModel(toDoItem, [toDoItemRoot, toDoItemRootCopy]);
        toDoItems.push(toDoItemViewModel);

        //register handlers for delete button
        registerDeleteHandlers(toDoItemViewModel);

        //register handlers for click on item
        registerClickHandlers(toDoItemViewModel);

    }


    function registerDeleteHandlers(toDoViewModel) {

        for (let i = 0; i < toDoViewModel.views.length; i++) {
            toDoViewModel.views[i].getElementsByClassName("delete-btn")[0].onclick = function (e) {

                e.stopPropagation();

                var id = this.dataset.id;
                var index = toDoItems.findIndex(item => item.data.id === id);

                if (index > -1) {
                    //remove from array and from DOM
                    toDoItems.splice(index, 1);
                    toDoViewModel.views[0].parentNode.removeChild(toDoViewModel.views[0]);
                    toDoViewModel.views[1].parentNode.removeChild(toDoViewModel.views[1]);
                }

                deleteTodo(id);

            }
        }
    }


    function registerClickHandlers(toDoItemViewModel) {

        for (let i = 0; i < toDoItemViewModel.views.length; i++) {

            toDoItemViewModel.views[i].onclick = function (e) {
                var id = this.dataset.id;
                var index = toDoItems.findIndex(item => item.data.id === id);

                toDoItemViewModel.data.completed = !toDoItemViewModel.data.completed;


                if (toDoItemViewModel.data.completed) {

                    toDoItemViewModel.views[0].classList.add("completed");
                    toDoItemViewModel.views[1].classList.add("completed");
                    rootElementCompleted.appendChild(toDoItemViewModel.views[1]);

                } else {
                    toDoItemViewModel.views[0].classList.remove("completed");
                    toDoItemViewModel.views[1].classList.remove("completed");

                    rootElementActive.appendChild(toDoItemViewModel.views[1]);
                }

                toggleTodo(toDoItemViewModel.data.id);
            }
        }
    }


    const API_URL = "http://localhost:5000/api";

    // load svi todo sa backendom
    async function fetchTodos(){
        let res = await fetch(API_URL);
        return await res.json();
    }

    // add todo na backend
    async function saveTodo(todo) {
        let payload = {
            ...todo,
            date: todo.date.toISOString()
        };
        console.log("Saljem na server:", payload); //ovo vidis u devtools

        try{
            let res = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!res.ok){
                throw new Error("Server nije prihvatio todo");
            }

            let result = await res.json();
            console.log("backend odgovor:", result)

        }catch (err){
            console.error("Greska prilikom cuvanja:", err);
            alert("Neuspesno cuvanje todo stavke!");
        }
    }

    // Delete todo na backend
    async function deleteTodo(id){
        await fetch(`${API_URL}/${id}`, {method: "DELETE"});
    }

    async function toggleTodo(id){
        await fetch(`${API_URL}/${id}`, {method: "PUT"});
    }


    //loadFromLocalStorage();
    async function loadFromAPI(){
        let items = await fetchTodos();

        items.forEach(item => {
            item.date = new Date(item.date); // isto kao pre
            generateToDoItemView(item);
        });
    }

    loadFromAPI();

    return {

        add: async function (content) {

            let toDoItem = new ToDoItem(content, new Date());
            
            try {
                await saveTodo(toDoItem);

                generateToDoItemView(toDoItem)
            }catch (err){
                console.error("Greska prilikom cuvanja", err);
                alert("Neuspesno cuvanje todo stavke!");
            }

        }

    }

}