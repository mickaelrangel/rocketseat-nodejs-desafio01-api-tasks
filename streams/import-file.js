import { parse } from "csv-parse";
import fs from "node:fs";

const csvPath = new URL("./tasks.csv", import.meta.url);

const csvStream = fs.createReadStream(csvPath);

const csvParser = parse({
  fromLine: 2,
  delimiter: ",",
  skipEmptyLines: true,
});

async function execute() {
  const lines = csvStream.pipe(csvParser);

  for await (const line of lines) {
    const [title, description] = line;

    await fetch("http://localhost:3333/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        description,
      }),
    });

    await wait(1000);
  }
}

execute();

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
