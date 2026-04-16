import { Outlet } from 'react-router-dom';

export default function BareLayout() {
  return (
    <div style={{ height: '100dvh', overflow: 'hidden' }}>
      <Outlet />
    </div>
  );
}
