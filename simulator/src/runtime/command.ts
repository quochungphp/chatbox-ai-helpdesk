import { spawn } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

export type CommandInput = {
  args: string[];
  env?: NodeJS.ProcessEnv;
  name: string;
};

/**
 * Runs a local command and streams output so migration/reset failures are easy
 * to diagnose from the terminal.
 */
export function runCommand(input: CommandInput): Promise<void> {
  return new Promise((resolveCommand, reject) => {
    const child = spawn(input.args[0]!, input.args.slice(1), {
      cwd: repoRoot,
      env: {
        ...process.env,
        ...input.env
      },
      stdio: "inherit"
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolveCommand();
        return;
      }

      reject(new Error(`${input.name} failed with exit code ${code}`));
    });
  });
}
