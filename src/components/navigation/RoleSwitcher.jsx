import { useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth.js';

const RoleSwitcher = () => {
  const { user, roles, switchRole } = useAuth();
  const options = useMemo(() => roles, [roles]);

  if (!user) {
    return null;
  }

  return (
    <label className="role-switcher">
      <span>Role</span>
      <select value={user.role} onChange={(event) => switchRole(event.target.value)}>
        {options.map((roleOption) => (
          <option key={roleOption.id} value={roleOption.id}>
            {roleOption.label}
          </option>
        ))}
      </select>
    </label>
  );
};

export default RoleSwitcher;
