import { useParams } from 'react-router-dom';
import { Suspense, useEffect } from 'react';
import { getToolById } from '../registry';
import { useStore } from '../store';
import ToolLayout from '../layouts/ToolLayout';
import NotFound from './NotFound';

export default function ToolPage() {
  const { toolId } = useParams<{ toolId: string }>();
  const addRecent = useStore((s) => s.addRecent);
  const tool = toolId ? getToolById(toolId) : undefined;

  useEffect(() => {
    if (toolId) addRecent(toolId);
  }, [toolId, addRecent]);

  if (!tool) return <NotFound />;

  const Component = tool.component;

  return (
    <ToolLayout toolId={tool.id} icon={tool.icon}>
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <Component />
      </Suspense>
    </ToolLayout>
  );
}
