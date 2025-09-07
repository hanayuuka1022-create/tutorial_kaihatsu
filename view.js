class View {
    constructor() {
        // 主要なDOM要素
        this.app = document.body;
        this.taskStats = document.getElementById('task-stats');
        this.addTaskForm = document.getElementById('add-task-form');
        this.newTaskTitle = document.getElementById('new-task-title');
        this.newTaskDue = document.getElementById('new-task-due');
        this.newTaskTags = document.getElementById('new-task-tags');
        this.taskTbody = document.getElementById('task-list-body');
        this.filterKeyword = document.getElementById('filter-keyword');
        this.filterTag = document.getElementById('filter-tag');
        this.filterStatus = document.getElementById('filter-status');
        this.sortBy = document.getElementById('sort-by');
        this.clearFiltersBtn = document.getElementById('clear-filters-btn');
        this.exportCsvBtn = document.getElementById('export-csv-btn');

        // 編集モーダル
        this.editModal = document.getElementById('edit-modal');
        this.editForm = document.getElementById('edit-task-form');
        this.editId = document.getElementById('edit-task-id');
        this.editTitle = document.getElementById('edit-task-title');
        this.editDue = document.getElementById('edit-task-due');
        this.editTags = document.getElementById('edit-task-tags');
        this.editStatus = document.getElementById('edit-task-status');
        this.closeModalBtn = this.editModal.querySelector('.close-btn');

        // トースト
        this.toastContainer = document.getElementById('toast-container');
    }

    /**
     * タスク一覧を描画します。
     * @param {object[]} tasks - 描画するタスクの配列。
     */
    renderTasks(tasks) {
        this.taskTbody.innerHTML = '';
        if (tasks.length === 0) {
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.colSpan = 7;
            td.textContent = '表示するタスクがありません。';
            td.style.textAlign = 'center';
            tr.appendChild(td);
            this.taskTbody.appendChild(tr);
            return;
        }

        tasks.forEach(task => {
            const tr = document.createElement('tr');
            tr.id = `task-${task.id}`;
            tr.className = `task-row ${task.status === 'done' ? 'task-row--done' : ''}`;

            // 完了チェックボックス
            const completeCell = tr.insertCell();
            completeCell.dataset.label = '完了';
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'toggle-status';
            checkbox.checked = task.status === 'done';
            checkbox.dataset.id = task.id;
            completeCell.appendChild(checkbox);

            // タイトル
            const titleCell = tr.insertCell();
            titleCell.dataset.label = 'タイトル';
            titleCell.className = 'task-title';
            titleCell.textContent = task.title;

            // ステータス
            const statusCell = tr.insertCell();
            statusCell.dataset.label = 'ステータス';
            const statusBadge = document.createElement('span');
            statusBadge.className = `badge badge--status-${task.status}`;
            statusBadge.textContent = { todo: '未着手', doing: '進行中', done: '完了' }[task.status];
            statusCell.appendChild(statusBadge);

            // 期限
            const dueCell = tr.insertCell();
            dueCell.dataset.label = '期限';
            if (task.due) {
                const dueDate = new Date(task.due);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                const dueBadge = document.createElement('span');
                dueBadge.textContent = task.due;
                let badgeClass = 'badge badge--due-future';
                if (dueDate < today) {
                    badgeClass = 'badge badge--due-overdue';
                } else if (dueDate.getTime() === today.getTime()) {
                    badgeClass = 'badge badge--due-today';
                }
                dueBadge.className = badgeClass;
                dueCell.appendChild(dueBadge);
            }

            // タグ
            const tagsCell = tr.insertCell();
            tagsCell.dataset.label = 'タグ';
            task.tags.forEach(tag => {
                const tagBadge = document.createElement('span');
                tagBadge.className = 'badge tag-badge';
                tagBadge.textContent = tag;
                tagsCell.appendChild(tagBadge);
            });

            // 作成日時
            const createdCell = tr.insertCell();
            createdCell.dataset.label = '作成日時';
            createdCell.textContent = formatDate(task.created_at);

            // 操作ボタン
            const actionsCell = tr.insertCell();
            actionsCell.dataset.label = '操作';
            const editBtn = document.createElement('button');
            editBtn.textContent = '✏️';
            editBtn.className = 'edit-btn';
            editBtn.dataset.id = task.id;
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = '🗑️';
            deleteBtn.className = 'delete-btn';
            deleteBtn.dataset.id = task.id;
            actionsCell.append(editBtn, deleteBtn);

            this.taskTbody.appendChild(tr);
        });
    }

    /**
     * ヘッダーのタスク統計を更新します。
     * @param {{todo: number, doing: number, done: number}} stats - 統計情報。
     */
    renderStats(stats) {
        this.taskStats.textContent = `未着手: ${stats.todo} / 進行中: ${stats.doing} / 完了: ${stats.done}`;
    }

    /**
     * トーストメッセージを表示します。
     * @param {string} message - 表示するメッセージ。
     * @param {'info' | 'success' | 'error'} type - メッセージの種類。
     */
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;
        toast.textContent = message;
        this.toastContainer.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        setTimeout(() => {
            toast.classList.remove('show');
            toast.addEventListener('transitionend', () => toast.remove());
        }, 3000);
    }

    /**
     * 編集モーダルを開き、タスクデータをフォームに設定します。
     * @param {object} task - 編集するタスクオブジェクト。
     */
    openEditModal(task) {
        this.editId.value = task.id;
        this.editTitle.value = task.title;
        this.editDue.value = task.due || '';
        this.editTags.value = task.tags.join(', ');
        this.editStatus.value = task.status;
        this.editModal.style.display = 'flex';
        this.editTitle.focus();
    }

    /**
     * 編集モーダルを閉じます。
     */
    closeEditModal() {
        this.editModal.style.display = 'none';
    }

    /**
     * 新規タスク登録フォームをクリアします。
     */
    clearNewTaskForm() {
        this.newTaskTitle.value = '';
        this.newTaskDue.value = '';
        this.newTaskTags.value = '';
        this.newTaskTitle.focus();
    }
    
    /**
     * フィルタの入力値をクリアします。
     */
    clearFilters() {
        this.filterKeyword.value = '';
        this.filterTag.value = '';
        this.filterStatus.value = 'all';
    }

    // --- イベントバインディング ---

    bindAddTask(handler) {
        this.addTaskForm.addEventListener('submit', event => {
            event.preventDefault();
            const title = this.newTaskTitle.value.trim();
            if (title) {
                const due = this.newTaskDue.value;
                const tags = this.newTaskTags.value.split(',').map(t => t.trim()).filter(Boolean);
                handler(title, due, tags);
            }
        });
    }

    bindUpdateTask(handler) {
        this.editForm.addEventListener('submit', event => {
            event.preventDefault();
            const id = this.editId.value;
            const title = this.editTitle.value.trim();
            if (title) {
                const data = {
                    title,
                    due: this.editDue.value,
                    tags: this.editTags.value.split(',').map(t => t.trim()).filter(Boolean),
                    status: this.editStatus.value,
                };
                handler(id, data);
            }
        });
    }

    bindTaskActions(deleteHandler, toggleHandler, openEditHandler) {
        this.taskTbody.addEventListener('click', event => {
            const target = event.target;
            const id = target.dataset.id;
            if (!id) return;

            if (target.classList.contains('delete-btn')) {
                deleteHandler(id);
            } else if (target.classList.contains('toggle-status')) {
                toggleHandler(id);
            } else if (target.classList.contains('edit-btn')) {
                openEditHandler(id);
            }
        });
    }

    bindModalClose() {
        this.closeModalBtn.addEventListener('click', () => this.closeEditModal());
        this.editModal.addEventListener('click', event => {
            if (event.target === this.editModal) {
                this.closeEditModal();
            }
        });
    }

    bindFilterChange(handler) {
        const debounce = (func, delay) => {
            let timeout;
            return (...args) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => func.apply(this, args), delay);
            };
        };

        const debouncedHandler = debounce(handler, 300);

        this.filterKeyword.addEventListener('input', () => debouncedHandler('keyword', this.filterKeyword.value));
        this.filterTag.addEventListener('input', () => debouncedHandler('tag', this.filterTag.value));
        this.filterStatus.addEventListener('change', () => handler('status', this.filterStatus.value));
    }

    bindSortChange(handler) {
        this.sortBy.addEventListener('change', () => handler(this.sortBy.value));
    }
    
    bindClearFilters(handler) {
        this.clearFiltersBtn.addEventListener('click', handler);
    }

    bindExportCsv(handler) {
        this.exportCsvBtn.addEventListener('click', handler);
    }
}
