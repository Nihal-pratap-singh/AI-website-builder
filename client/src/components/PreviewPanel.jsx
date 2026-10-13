
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  SandpackCodeEditor,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
  useSandpack,
} from "@codesandbox/sandpack-react";

import { detectDependencies } from "../utils/sandpackUtils";
import { useAppContext } from "../context/AppContext";
import SandpackErrorMonitor from "./SandpackErrorMonitor";

// Convert a stored file value into a string safely.
const getFileContent = (file) => {
  if (typeof file === "string") return file;
  if (typeof file?.content === "string") return file.content;
  return "";
};

// Watches Sandpack changes and syncs them with the application.
function SandpackFileWatcher({ onLiveFilesChange }) {
  const { sandpack } = useSandpack();
  const { files } = sandpack;

  const { activeProject, updateProjectFiles } = useAppContext();

  const activeProjectRef = useRef(activeProject);
  const updateProjectFilesRef = useRef(updateProjectFiles);
  const onLiveFilesChangeRef = useRef(onLiveFilesChange);
  const saveTimerRef = useRef(null);

  // Keep refs updated without restarting the file watcher.
  activeProjectRef.current = activeProject;
  updateProjectFilesRef.current = updateProjectFiles;
  onLiveFilesChangeRef.current = onLiveFilesChange;

  useEffect(() => {
    const project = activeProjectRef.current;

    if (!project) return;

    const projectFiles = project.files || {};
    const updatedFiles = {};
    let hasChanges = false;

    // Convert Sandpack files into a plain path -> code object.
    for (const [path, fileObj] of Object.entries(files || {})) {
      const fileCode = fileObj.code ?? "";

      updatedFiles[path] = fileCode;

      const originalContent = getFileContent(projectFiles[path]);

      if (originalContent !== fileCode) {
        hasChanges = true;
      }
    }

    // Update the live preview state immediately.
    onLiveFilesChangeRef.current(updatedFiles);

    // Cancel an earlier pending save.
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }

    // Save only when file contents actually differ.
    if (hasChanges) {
      saveTimerRef.current = setTimeout(() => {
        updateProjectFilesRef.current(updatedFiles);
        saveTimerRef.current = null;
      }, 600);
    }

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
    };
  }, [files]);

  return null;
}

const PreviewPanel = ({ project, activeFile, showCode }) => {
  const [showErrorOverlay, setShowErrorOverlay] = useState(true);

  const [liveFiles, setLiveFiles] = useState(
    () => project.files || {}
  );

  // Reset local files when switching projects.
  const previousProjectIdRef = useRef(project._id);

  useEffect(() => {
    if (previousProjectIdRef.current !== project._id) {
      previousProjectIdRef.current = project._id;
      setLiveFiles(project.files || {});
    }
  }, [project._id, project.files]);

  // Keep state updates stable across renders.
  const handleLiveFilesChange = useCallback((newFiles) => {
    setLiveFiles((previousFiles) => {
      const previousPaths = Object.keys(previousFiles || {});
      const newPaths = Object.keys(newFiles || {});

      if (previousPaths.length !== newPaths.length) {
        return newFiles;
      }

      for (const [path, code] of Object.entries(newFiles)) {
        if (getFileContent(previousFiles[path]) !== code) {
          return newFiles;
        }
      }

      return previousFiles;
    });
  }, []);

  // Convert project files to the format Sandpack expects.
  const sandpackFiles = useMemo(() => {
    const result = {};

    for (const [path, content] of Object.entries(liveFiles || {})) {
      result[path] = {
        code: getFileContent(content),
        active: path === activeFile,
      };
    }

    return result;
  }, [liveFiles, activeFile]);

  // Detect dependencies from the current project files.
  const dependencies = useMemo(() => {
    return detectDependencies(liveFiles || {});
  }, [liveFiles]);

  if (!project) {
    return <div className="h-full w-full">No project selected.</div>;
  }

  return (
    <div className="h-full w-full">
      <SandpackProvider
        key={project._id}
        template="react"
        files={sandpackFiles}
        customSetup={{ dependencies }}
        options={{
          externalResources: [
            "https://cdn.tailwindcss.com",
            "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
          ],
          classes: {
            "sp-wrapper": "sp-wrapper",
            "sp-layout": "sp-layout",
            "sp-preview": "sp-preview",
          },
          logLevel: 0,
        }}
        theme={{
          colors: {
            surface1: "#ffffff",
            surface2: "#f4f4f5",
            surface3: "#e4e4e7",
            clickable: "#71717a",
            base: "#09090b",
            disabled: "#a1a1aa",
            hover: "#18181b",
            accent: "#18181b",
            error: "#ef4444",
            errorSurface: "#fef2f2",
          },
          font: {
            body: "'Urbanist', system-ui, -apple-system, sans-serif",
            mono: "'Geist Mono', ui-monospace, monospace",
            size: "13px",
            lineHeight: "1.6",
          },
        }}
      >
        <SandpackFileWatcher
          onLiveFilesChange={handleLiveFilesChange}
        />

        <SandpackErrorMonitor
          onErrorChange={setShowErrorOverlay}
        />

        <SandpackLayout
          style={{
            height: "100%",
            border: "none",
            borderRadius: 0,
            background: "transparent",
          }}
        >
          {showCode && (
            <SandpackCodeEditor
              showTabs
              showLineNumbers
              showInlineErrors
              wrapContent
              style={{
                height: "100%",
                flex: 1,
                minWidth: 0,
              }}
            />
          )}

          <SandpackPreview
            showNavigator={false}
            showRefreshButton
            showOpenInCodeSandbox={false}
            showSandpackErrorOverlay={showErrorOverlay}
            style={{
              height: "100%",
              flex: showCode ? 1 : 2,
              minWidth: 0,
            }}
          />
        </SandpackLayout>
      </SandpackProvider>
    </div>
  );
};

export default PreviewPanel;
