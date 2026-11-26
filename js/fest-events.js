(function () {
    "use strict";

    const DB_NAME = "VYBE_Fest_Events";
    const STORE_NAME = "festEvents";

    function openDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, 1);

            request.onupgradeneeded = function () {
                const db = request.result;

                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, {
                        keyPath: "id"
                    });
                }
            };

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async function getAll() {
        const db = await openDatabase();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, "readonly");
            const request = transaction.objectStore(STORE_NAME).getAll();

            request.onsuccess = () => {
                resolve(request.result.sort((a, b) =>
                    String(a.date).localeCompare(String(b.date))
                ));
            };

            request.onerror = () => reject(request.error);
        });
    }

    async function get(id) {
        const db = await openDatabase();

        return new Promise((resolve, reject) => {
            const request = db.transaction(STORE_NAME, "readonly")
                .objectStore(STORE_NAME).get(id);

            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => reject(request.error);
        });
    }

    async function save(event) {
        const db = await openDatabase();
        const now = new Date().toISOString();

        const record = {
            ...event,
            createdAt: event.createdAt || now,
            updatedAt: now
        };

        return new Promise((resolve, reject) => {
            const request = db.transaction(STORE_NAME, "readwrite")
                .objectStore(STORE_NAME).put(record);

            request.onsuccess = () => resolve(record);
            request.onerror = () => reject(request.error);
        });
    }

    async function remove(id) {
        const db = await openDatabase();

        return new Promise((resolve, reject) => {
            const request = db.transaction(STORE_NAME, "readwrite")
                .objectStore(STORE_NAME).delete(id);

            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    }

    function createId() {
        return window.crypto && crypto.randomUUID
            ? crypto.randomUUID()
            : "fest-" + Date.now() + "-" +
              Math.random().toString(16).slice(2);
    }

    window.VybeFestEvents = {
        getAll,
        get,
        save,
        remove,
        createId
    };
})();
