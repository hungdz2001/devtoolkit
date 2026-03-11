import { useNavigate } from 'react-router-dom';
import { TbHome } from 'react-icons/tb';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center">
      <div className="text-8xl font-extrabold gradient-text mb-4">404</div>
      <p className="text-lg text-[var(--text-secondary)] mb-8">
        Page not found
      </p>
      <button onClick={() => navigate('/')} className="btn-primary flex items-center gap-2">
        <TbHome size={18} />
        Go Home
      </button>
    </div>
  );
}
