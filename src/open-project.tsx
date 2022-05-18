import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { Action, ActionPanel, Application, getPreferenceValues, List, open } from "@raycast/api";
import { useEffect, useState } from "react";

interface ProjectDirectory {
  name: string;
  path: string;
}

interface Preferences {
  preferredApplication: Application;
  projectDirectory: string;
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
  const preferences = getPreferenceValues<Preferences>();
  const projectDirectory = preferences.projectDirectory.replace(/^~/, os.homedir);
  const { directories, getDirectories, state } = useDirs(projectDirectory);

  useEffect(() => {
    getDirectories();
  }, []);

  function openInEditor(projectPath: string) {
    open(projectPath, preferences.preferredApplication);
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
