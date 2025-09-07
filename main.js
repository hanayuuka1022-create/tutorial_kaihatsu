class App {
    /**
     * @param {TaskStore} store
     * @param {View} view
     */
    constructor(store, view) {
        this.store = store;
        this.view = view;

        // イベントハンドラをバインド
        this.view.bindAddTask(this.handleAddTask.bind(this));
        this.view.bindUpdateTask(this.handleUpdateTask.bind(this));
        this.view.bindTaskActions(
            this.handleDeleteTask.bind(this),
            this.handleToggleTaskStatus.bind(this),
            this.handleOpenEditModal.bind(this)
        );
        this.view.bindModalClose();
        this.view.bindFilterChange(this.handleFilterChange.bind(this));
        this.view.bindSortChange(this.handleSortChange.bind(this));
        this.view.bindClearFilters(this.handleClearFilters.bind(this));
        this.view.bindExportCsv(this.handleExportCsv.bind(this));
    }

    /**
     * アプリケーションを初期化します。
     */
    init() {
        this.store.init();
        this._render();
    }

    /**
     * 画面を再描画する共通処理です。
     */
    _render() {
        const tasks = this.store.getFilteredAndSortedTasks();
        const stats = this.store.getStats();
        this.view.renderTasks(tasks);
        this.view.renderStats(stats);
    }

    // --- イベントハンドラ ---

    /** @param {string} title, @param {string} due, @param {string[]} tags */
    handleAddTask(title, due, tags) {
        this.store.addTask({ title, due, tags });
        this._render();
        this.view.clearNewTaskForm();
        this.view.showToast('タスクを追加しました。', 'success');
    }

    /** @param {string} id, @param {object} data */
    handleUpdateTask(id, data) {
        this.store.updateTask({ id, ...data });
        this._render();
        this.view.closeEditModal();
        this.view.showToast('タスクを更新しました。', 'success');
    }

    /** @param {string} id */
    handleDeleteTask(id) {
        if (confirm('本当にこのタスクを削除しますか？')) {
            this.store.deleteTask(id);
            this._render();
            this.view.showToast('タスクを削除しました。');
        }
    }

    /** @param {string} id */
    handleToggleTaskStatus(id) {
        this.store.toggleTaskStatus(id);
        this._render();
    }

    /** @param {string} id */
    handleOpenEditModal(id) {
        const task = this.store.getTaskById(id);
        if (task) {
            this.view.openEditModal(task);
        }
    }

    /** @param {string} key, @param {string} value */
    handleFilterChange(key, value) {
        this.store.setFilter({ [key]: value });
        this._render();
    }

    /** @param {string} sortValue */
    handleSortChange(sortValue) {
        this.store.setSort(sortValue);
        this._render();
    }
    
    handleClearFilters() {
        this.view.clearFilters();
        this.store.setFilter({ keyword: '', tag: '', status: 'all' });
        this._render();
    }

    handleExportCsv() {
        const tasks = this.store.getAllTasks();
        if (tasks.length === 0) {
            this.view.showToast('エクスポートするタスクがありません。', 'error');
            return;
        }
        try {
            const csvContent = generateCsv(tasks);
            downloadFile(csvContent, `tasks-${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8;');
            this.view.showToast('CSVをエクスポートしました。', 'success');
        } catch (e) {
            console.error('CSV export failed:', e);
            this.view.showToast('CSVのエクスポートに失敗しました。', 'error');
        }
    }
}

// アプリケーションの起動
document.addEventListener('DOMContentLoaded', () => {
    const repo = new TaskRepository('todo_tasks_v1');
    const store = new TaskStore(repo);
    const view = new View();
    const app = new App(store, view);
    app.init();
});
