import fs from "node:fs/promises";

const databasePath = new URL("../db.json", import.meta.url);

export class Database {
  #database = {};

  constructor() {
    fs.readFile(databasePath, "utf-8")
      .then((data) => {
        this.#database = JSON.parse(data);
      })
      .catch(() => {
        this.#persist();
      });
  }

  #persist() {
    fs.writeFile(databasePath, JSON.stringify(this.#database));
  }

  select(table, search) {
    let data = this.#database[table] ?? [];

    if (search) {
      data = data.filter((row) => {
        return Object.entries(search).some(([key, value]) => {
          return row[key].toLowerCase().includes(value.toLowerCase());
        });
      });
    }

    return data;
  }

  insert(table, data) {
    if (Array.isArray(this.#database[table])) {
      this.#database[table].push(data);
    } else {
      this.#database[table] = [data];
    }

    this.#persist();

    return data;
  }

  update(table, id, data) {
    let taskExists = false;
    const rowIndex = this.#database[table].findIndex((row) => row.id === id);

    if (rowIndex > -1) {
      taskExists = true;
      const taskToUpdate = this.#database[table][rowIndex];

      this.#database[table][rowIndex] = {
        id,
        ...taskToUpdate,
        ...data,
      };

      this.#persist();
    }

    return taskExists;
  }

  delete(table, id) {
    let taskExists = false;
    const rowIndex = this.#database[table].findIndex((row) => row.id === id);

    if (rowIndex > -1) {
      taskExists = true;
      this.#database[table].splice(rowIndex, 1);
      this.#persist();
    }

    return taskExists;
  }

  complete(table, id) {
    let taskExists = false;
    const rowIndex = this.#database[table].findIndex((row) => row.id === id);

    if (rowIndex > -1) {
      taskExists = true;

      const task = this.#database[table][rowIndex];
      const isTaskCompleted = !!task.completed_at;
      const completed_at = isTaskCompleted ? null : new Date().toISOString();

      this.#database[table][rowIndex].completed_at = completed_at;
      this.#persist();
    }

    return taskExists;
  }
}
