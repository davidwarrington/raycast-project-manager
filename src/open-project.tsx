import fs from "node:fs/promises";
import path from "node:path";
import { List } from "@raycast/api";
import { useEffect, useState } from "react";

function useDirs(baseDir: string) {
  const [directories, setDirectories] = useState<string[]>([]);
  const [state, setState] = useState<"loading" | "idle">("loading");

  async function getDirectories() {
    const dir = await fs.readdir(baseDir);

    const dirs = await Promise.all(
      dir.filter(async (child) => {
        const stats = await fs.stat(path.join(baseDir, child));
        return stats.isDirectory();
      })
    );

    setState("idle");
    setDirectories(dirs);
  }

  return {
    directories,
    getDirectories,
    state,
  };
}

export default function OpenProject() {
  const { directories, getDirectories, state } = useDirs("/");

  useEffect(() => {
    getDirectories();
  }, []);

  return (
    <List isLoading={state === "loading"}>
      {directories.map((directory) => (
        <List.Item title={directory} key={directory} />
      ))}
    </List>
  );
}
