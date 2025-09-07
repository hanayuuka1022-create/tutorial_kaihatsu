/**
 * ISO8601形式の日付文字列を 'YYYY-MM-DD HH:mm' 形式にフォーマットします。
 * @param {string | null} isoString - ISO8601形式の日付文字列。
 * @returns {string} フォーマットされた日付文字列、または空文字列。
 */
function formatDate(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const h = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${y}-${m}-${d} ${h}:${min}`;
}

/**
 * CSVのフィールドをエスケープします。
 * @param {any} field - エスケープする値。
 * @returns {string} エスケープされたCSVフィールド。
 */
function escapeCsvField(field) {
    if (field === null || field === undefined) {
        return '';
    }
    const str = String(field);
    // フィールドにカンマ、ダブルクォート、改行が含まれる場合はダブルクォートで囲む
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        // 内部のダブルクォートは2つにエスケープ
        const escapedStr = str.replace(/"/g, '""');
        return `"${escapedStr}"`;
    }
    return str;
}

/**
 * タスクの配列からCSV文字列を生成します。
 * @param {object[]} tasks - タスクオブジェクトの配列。
 * @returns {string} 生成されたCSV文字列。
 */
function generateCsv(tasks) {
    const headers = ['id', 'title', 'due', 'tags', 'status', 'created_at', 'updated_at'];
    const rows = tasks.map(task => {
        const tags = Array.isArray(task.tags) ? task.tags.join(';') : '';
        const values = [
            task.id,
            task.title,
            task.due || '',
            tags,
            task.status,
            task.created_at,
            task.updated_at
        ];
        return values.map(escapeCsvField).join(',');
    });
    return [headers.join(','), ...rows].join('\r\n');
}

/**
 * コンテンツをファイルとしてダウンロードさせます。
 * @param {string} content - ファイルの内容。
 * @param {string} fileName - ダウンロードするファイル名。
 * @param {string} mimeType - ファイルのMIMEタイプ。
 */
function downloadFile(content, fileName, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * 文字列からHTMLタグを簡易的にサニタイズします。
 * @param {string} str - サニタイズする文字列。
 * @returns {string} サニタイズされた文字列。
 */
function sanitizeHTML(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}
