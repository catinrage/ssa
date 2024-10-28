import { getContext, setContext } from 'svelte';
import { ProjectManager, type ProjectManagerData } from '../models/project.svelte';

const CONTEXT_KEY = Symbol('PM_CONTEXT');

export function setProjectManager(data: ProjectManagerData) {
  return setContext(CONTEXT_KEY, new ProjectManager(data));
}

export function getProjectManager() {
  return getContext<ReturnType<typeof setProjectManager>>(CONTEXT_KEY);
}
