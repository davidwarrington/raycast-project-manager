import fs from "node:fs/promises";
import path from "node:path";
import { Action, ActionPanel, Application, getApplications, List, open } from "@raycast/api";
import { useEffect, useState } from "react";

interface ProjectDirectory {
  name: string;
  path: string;
}

function OpenProjectAction({ onOpen }: { onOpen: () => void }) {
  return <Action title="Open project" onAction={onOpen} />;
}

function useDirs(baseDir: string) {
  const [directories, setDirectories] = useState<ProjectDirectory[]>([]);
  const [state, setState] = useState<"loading" | "idle">("loading");

  async function getDirectories() {
    const dir = await fs.readdir(baseDir);

    const dirs = await Promise.all(
      dir
        .filter(async (child) => {
          const stats = await fs.stat(path.join(baseDir, child));
          return stats.isDirectory();
        })
        .map((name) => ({
          name,
          path: path.join(baseDir, name),
        }))
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

  const [apps, setApps] = useState<Application[]>([]);
  useEffect(() => {
    getDirectories();
    getApplications("/").then((applications) => setApps(applications));
  }, []);

  function openInEditor(projectPath: string) {
    const code = apps.find((app) => app.name.toLowerCase().includes("code"));
    open(projectPath, code);
  }

  return (
    <List isLoading={state === "loading"}>
      {directories.map((directory) => (
        <List.Item
          title={directory.name}
          key={directory.path}
          actions={
            <ActionPanel>
              <ActionPanel.Section>
                <OpenProjectAction onOpen={() => openInEditor(directory.path)} />
              </ActionPanel.Section>
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
