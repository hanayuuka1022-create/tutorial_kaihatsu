class TaskStore {
    /**
     * @param {TaskRepository} repository - データ永続化のためのリポジトリ。
     */
    constructor(repository) {
        this.repository = repository;
        this._tasks = [];
        this._filterState = { keyword: '', tag: '', status: 'all' };
        this._sortState = { key: 'created_at', order: 'desc' };
    }

    /**
     * ストアを初期化し、リポジトリからタスクをロードします。
     */
    init() {
        this._tasks = this.repository.getAll();
    }

    /**
     * 現在のフィルタとソート条件に基づいてタスクのリストを返します。
     * @returns {object[]} フィルタリングおよびソートされたタスクの配列。
     */
    getFilteredAndSortedTasks() {
        // フィルタリング
        let filtered = this._tasks.filter(task => {
            const keywordMatch = !this._filterState.keyword ||
                task.title.toLowerCase().includes(this._filterState.keyword.toLowerCase()) ||
                task.tags.some(tag => tag.toLowerCase().includes(this._filterState.keyword.toLowerCase()));

            const tagMatch = !this._filterState.tag ||
                task.tags.some(tag => tag.toLowerCase() === this._filterState.tag.toLowerCase());

            const statusMatch = this._filterState.status === 'all' || task.status === this._filterState.status;

            return keywordMatch && tagMatch && statusMatch;
        });

        // ソート
        const { key, order } = this._sortState;
        filtered.sort((a, b) => {
            let valA = a[key];
            let valB = b[key];

            if (key === 'due') {
                // 期限未設定は最後に
                if (!valA) return 1;
                if (!valB) return -1;
            }

            if (valA < valB) return order === 'asc' ? -1 : 1;
            if (valA > valB) return order === 'asc' ? 1 : -1;
            return 0;
        });

        return filtered;
    }

    /**
     * 指定されたIDのタスクを返します。
     * @param {string} id - 検索するタスクのID。
     * @returns {object | undefined} 見つかったタスクオブジェクト。
     */
    getTaskById(id) {
        return this._tasks.find(task => task.id === id);
    }

    /**
     * タスクの統計情報（未着手、進行中、完了の件数）を返します。
     * @returns {{todo: number, doing: number, done: number}} 統計情報オブジェクト。
     */
    getStats() {
        return this._tasks.reduce((acc, task) => {
            acc[task.status]++;
            return acc;
        }, { todo: 0, doing: 0, done: 0 });
    }

    /**
     * フィルタ条件を更新します。
     * @param {object} newState - 新しいフィルタ状態。
     */
    setFilter(newState) {
        this._filterState = { ...this._filterState, ...newState };
    }

    /**
     * ソート条件を更新します。
     * @param {string} sortValue - 新しいソート条件 (例: 'created_at_desc')。
     */
    setSort(sortValue) {
        const [key, order] = sortValue.split('_');
        this._sortState = { key, order };
    }

    /**
     * 新しいタスクを追加します。
     * @param {{title: string, due: string, tags: string[]}} taskData - 新規タスクのデータ。
     */
    addTask(taskData) {
        const now = new Date().toISOString();
        const newTask = {
            id: self.crypto.randomUUID(),
            ...taskData,
            status: 'todo',
            created_at: now,
            updated_at: now,
        };
        this._tasks.push(newTask);
        this.repository.saveAll(this._tasks);
    }

    /**
     * 既存のタスクを更新します。
     * @param {object} taskData - 更新するタスクのデータ。
     */
    updateTask(taskData) {
        const index = this._tasks.findIndex(t => t.id === taskData.id);
        if (index !== -1) {
            this._tasks[index] = {
                ...this._tasks[index],
                ...taskData,
                updated_at: new Date().toISOString(),
            };
            this.repository.saveAll(this._tasks);
        }
    }

    /**
     * 指定されたIDのタスクを削除します。
     * @param {string} id - 削除するタスクのID。
     */
    deleteTask(id) {
        this._tasks = this._tasks.filter(task => task.id !== id);
        this.repository.saveAll(this._tasks);
    }

    /**
     * 指定されたIDのタスクのステータスを 'todo' ⇔ 'done' で切り替えます。
     * @param {string} id - ステータスを切り替えるタスクのID。
     */
    toggleTaskStatus(id) {
        const task = this.getTaskById(id);
        if (task) {
            task.status = task.status === 'done' ? 'todo' : 'done';
            task.updated_at = new Date().toISOString();
            this.repository.saveAll(this._tasks);
        }
    }
    
    /**
     * すべてのタスクを返します。
     * @returns {object[]} すべてのタスクの配列。
     */
    getAllTasks() {
        return this._tasks;
    }
}
