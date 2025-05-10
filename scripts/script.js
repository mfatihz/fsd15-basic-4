const taskDb = [];
        
// Updated time formatting
function updateCurrentTime() {
    const now = new Date();
    const options = { 
        weekday: 'short', 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        // hour: '2-digit',
        // minute: '2-digit'
    };
    const locale = 'id-ID';
    const dateTimeString = now.toLocaleDateString(locale, options);
    
    document.getElementById('current-time').textContent = dateTimeString.replace(/\//g, '-');
}

// Initialize and update time
updateCurrentTime();
setInterval(updateCurrentTime, 1000);

const sortTasksByDateDescending = (tasks) => {
    return tasks.sort((a, b) => {
        const dateA = a.date instanceof Date ? a.date : new Date(a.date);
        const dateB = b.date instanceof Date ? b.date : new Date(b.date);
        return dateA - dateB;
    });
};

function addTask() {
    const dateInput = document.getElementById('new-date');
    const taskInput = document.getElementById('new-task');
    const priorityInput = document.getElementById('new-priority');
    
    if (!dateInput.value || !taskInput.value || !priorityInput.value) {
        alert('Please fill in all fields');
        return;
    }
    
    taskDb.push({
        date: new Date(dateInput.value),
        task: taskInput.value,
        priority: priorityInput.value,
        isDone: false,
    });
    
    sortTasksByDateDescending(taskDb);
    
    // Clear form and hide it
    taskInput.value = '';
    priorityInput.value = '';
}

function clearTodoListElement() {
    const todoList = document.getElementById("todo-list");
    todoList.innerHTML = '';

    const doneList = document.getElementById("completed-list");
    doneList.innerHTML = '';
}

function taskItemTemplate(index, task) {
    const todoItem = document.createElement('article');
    todoItem.className = "task-list-item";
    todoItem.setAttribute('data-priority', task.priority);
    
    if(task.isDone) {
        todoItem.classList.add("completed-item");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const taskDate = task.date instanceof Date ? task.date : new Date(task.date);
    
    if (taskDate < today && !task.isDone) {
        todoItem.classList.add("overdue-item");
    }

    // Checkbox for done status
    const doneCell = document.createElement('div');
    doneCell.className = "checkbox-container";
    const checkbox = document.createElement('input');
    checkbox.type = "checkbox";
    checkbox.checked = task.isDone;
    checkbox.id = `task-${index}-done`;
    checkbox.setAttribute('aria-label', `Mark task "${task.task}" as ${task.isDone ? 'incomplete' : 'complete'}`);
    checkbox.onclick = function() {
        doneTask(index);
    };
    doneCell.appendChild(checkbox);
    todoItem.appendChild(doneCell);

    // Date
    const dateCell = document.createElement('div');
    dateCell.className = "date-content";
    // Format date as dd-mm-yyyy
    const day = String(taskDate.getDate()).padStart(2, '0');
    const month = String(taskDate.getMonth() + 1).padStart(2, '0');
    const year = taskDate.getFullYear();
    dateCell.textContent = `${day}-${month}-${year}`;
    todoItem.appendChild(dateCell);

    // Task content
    const taskCell = document.createElement('div');
    taskCell.className = "task-content";
    taskCell.textContent = task.task;
    todoItem.appendChild(taskCell);

    // Priority
    const priorityCell = document.createElement('div');
    priorityCell.className = `priority-content priority-${task.priority.toLowerCase()}`;
    const priorityBadge = document.createElement('span');
    priorityBadge.className = "priority-badge";
    priorityBadge.style.backgroundColor = getPriorityColor(task.priority);
    priorityCell.appendChild(priorityBadge);
    priorityCell.appendChild(document.createTextNode(task.priority));
    todoItem.appendChild(priorityCell);

    // Delete button
    const deleteCell = document.createElement('div');
    deleteCell.className = "delete-item";
    const deleteBtn = document.createElement('button');
    deleteBtn.className = "btn btn-danger btn-sm btn-icon-only-mobile";
    deleteBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
        <span class="btn-text">Delete</span>
    `;
    deleteBtn.onclick = function() {
        deleteTask(index);
    };
    deleteBtn.setAttribute('aria-label', `Delete task "${task.task}"`);
    deleteCell.appendChild(deleteBtn);
    todoItem.appendChild(deleteCell);
    
    return todoItem;
}

function getPriorityColor(priority) {
    switch(priority.toLowerCase()) {
        case 'high': return 'var(--danger-color)';
        case 'medium': return 'var(--warning-color)';
        case 'low': return 'var(--success-color)';
        default: return 'var(--gray-color)';
    }
}

const deleteAll = document.getElementById("delete-all");
deleteAll.onclick = function() {
    const activeTasks = taskDb.filter(task => !task.isDone).length;
    const completedTasks = taskDb.filter(task => task.isDone).length;
    
    let message = "Are you sure you want to delete ";
    if (activeTasks && completedTasks) {
        message += `all ${activeTasks} active tasks and ${completedTasks} completed tasks?`;
    } else if (activeTasks) {
        message += `all ${activeTasks} active tasks?`;
    } else if (completedTasks) {
        message += `all ${completedTasks} completed tasks?`;
    } else {
        alert('No tasks to delete');
        return;
    }
    
    if (confirm(message)) {
        taskDb.length = 0;
        clearTodoListElement();
        showTask();
    }
};

function deleteTask(index) {
    if (confirm("Are you sure you want to delete this task?")) {
        taskDb.splice(index, 1);
        clearTodoListElement();
        showTask();
    }
}

function doneTask(index) {
    taskDb[index].isDone = !taskDb[index].isDone;
    clearTodoListElement();
    showTask();
}

function showTask() {
    const todoList = document.getElementById("todo-list");
    const doneList = document.getElementById("completed-list");
    const todoEmpty = document.getElementById("todo-empty");
    const completedEmpty = document.getElementById("completed-empty");

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let hasActiveTasks = false;
    let hasCompletedTasks = false;
    
    for(let i = 0; i < taskDb.length; i++) {
        const task = taskDb[i];
        const taskDate = task.date instanceof Date ? task.date : new Date(task.date);
        
        const overdueFilter = document.getElementById("overdue-filter").value;
        const dateTypeFilter = document.getElementById("date-type-filter").value;
        const date1Filter = document.getElementById("filter-date-1").value;
        const date2Filter = document.getElementById("filter-date-2").value;
        const priorityFilter = document.getElementById("filter-priority").value;
        
        const dateFrom = date1Filter ? new Date(date1Filter) : null;
        const dateTo = date2Filter ? new Date(date2Filter) : null;
        
        // Check overdue filter first
        let overdueMatch = true;
        if (overdueFilter === "Overdue") {
            overdueMatch = taskDate < today && !task.isDone;
        }
        
        // Then check date filter
        let dateMatch = false;
        if (!date1Filter) {
            dateMatch = true;
        } else {
            switch(dateTypeFilter) {
                case "":
                    dateMatch = true;
                    break;
                case "Date":
                    dateMatch = taskDate.getTime() === dateFrom.getTime();
                    break;
                case "Max":
                    dateMatch = taskDate <= dateFrom;
                    break;
                case "Min":
                    dateMatch = taskDate >= dateFrom;
                    break;
                case "Range":
                    dateMatch = taskDate >= dateFrom && (!dateTo || taskDate <= dateTo);
                    break;
                default:
                    dateMatch = true;
            }
        }
        
        const priorityMatch = !priorityFilter || task.priority.toLowerCase() === priorityFilter.toLowerCase();
        
        todoList.appendChild(taskItemTemplate(i, task));
        hasActiveTasks = true;

        if (overdueMatch && dateMatch && priorityMatch) {
            if (task.isDone) {
                doneList.appendChild(taskItemTemplate(i, task));
                hasCompletedTasks = true;
            }
        }
    }
    
    // Show empty states if needed
    todoEmpty.classList.toggle('hidden', hasActiveTasks || taskDb.length === 0);
    completedEmpty.classList.toggle('hidden', hasCompletedTasks || taskDb.length === 0);
}

// Toggle new task form visibility
document.getElementById("show-task-form").addEventListener("click", function() {
    document.getElementById("new-task-form-section").classList.remove('hidden');
    // this.classList.add('hidden');
    document.getElementById("flex-left-1-action").classList.add('hidden');
    document.getElementById('new-date').focus();
});

document.getElementById("hide-task-form").addEventListener("click", function() {
    document.getElementById("new-task-form-section").classList.add('hidden');
    // document.getElementById("show-task-form").classList.remove('hidden');
    document.getElementById("flex-left-1-action").classList.remove('hidden');
});

// Event listeners
document.getElementById("overdue-filter").addEventListener("change", function() {
    clearTodoListElement();
    showTask();
});

document.getElementById("date-type-filter").addEventListener("change", function(e) {
    console.log(e.target.value == "");
    const date1FilterContainer = document.getElementById("date1-filter");
    date1FilterContainer.classList.toggle('hidden', e.target.value == "");

    const date2FilterContainer = document.getElementById("date2-filter");
    date2FilterContainer.classList.toggle('hidden', e.target.value !== "Range");
    clearTodoListElement();
    showTask();
});

document.getElementById("filter-date-1").addEventListener("change", function() {
    clearTodoListElement();
    showTask();
});

document.getElementById("filter-date-2").addEventListener("change", function() {
    clearTodoListElement();
    showTask();
});

document.getElementById("filter-priority").addEventListener("change", function() {
    clearTodoListElement();
    showTask();
});

// Collapse filters by default on page load
document.getElementById("filter-section").classList.add("collapsed");
document.getElementById("show-filters").checked = false;

document.getElementById("new-task-form").addEventListener("submit", function(e) {
    e.preventDefault();
    addTask();
    clearTodoListElement();
    showTask();
});

// Toggle filter section visibility
document.getElementById("show-filters").addEventListener("change", function() {
    document.getElementById("filter-section").classList.toggle("collapsed", !this.checked);
});

document.getElementById("clear-all-filters").addEventListener("click", function(e) {
    e.preventDefault();
    document.getElementById("overdue-filter").value = "All";
    document.getElementById("date-type-filter").value = "Date";
    document.getElementById("filter-date-1").value = "";
    document.getElementById("filter-date-2").value = "";
    document.getElementById("filter-priority").value = "";

    document.getElementById("date1-filter").classList.add('hidden');
    document.getElementById("date2-filter").classList.add('hidden');
    clearTodoListElement();
    showTask();
});

// Initialize date to today
//document.getElementById('new-date').valueAsDate = new Date();

// Initialize the view
showTask();