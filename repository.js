class TaskRepository {
    /**
     * @param {string} storageKey - localStorageで使用するキー。
     */
    constructor(storageKey) {
        this.storageKey = storageKey;
    }

    /**
     * localStorageからすべてのタスクを取得します。
     * @returns {object[]} タスクの配列。
     */
    getAll() {
        try {
            const tasksJson = localStorage.getItem(this.storageKey);
            return tasksJson ? JSON.parse(tasksJson) : [];
        } catch (e) {
            console.error('Failed to parse tasks from localStorage:', e);
            return [];
        }
    }

    /**
     * タスクの配列をlocalStorageに保存します。
     * @param {object[]} tasks - 保存するタスクの配列。
     */
    saveAll(tasks) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(tasks));
        } catch (e) {
            console.error('Failed to save tasks to localStorage:', e);
        }
    }

    /**
     * 新しいタスクを1件追加します。
     * @param {object} task - 追加するタスクオブジェクト。
     */
    add(task) {
        const tasks = this.getAll();
        tasks.push(task);
        this.saveAll(tasks);
    }

    /**
     * 既存のタスクを更新します。
     * @param {object} updatedTask - 更新するタスクオブジェクト。
     */
    update(updatedTask) {
        const tasks = this.getAll();
        const index = tasks.findIndex(t => t.id === updatedTask.id);
        if (index !== -1) {
            tasks[index] = updatedTask;
            this.saveAll(tasks);
        }
    }

    /**
     * 指定されたIDのタスクを削除します。
     * @param {string} id - 削除するタスクのID。
     */
    delete(id) {
        const tasks = this.getAll();
        const filteredTasks = tasks.filter(t => t.id !== id);
        this.saveAll(filteredTasks);
    }
}
